from authlib.integrations.starlette_client import OAuth
from authlib.integrations.base_client import OAuthError
from fastapi import HTTPException, status
from typing import Dict, Any
import secrets
import base64
import hashlib
from .config import settings
from .auth import create_user_tokens
from .database import database
from datetime import datetime, timezone

# OIDC OAuth 클라이언트 설정
oauth = OAuth()

if settings.OIDC_ENABLED:
    oauth.register(
        name='oidc',
        client_id=settings.OIDC_CLIENT_ID,
        client_secret=settings.OIDC_CLIENT_SECRET,
        server_metadata_url=settings.OIDC_DISCOVERY_URL,
        client_kwargs={
            'scope': settings.OIDC_SCOPES
        }
    )

class OIDCAuth:
    def __init__(self):
        self.oauth = oauth
        self.sessions = {}  # 임시 세션 저장 (실제 환경에서는 Redis 등 사용)
    
    def generate_state(self) -> str:
        """CSRF 보호를 위한 state 파라미터 생성"""
        return secrets.token_urlsafe(32)
    
    def generate_pkce(self) -> Dict[str, str]:
        """PKCE (Proof Key for Code Exchange) 파라미터 생성"""
        code_verifier = base64.urlsafe_b64encode(secrets.token_bytes(32)).decode('utf-8').rstrip('=')
        code_challenge = base64.urlsafe_b64encode(
            hashlib.sha256(code_verifier.encode('utf-8')).digest()
        ).decode('utf-8').rstrip('=')
        
        return {
            'code_verifier': code_verifier,
            'code_challenge': code_challenge,
            'code_challenge_method': 'S256'
        }
    
    async def get_authorization_url(self) -> Dict[str, str]:
        """OIDC 인증 URL 생성"""
        if not settings.OIDC_ENABLED:
            raise HTTPException(
                status_code=status.HTTP_501_NOT_IMPLEMENTED,
                detail="OIDC is not enabled"
            )
        
        state = self.generate_state()
        pkce = self.generate_pkce()
        
        # 세션에 state와 code_verifier 저장
        self.sessions[state] = {
            'code_verifier': pkce['code_verifier'],
            'created_at': datetime.now(timezone.utc)
        }
        
        try:
            # 올바른 방식으로 authorization URL 생성
            auth_response = await self.oauth.oidc.create_authorization_url(
                redirect_uri=settings.OIDC_REDIRECT_URI,
                state=state,
                code_challenge=pkce['code_challenge'],
                code_challenge_method=pkce['code_challenge_method']
            )
            
            # authlib는 딕셔너리를 반환할 수 있습니다
            if isinstance(auth_response, dict):
                authorization_url = auth_response.get('url', str(auth_response))
            else:
                authorization_url = str(auth_response)
            
            return {
                'authorization_url': authorization_url,
                'state': state
            }
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create authorization URL: {str(e)}"
            )
    
    async def handle_callback(self, code: str, state: str) -> Dict[str, Any]:
        """OIDC 콜백 처리"""
        if not settings.OIDC_ENABLED:
            raise HTTPException(
                status_code=status.HTTP_501_NOT_IMPLEMENTED,
                detail="OIDC is not enabled"
            )
        
        # State 검증
        if state not in self.sessions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid state parameter"
            )
        
        session_data = self.sessions.pop(state)
        code_verifier = session_data['code_verifier']
        
        try:
            # 더미 서버를 위한 직접 토큰 교환
            if "dummy-oidc" in settings.OIDC_DISCOVERY_URL:
                user_info = await self._handle_dummy_token_exchange(code, code_verifier)
            else:
                # 실제 OIDC 서버용 토큰 교환
                token = await self.oauth.oidc.fetch_access_token(
                    code=code,
                    redirect_uri=settings.OIDC_REDIRECT_URI,
                    code_verifier=code_verifier
                )
                
                # 사용자 정보 가져오기
                user_info = None
                if isinstance(token, dict) and 'userinfo' in token:
                    user_info = token['userinfo']
                elif 'id_token' in token:
                    try:
                        import jwt as pyjwt
                        id_token_payload = pyjwt.decode(
                            token['id_token'], 
                            options={"verify_signature": False}
                        )
                        user_info = id_token_payload
                    except Exception:
                        pass
                
                if not user_info:
                    user_info = {}
            
            # 사용자 정보 처리
            user = await self.process_user_info(user_info)
            
            # JWT 토큰 생성
            tokens = await create_user_tokens(user)
            
            return {
                'user': user,
                'tokens': tokens
            }
            
        except OAuthError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"OAuth error: {str(e)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Authentication failed: {str(e)}"
            )
    
    async def process_user_info(self, user_info: Dict[str, Any]) -> Dict[str, Any]:
        """OIDC 사용자 정보를 내부 사용자 형식으로 변환"""
        # 필수 필드 확인
        if not user_info.get('sub'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user info: missing subject"
            )
        
        # 사용자 정보 매핑
        oidc_sub = user_info['sub']
        email = user_info.get('email', '')
        username = user_info.get('preferred_username') or user_info.get('name') or email.split('@')[0]
        
        try:
            collection = database.get_collection("users")
            
            # 기존 사용자 확인 (OIDC sub로)
            existing_user = await collection.find_one({"oidc_sub": oidc_sub})
            
            current_time = datetime.now(timezone.utc).isoformat()
            
            if existing_user:
                # 기존 사용자 정보 업데이트
                update_data = {
                    "email": email,
                    "updated_at": current_time,
                    "last_login": current_time
                }
                
                await collection.update_one(
                    {"_id": existing_user["_id"]},
                    {"$set": update_data}
                )
                
                user = existing_user
                user.update(update_data)
            else:
                # 새 사용자 생성
                # 사용자명 중복 체크 및 고유화
                base_username = username
                counter = 1
                while await collection.find_one({"username": username}):
                    username = f"{base_username}_{counter}"
                    counter += 1
                
                new_user = {
                    "username": username,
                    "email": email,
                    "oidc_sub": oidc_sub,
                    "role": "user",
                    "is_active": True,
                    "auth_provider": "oidc",
                    "created_at": current_time,
                    "updated_at": current_time,
                    "last_login": current_time
                }
                
                result = await collection.insert_one(new_user)
                user = new_user
                user["_id"] = result.inserted_id
            
            # 응답 형식으로 변환
            user["user_id"] = str(user["_id"])
            user.pop("_id", None)
            user.pop("password", None)  # OIDC 사용자는 비밀번호가 없음
            
            return user
            
        except Exception as e:
            # 데이터베이스 오류 시 임시 사용자 반환 (개발 환경용)
            return {
                "user_id": f"oidc-{oidc_sub}",
                "username": username,
                "email": email,
                "oidc_sub": oidc_sub,
                "role": "user",
                "is_active": True,
                "auth_provider": "oidc",
                "created_at": current_time
            }
    
    async def _handle_dummy_token_exchange(self, code: str, code_verifier: str) -> Dict[str, Any]:
        """더미 OIDC 서버를 위한 직접 토큰 교환"""
        import httpx
        
        # 더미 서버의 토큰 엔드포인트에 직접 요청
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.OIDC_DISCOVERY_URL.replace('/.well-known/openid_configuration', '/token')}",
                data={
                    "grant_type": "authorization_code",
                    "code": code,
                    "redirect_uri": settings.OIDC_REDIRECT_URI,
                    "client_id": settings.OIDC_CLIENT_ID,
                    "code_verifier": code_verifier
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Token exchange failed: {response.text}"
                )
            
            token_data = response.json()
            
            # userinfo가 토큰 응답에 포함되어 있으면 반환
            if 'userinfo' in token_data:
                return token_data['userinfo']
            
            # ID token에서 사용자 정보 추출
            if 'id_token' in token_data:
                try:
                    import jwt as pyjwt
                    id_token_payload = pyjwt.decode(
                        token_data['id_token'], 
                        options={"verify_signature": False}
                    )
                    return id_token_payload
                except Exception:
                    pass
            
            # 기본값
            return {}

# OIDC 인스턴스
oidc_auth = OIDCAuth()
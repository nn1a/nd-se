import base64
import hashlib
import secrets
import urllib.parse
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

import jwt
from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import HTMLResponse, RedirectResponse

router = APIRouter()

# 더미 사용자 데이터
DUMMY_USERS = {
    "admin": {
        "sub": "dummy-admin-123",
        "preferred_username": "admin",
        "name": "Admin User",
        "given_name": "Admin",
        "family_name": "User",
        "email": "admin@example.com",
        "email_verified": True,
        "picture": "https://via.placeholder.com/150",
    },
    "user": {
        "sub": "dummy-user-456",
        "preferred_username": "user",
        "name": "Test User",
        "given_name": "Test",
        "family_name": "User",
        "email": "user@example.com",
        "email_verified": True,
        "picture": "https://via.placeholder.com/150",
    },
    "developer": {
        "sub": "dummy-dev-789",
        "preferred_username": "developer",
        "name": "Developer User",
        "given_name": "Developer",
        "family_name": "User",
        "email": "dev@example.com",
        "email_verified": True,
        "picture": "https://via.placeholder.com/150",
    },
}

# 임시 저장소 (실제 환경에서는 Redis 등 사용)
auth_codes = {}
access_tokens = {}
refresh_tokens = {}

# JWT 설정 (실제로는 더 복잡한 키 관리 필요)
JWT_SECRET = "dummy-oidc-secret-key-for-development-only"
JWT_ALGORITHM = "HS256"


def generate_jwt_token(payload: Dict[str, Any], expires_delta: timedelta) -> str:
    """JWT 토큰 생성"""
    expire = datetime.now(timezone.utc) + expires_delta
    payload.update(
        {
            "exp": expire,
            "iat": datetime.now(timezone.utc),
            "iss": "http://localhost:8000/dummy-oidc",
        }
    )
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verify_jwt_token(token: str) -> Optional[Dict[str, Any]]:
    """JWT 토큰 검증"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


@router.get("/.well-known/openid_configuration")
async def openid_configuration(request: Request):
    """OIDC Discovery Document"""
    base_url = f"http://{request.headers.get('host', 'localhost:8000')}/dummy-oidc"

    return {
        "issuer": base_url,
        "authorization_endpoint": f"{base_url}/auth",
        "token_endpoint": f"{base_url}/token",
        "userinfo_endpoint": f"{base_url}/userinfo",
        "jwks_uri": f"{base_url}/jwks",
        "response_types_supported": ["code"],
        "subject_types_supported": ["public"],
        "id_token_signing_alg_values_supported": ["HS256"],
        "scopes_supported": ["openid", "profile", "email"],
        "claims_supported": [
            "sub",
            "iss",
            "aud",
            "exp",
            "iat",
            "name",
            "given_name",
            "family_name",
            "preferred_username",
            "email",
            "email_verified",
            "picture",
        ],
        "code_challenge_methods_supported": ["S256"],
    }


@router.get("/jwks")
async def jwks():
    """JSON Web Key Set (간단한 더미 구현)"""
    return {
        "keys": [
            {
                "kty": "oct",
                "use": "sig",
                "kid": "dummy-key-1",
                "alg": "HS256",
                "k": base64.urlsafe_b64encode(JWT_SECRET.encode()).decode().rstrip("="),
            }
        ]
    }


@router.get("/auth", response_class=HTMLResponse)
async def authorization_endpoint(
    request: Request,
    client_id: str,
    redirect_uri: str,
    response_type: str = "code",
    scope: str = "openid profile email",
    state: Optional[str] = None,
    code_challenge: Optional[str] = None,
    code_challenge_method: Optional[str] = None,
):
    """인증 엔드포인트 - 로그인 페이지 표시"""

    if response_type != "code":
        raise HTTPException(status_code=400, detail="Unsupported response_type")

    # 간단한 로그인 페이지 HTML
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Dummy OIDC Provider - Login</title>
        <style>
            body {{ font-family: Arial, sans-serif; max-width: 400px; margin: 50px auto; padding: 20px; }}
            .form-group {{ margin: 15px 0; }}
            label {{ display: block; margin-bottom: 5px; font-weight: bold; }}
            select, input {{ width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }}
            button {{ width: 100%; padding: 12px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }}
            button:hover {{ background: #0056b3; }}
            .info {{ background: #f8f9fa; padding: 10px; border-radius: 4px; margin-bottom: 20px; font-size: 14px; }}
        </style>
    </head>
    <body>
        <h2>🔐 Dummy OIDC Provider</h2>
        <div class="info">
            <strong>개발용 더미 OIDC 프로바이더</strong><br>
            클라이언트: {client_id}<br>
            리다이렉트: {redirect_uri}<br>
            스코프: {scope}
        </div>

        <form method="post" action="/dummy-oidc/auth">
            <input type="hidden" name="client_id" value="{client_id}">
            <input type="hidden" name="redirect_uri" value="{redirect_uri}">
            <input type="hidden" name="response_type" value="{response_type}">
            <input type="hidden" name="scope" value="{scope}">
            <input type="hidden" name="state" value="{state or ''}">
            <input type="hidden" name="code_challenge" value="{code_challenge or ''}">
            <input type="hidden" name="code_challenge_method" value="{code_challenge_method or ''}">

            <div class="form-group">
                <label for="user">사용자 선택:</label>
                <select name="user" id="user" required>
                    <option value="">-- 사용자 선택 --</option>
                    <option value="admin">👨‍💼 Admin (admin@example.com)</option>
                    <option value="user">👤 User (user@example.com)</option>
                    <option value="developer">👨‍💻 Developer (dev@example.com)</option>
                </select>
            </div>

            <button type="submit">🚀 로그인</button>
        </form>

        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
            이것은 개발용 더미 OIDC 프로바이더입니다. 프로덕션에서는 사용하지 마세요.
        </div>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)


@router.post("/auth")
async def authorization_post(request: Request):
    """인증 POST 처리 - 인증 코드 생성 및 리다이렉트"""

    # Form 데이터 파싱
    form_data = await request.form()

    client_id = form_data.get("client_id")
    redirect_uri = form_data.get("redirect_uri")
    response_type = form_data.get("response_type")
    scope = form_data.get("scope")
    state = form_data.get("state")
    code_challenge = form_data.get("code_challenge")
    code_challenge_method = form_data.get("code_challenge_method")
    user = form_data.get("user")

    if not all([client_id, redirect_uri, response_type, scope, user]):
        raise HTTPException(status_code=400, detail="Missing required parameters")

    if user not in DUMMY_USERS:
        raise HTTPException(status_code=400, detail="Invalid user")

    # 인증 코드 생성
    auth_code = secrets.token_urlsafe(32)

    # 인증 코드 정보 저장
    auth_codes[auth_code] = {
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "scope": scope,
        "user": DUMMY_USERS[user],
        "code_challenge": code_challenge,
        "code_challenge_method": code_challenge_method,
        "expires_at": datetime.now(timezone.utc) + timedelta(minutes=10),
        "used": False,
    }

    # 리다이렉트 URL 구성
    redirect_params = f"code={auth_code}"
    if state:
        redirect_params += f"&state={state}"

    redirect_url = f"{redirect_uri}?{redirect_params}"
    return RedirectResponse(url=redirect_url)


@router.post("/token")
async def token_endpoint(request: Request):
    """토큰 엔드포인트"""

    # Form 데이터 파싱
    form_data = await request.form()

    grant_type = form_data.get("grant_type")
    code = form_data.get("code")
    redirect_uri = form_data.get("redirect_uri")
    client_id = form_data.get("client_id")
    code_verifier = form_data.get("code_verifier")
    refresh_token = form_data.get("refresh_token")

    if not grant_type:
        raise HTTPException(status_code=400, detail="Missing grant_type")

    if grant_type == "authorization_code":
        return await handle_authorization_code_grant(
            code, redirect_uri, client_id, code_verifier
        )
    elif grant_type == "refresh_token":
        return await handle_refresh_token_grant(refresh_token)
    else:
        raise HTTPException(status_code=400, detail="Unsupported grant_type")


async def handle_authorization_code_grant(
    code: str, redirect_uri: str, client_id: str, code_verifier: Optional[str]
):
    """Authorization Code Grant 처리"""

    if not code or code not in auth_codes:
        raise HTTPException(status_code=400, detail="Invalid authorization code")

    auth_data = auth_codes[code]

    # 인증 코드 유효성 검증
    if auth_data["used"]:
        raise HTTPException(status_code=400, detail="Authorization code already used")

    if datetime.now(timezone.utc) > auth_data["expires_at"]:
        raise HTTPException(status_code=400, detail="Authorization code expired")

    if auth_data["client_id"] != client_id:
        raise HTTPException(status_code=400, detail="Invalid client_id")

    if auth_data["redirect_uri"] != redirect_uri:
        raise HTTPException(status_code=400, detail="Invalid redirect_uri")

    # PKCE 검증 (선택사항)
    if auth_data.get("code_challenge"):
        if not code_verifier:
            # 개발 환경에서는 PKCE를 생략할 수 있도록 함
            print(
                "Warning: PKCE challenge present but no verifier provided. Skipping PKCE validation for development."
            )
        else:
            # S256 방식 검증
            if auth_data.get("code_challenge_method") == "S256":
                expected_challenge = (
                    base64.urlsafe_b64encode(
                        hashlib.sha256(code_verifier.encode()).digest()
                    )
                    .decode()
                    .rstrip("=")
                )

                if expected_challenge != auth_data["code_challenge"]:
                    raise HTTPException(status_code=400, detail="Invalid code verifier")

    # 인증 코드 사용 처리
    auth_codes[code]["used"] = True
    user_data = auth_data["user"]

    # 토큰 생성
    access_token_payload = {
        "sub": user_data["sub"],
        "aud": client_id,
        "scope": auth_data["scope"],
        "token_type": "access_token",
    }

    id_token_payload = {
        "sub": user_data["sub"],
        "aud": client_id,
        "nonce": None,
        **user_data,
    }

    refresh_token_payload = {
        "sub": user_data["sub"],
        "aud": client_id,
        "token_type": "refresh_token",
    }

    access_token = generate_jwt_token(access_token_payload, timedelta(hours=1))
    id_token = generate_jwt_token(id_token_payload, timedelta(hours=1))
    new_refresh_token = generate_jwt_token(refresh_token_payload, timedelta(days=30))

    # 토큰 저장
    access_tokens[access_token] = {
        "user": user_data,
        "client_id": client_id,
        "scope": auth_data["scope"],
        "expires_at": datetime.now(timezone.utc) + timedelta(hours=1),
    }

    refresh_tokens[new_refresh_token] = {
        "user": user_data,
        "client_id": client_id,
        "scope": auth_data["scope"],
        "expires_at": datetime.now(timezone.utc) + timedelta(days=30),
    }

    return {
        "access_token": access_token,
        "token_type": "Bearer",
        "expires_in": 3600,
        "id_token": id_token,
        "refresh_token": new_refresh_token,
        "scope": auth_data["scope"],
        "userinfo": user_data,
    }


async def handle_refresh_token_grant(refresh_token: str):
    """Refresh Token Grant 처리"""

    if not refresh_token or refresh_token not in refresh_tokens:
        raise HTTPException(status_code=400, detail="Invalid refresh token")

    token_data = refresh_tokens[refresh_token]

    if datetime.now(timezone.utc) > token_data["expires_at"]:
        raise HTTPException(status_code=400, detail="Refresh token expired")

    user_data = token_data["user"]
    client_id = token_data["client_id"]
    scope = token_data["scope"]

    # 새 액세스 토큰 생성
    access_token_payload = {
        "sub": user_data["sub"],
        "aud": client_id,
        "scope": scope,
        "token_type": "access_token",
    }

    new_access_token = generate_jwt_token(access_token_payload, timedelta(hours=1))

    # 새 액세스 토큰 저장
    access_tokens[new_access_token] = {
        "user": user_data,
        "client_id": client_id,
        "scope": scope,
        "expires_at": datetime.now(timezone.utc) + timedelta(hours=1),
    }

    return {
        "access_token": new_access_token,
        "token_type": "Bearer",
        "expires_in": 3600,
        "scope": scope,
    }


@router.get("/userinfo")
async def userinfo_endpoint(request: Request):
    """사용자 정보 엔드포인트"""

    # Authorization 헤더에서 토큰 추출
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    access_token = auth_header.split(" ", 1)[1]

    # 토큰 검증
    if access_token not in access_tokens:
        raise HTTPException(status_code=401, detail="Invalid access token")

    token_data = access_tokens[access_token]

    if datetime.now(timezone.utc) > token_data["expires_at"]:
        raise HTTPException(status_code=401, detail="Access token expired")

    return token_data["user"]


@router.get("/")
async def dummy_oidc_info():
    """더미 OIDC 프로바이더 정보"""
    return {
        "name": "Dummy OIDC Provider",
        "version": "1.0.0",
        "description": "Development-only OIDC provider for testing",
        "endpoints": {
            "discovery": "/.well-known/openid_configuration",
            "authorization": "/auth",
            "token": "/token",
            "userinfo": "/userinfo",
            "jwks": "/jwks",
        },
        "available_users": list(DUMMY_USERS.keys()),
        "note": "이 프로바이더는 개발 목적으로만 사용하세요.",
    }

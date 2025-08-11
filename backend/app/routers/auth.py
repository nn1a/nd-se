from fastapi import APIRouter, HTTPException, status, Depends, Request
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

from ..core.auth import (
    verify_password, 
    get_password_hash,
    validate_password,
    verify_token,
    authenticate_user,
    create_user_tokens,
    get_current_user
)
from ..core.database import database
from ..core.oidc import oidc_auth
from ..core.config import settings

router = APIRouter()

# 비밀번호 없이 사용자 확인을 위한 헬퍼 함수
async def authenticate_user_no_password(username: str):
    """비밀번호 없이 사용자 존재 확인 (refresh token 용)"""
    try:
        collection = database.get_collection("users")
        user = await collection.find_one({"username": username})
        
        if not user or not user.get("is_active", True):
            return None
        
        user["user_id"] = str(user["_id"])
        user.pop("password", None)
        user.pop("_id", None)
        
        return user
        
    except Exception:
        # 개발 환경용 더미 인증
        if username in ["admin", "user"]:
            return {
                "user_id": f"{username}-user-id",
                "username": username,
                "email": f"{username}@example.com",
                "role": "admin" if username == "admin" else "user",
                "is_active": True,
                "created_at": "2024-01-01T00:00:00Z"
            }
        return None

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    
class UserLogin(BaseModel):
    username: str
    password: str

class TokenRefresh(BaseModel):
    refresh_token: str

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

class User(BaseModel):
    user_id: str
    username: str
    email: str
    role: str = "user"
    is_active: bool = True
    created_at: str
    updated_at: Optional[str] = None

class OIDCAuthUrl(BaseModel):
    authorization_url: str
    state: str

class OIDCCallback(BaseModel):
    code: str
    state: str

class OIDCAuthResponse(BaseModel):
    user: User
    tokens: Token

@router.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """로그인 및 토큰 발급"""
    user = await authenticate_user(form_data.username, form_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    tokens = await create_user_tokens(user)
    return tokens

@router.post("/login", response_model=Token)
async def login_json(user_data: UserLogin):
    """로그인 (JSON 형식)"""
    user = await authenticate_user(user_data.username, user_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    tokens = await create_user_tokens(user)
    return tokens

@router.post("/register", response_model=User)
async def register(user_data: UserCreate):
    """사용자 등록"""
    
    # 비밀번호 유효성 검사
    if not validate_password(user_data.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be between 6 and 128 characters"
        )
    
    # 사용자명 유효성 검사
    if len(user_data.username) < 3 or len(user_data.username) > 50:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username must be between 3 and 50 characters"
        )
    
    try:
        collection = database.get_collection("users")
        
        # 사용자 중복 확인
        existing_user = await collection.find_one({"username": user_data.username})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered"
            )
        
        # 이메일 중복 확인
        existing_email = await collection.find_one({"email": str(user_data.email)})
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # 새 사용자 생성
        hashed_password = get_password_hash(user_data.password)
        current_time = datetime.utcnow().isoformat()
        
        new_user = {
            "username": user_data.username,
            "email": str(user_data.email),
            "password": hashed_password,
            "role": "user",
            "is_active": True,
            "created_at": current_time,
            "updated_at": current_time
        }
        
        result = await collection.insert_one(new_user)
        
        return User(
            user_id=str(result.inserted_id),
            username=user_data.username,
            email=str(user_data.email),
            role="user",
            is_active=True,
            created_at=current_time
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to register user: {str(e)}"
        )

@router.post("/refresh", response_model=Token)
async def refresh_token(token_data: TokenRefresh):
    """리프레시 토큰으로 새 액세스 토큰 발급"""
    payload = verify_token(token_data.refresh_token, "refresh")
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    username = payload.get("sub")
    user_id = payload.get("user_id")
    
    if not username or not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    # 사용자 상태 확인
    user = await authenticate_user_no_password(username)  # 비밀번호 확인 없이 사용자 존재 확인
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    # 새 토큰 발급
    tokens = await create_user_tokens(user)
    return tokens

@router.get("/me", response_model=User)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """현재 사용자 정보 가져오기"""
    return User(
        user_id=current_user["user_id"],
        username=current_user["username"],
        email=current_user["email"],
        role=current_user.get("role", "user"),
        is_active=current_user.get("is_active", True),
        created_at=current_user.get("created_at", ""),
        updated_at=current_user.get("updated_at")
    )

@router.post("/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: dict = Depends(get_current_user)
):
    """비밀번호 변경"""
    
    # 비밀번호 유효성 검사
    if not validate_password(password_data.new_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be between 6 and 128 characters"
        )
    
    try:
        collection = database.get_collection("users")
        
        # 현재 비밀번호 확인
        user = await collection.find_one({"_id": current_user["user_id"]})
        if not user or not verify_password(password_data.current_password, user["password"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
        
        # 새 비밀번호로 업데이트
        new_hashed_password = get_password_hash(password_data.new_password)
        await collection.update_one(
            {"_id": current_user["user_id"]},
            {
                "$set": {
                    "password": new_hashed_password,
                    "updated_at": datetime.utcnow().isoformat()
                }
            }
        )
        
        return {"message": "Password changed successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to change password: {str(e)}"
        )

@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """로그아웃 (토큰 무효화 - 실제로는 클라이언트에서 토큰 삭제)"""
    return {"message": "Logged out successfully"}

# OIDC/SSO 엔드포인트
@router.get("/oidc/login", response_model=OIDCAuthUrl)
async def oidc_login(request: Request):
    """OIDC 로그인 시작 - 인증 제공자로 리다이렉트할 URL 반환"""
    if not settings.OIDC_ENABLED:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="OIDC authentication is not enabled"
        )
    
    auth_data = await oidc_auth.get_authorization_url()
    return OIDCAuthUrl(**auth_data)

@router.get("/oidc/callback")
async def oidc_callback(request: Request, code: str, state: str):
    """OIDC 콜백 처리 - 인증 완료 후 토큰 발급"""
    if not settings.OIDC_ENABLED:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="OIDC authentication is not enabled"
        )
    
    try:
        result = await oidc_auth.handle_callback(code, state)
        
        # 프론트엔드로 리다이렉트 (토큰을 쿼리 파라미터로 전달)
        frontend_redirect_url = f"{settings.FRONTEND_URL}/auth/callback?access_token={result['tokens']['access_token']}&refresh_token={result['tokens']['refresh_token']}"
        
        return RedirectResponse(url=frontend_redirect_url)
        
    except HTTPException:
        raise
    except Exception as e:
        # 에러 발생 시 프론트엔드 에러 페이지로 리다이렉트
        error_url = f"{settings.FRONTEND_URL}/auth/error?message={str(e)}"
        return RedirectResponse(url=error_url)

@router.post("/oidc/callback")
async def oidc_callback_post(request: Request, code: str, state: str):
    """OIDC 콜백 처리 (POST 방식) - 브라우저 리다이렉트용"""
    if not settings.OIDC_ENABLED:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="OIDC authentication is not enabled"
        )
    
    try:
        print(f"OIDC POST callback received: code={code[:10]}..., state={state[:10]}...")
        result = await oidc_auth.handle_callback(code, state)
        
        # 프론트엔드로 리다이렉트 (토큰을 쿼리 파라미터로 전달)
        frontend_redirect_url = f"{settings.FRONTEND_URL}/auth/callback?access_token={result['tokens']['access_token']}&refresh_token={result['tokens']['refresh_token']}"
        
        return RedirectResponse(url=frontend_redirect_url)
        
    except HTTPException:
        raise
    except Exception as e:
        # 에러 발생 시 프론트엔드 에러 페이지로 리다이렉트
        error_url = f"{settings.FRONTEND_URL}/auth/error?message={str(e)}"
        return RedirectResponse(url=error_url)

@router.get("/oidc/status")
async def oidc_status():
    """OIDC 설정 상태 확인"""
    return {
        "enabled": settings.OIDC_ENABLED,
        "configured": bool(settings.OIDC_CLIENT_ID and settings.OIDC_CLIENT_SECRET and settings.OIDC_DISCOVERY_URL)
    }

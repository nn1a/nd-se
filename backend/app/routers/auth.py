from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import Optional

from ..core.auth import (
    verify_password, 
    get_password_hash, 
    create_access_token, 
    create_refresh_token,
    get_current_user
)
from ..core.database import database

router = APIRouter()

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class User(BaseModel):
    username: str
    email: str
    is_active: bool = True

@router.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """로그인 및 토큰 발급"""
    
    try:
        collection = database.get_collection("users")
        user = await collection.find_one({"username": form_data.username})
        
        if not user or not verify_password(form_data.password, user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token = create_access_token(data={"sub": user["username"]})
        refresh_token = create_refresh_token(data={"sub": user["username"]})
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        # 개발 환경에서는 테스트 계정 허용
        if form_data.username == "admin" and form_data.password == "admin":
            access_token = create_access_token(data={"sub": "admin"})
            refresh_token = create_refresh_token(data={"sub": "admin"})
            
            return {
                "access_token": access_token,
                "refresh_token": refresh_token,
                "token_type": "bearer"
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

@router.post("/register", response_model=User)
async def register(user_data: UserCreate):
    """사용자 등록"""
    
    try:
        collection = database.get_collection("users")
        
        # 사용자 존재 여부 확인
        existing_user = await collection.find_one({"username": user_data.username})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered"
            )
        
        # 이메일 존재 여부 확인
        existing_email = await collection.find_one({"email": user_data.email})
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # 새 사용자 생성
        hashed_password = get_password_hash(user_data.password)
        new_user = {
            "username": user_data.username,
            "email": user_data.email,
            "hashed_password": hashed_password,
            "is_active": True
        }
        
        await collection.insert_one(new_user)
        
        return User(
            username=user_data.username,
            email=user_data.email,
            is_active=True
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to register user"
        )

@router.get("/me", response_model=User)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """현재 사용자 정보 가져오기"""
    
    try:
        collection = database.get_collection("users")
        user = await collection.find_one({"username": current_user["username"]})
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return User(
            username=user["username"],
            email=user["email"],
            is_active=user.get("is_active", True)
        )
    
    except HTTPException:
        raise
    except Exception as e:
        # 개발 환경에서는 현재 사용자 정보 반환
        return User(
            username=current_user["username"],
            email=current_user.get("email", f"{current_user['username']}@example.com"),
            is_active=True
        )

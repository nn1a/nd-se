from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import os
import json

from .routers import docs, blog, forum, dashboard, auth, analytics, users
from .core.config import settings
from .core.database import database
from .core.auth import get_current_user

app = FastAPI(
    title="ND-SE API",
    description="API for ND-SE Documentation System",
    version="1.0.0",
)

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_hosts_list,  # 설정에서 가져온 허용 호스트 목록
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(docs.router, prefix="/api/docs", tags=["docs"])
app.include_router(blog.router, prefix="/api/blog", tags=["blog"])
app.include_router(forum.router, prefix="/api/forum", tags=["forum"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(users.router, prefix="/api/users", tags=["users"])

@app.on_event("startup")
async def startup_event():
    """애플리케이션 시작 시 실행"""
    await database.connect()
    print("Connected to database")

@app.on_event("shutdown")
async def shutdown_event():
    """애플리케이션 종료 시 실행"""
    await database.disconnect()
    print("Disconnected from database")

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "ND-SE API Server",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    """헬스 체크 엔드포인트"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )

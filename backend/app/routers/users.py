from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()


class User(BaseModel):
    id: str
    username: str
    email: str
    full_name: str
    is_active: bool = True
    is_superuser: bool = False
    created_at: datetime
    last_login: Optional[datetime] = None
    role: str = "user"


# Mock data
mock_users = [
    {
        "id": "1",
        "username": "admin",
        "email": "admin@example.com",
        "full_name": "시스템 관리자",
        "is_active": True,
        "is_superuser": True,
        "created_at": "2024-01-01T00:00:00Z",
        "last_login": "2024-01-20T09:00:00Z",
        "role": "admin",
    },
    {
        "id": "2",
        "username": "editor1",
        "email": "editor@example.com",
        "full_name": "김편집",
        "is_active": True,
        "is_superuser": False,
        "created_at": "2024-01-05T10:30:00Z",
        "last_login": "2024-01-19T15:45:00Z",
        "role": "editor",
    },
    {
        "id": "3",
        "username": "user1",
        "email": "user1@example.com",
        "full_name": "이사용자",
        "is_active": True,
        "is_superuser": False,
        "created_at": "2024-01-10T14:20:00Z",
        "last_login": "2024-01-18T11:30:00Z",
        "role": "user",
    },
    {
        "id": "4",
        "username": "user2",
        "email": "user2@example.com",
        "full_name": "박독자",
        "is_active": True,
        "is_superuser": False,
        "created_at": "2024-01-12T16:45:00Z",
        "last_login": "2024-01-17T09:15:00Z",
        "role": "user",
    },
    {
        "id": "5",
        "username": "inactive_user",
        "email": "inactive@example.com",
        "full_name": "최비활성",
        "is_active": False,
        "is_superuser": False,
        "created_at": "2024-01-08T12:00:00Z",
        "last_login": "2024-01-10T08:30:00Z",
        "role": "user",
    },
]


@router.get("/", response_model=List[User])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    active: Optional[bool] = None,
    role: Optional[str] = None,
):
    """사용자 목록 조회"""
    users = mock_users

    # 활성 상태 필터
    if active is not None:
        users = [u for u in users if u["is_active"] == active]

    # 역할 필터
    if role:
        users = [u for u in users if u["role"] == role]

    return users[skip : skip + limit]


@router.get("/{user_id}", response_model=User)
async def get_user(user_id: str):
    """특정 사용자 조회"""
    for user in mock_users:
        if user["id"] == user_id:
            return user
    raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다")


@router.get("/stats")
async def get_user_stats():
    """사용자 통계 정보"""
    total_users = len(mock_users)
    active_users = len([u for u in mock_users if u["is_active"]])
    inactive_users = total_users - active_users
    admin_users = len([u for u in mock_users if u["is_superuser"]])

    # 역할별 통계
    role_stats = {}
    for user in mock_users:
        role = user["role"]
        role_stats[role] = role_stats.get(role, 0) + 1

    return {
        "total_users": total_users,
        "active_users": active_users,
        "inactive_users": inactive_users,
        "admin_users": admin_users,
        "role_distribution": role_stats,
        "recent_signups": sorted(
            mock_users, key=lambda x: x["created_at"], reverse=True
        )[:5],
        "recent_logins": sorted(
            [u for u in mock_users if u["last_login"]],
            key=lambda x: x["last_login"],
            reverse=True,
        )[:5],
    }

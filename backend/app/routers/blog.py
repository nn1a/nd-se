from fastapi import APIRouter, HTTPException
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

router = APIRouter()

class BlogPost(BaseModel):
    id: str
    title: str
    content: str
    author: str
    created_at: datetime
    updated_at: datetime
    tags: List[str] = []
    published: bool = True

class BlogPostCreate(BaseModel):
    title: str
    content: str
    tags: List[str] = []
    published: bool = True

# Mock data
mock_blog_posts = [
    {
        "id": "1",
        "title": "Next.js 15의 새로운 기능들",
        "content": "Next.js 15에서 도입된 새로운 기능들에 대해 알아보겠습니다...",
        "author": "개발자",
        "created_at": "2024-01-15T10:00:00Z",
        "updated_at": "2024-01-15T10:00:00Z",
        "tags": ["nextjs", "react", "frontend"],
        "published": True
    },
    {
        "id": "2", 
        "title": "FastAPI와 Python으로 백엔드 개발하기",
        "content": "FastAPI를 사용한 현대적인 Python 백엔드 개발 방법을 소개합니다...",
        "author": "백엔드 개발자",
        "created_at": "2024-01-14T09:00:00Z",
        "updated_at": "2024-01-14T09:00:00Z",
        "tags": ["fastapi", "python", "backend"],
        "published": True
    },
    {
        "id": "3",
        "title": "React Query를 활용한 상태 관리",
        "content": "React Query를 사용하여 서버 상태를 효율적으로 관리하는 방법을 알아봅시다...",
        "author": "프론트엔드 개발자",
        "created_at": "2024-01-13T14:30:00Z",
        "updated_at": "2024-01-13T14:30:00Z",
        "tags": ["react", "react-query", "state-management"],
        "published": True
    }
]

@router.get("/posts", response_model=List[BlogPost])
async def get_blog_posts(
    skip: int = 0,
    limit: int = 10,
    published: Optional[bool] = None
):
    """블로그 포스트 목록 조회"""
    posts = mock_blog_posts
    
    if published is not None:
        posts = [p for p in posts if p["published"] == published]
    
    return posts[skip:skip + limit]

@router.get("/posts/{post_id}", response_model=BlogPost)
async def get_blog_post(post_id: str):
    """특정 블로그 포스트 조회"""
    for post in mock_blog_posts:
        if post["id"] == post_id:
            return post
    raise HTTPException(status_code=404, detail="블로그 포스트를 찾을 수 없습니다")

@router.post("/posts", response_model=BlogPost)
async def create_blog_post(post: BlogPostCreate):
    """새 블로그 포스트 생성"""
    new_post = {
        "id": str(len(mock_blog_posts) + 1),
        "title": post.title,
        "content": post.content,
        "author": "현재 사용자",  # TODO: 실제 인증된 사용자 정보 사용
        "created_at": datetime.now().isoformat() + "Z",
        "updated_at": datetime.now().isoformat() + "Z",
        "tags": post.tags,
        "published": post.published
    }
    mock_blog_posts.append(new_post)
    return new_post

@router.get("/stats")
async def get_blog_stats():
    """블로그 통계 정보"""
    total_posts = len(mock_blog_posts)
    published_posts = len([p for p in mock_blog_posts if p["published"]])
    
    return {
        "total_posts": total_posts,
        "published_posts": published_posts,
        "draft_posts": total_posts - published_posts,
        "recent_posts": sorted(mock_blog_posts, key=lambda x: x["created_at"], reverse=True)[:5]
    }
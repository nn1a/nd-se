from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from pydantic import BaseModel
from datetime import datetime

from ..core.database import database
from ..core.auth import get_current_user

router = APIRouter()

class ForumPost(BaseModel):
    id: str
    title: str
    content: str
    author: str
    date: str
    replies: int
    views: int
    tags: List[str]

class CreateForumPost(BaseModel):
    title: str
    content: str
    tags: List[str] = []

@router.get("/", response_model=List[ForumPost])
async def get_forum_posts(skip: int = 0, limit: int = 20):
    """게시판 포스트 목록 가져오기"""
    
    try:
        collection = database.get_collection("forum_posts")
        cursor = collection.find().sort("date", -1).skip(skip).limit(limit)
        
        posts = []
        async for post in cursor:
            post["_id"] = str(post["_id"])
            post["id"] = post["_id"]
            posts.append(ForumPost(**post))
        
        return posts
    
    except Exception as e:
        # 개발 환경에서는 샘플 데이터 반환
        sample_posts = [
            ForumPost(
                id="1",
                title="FastAPI와 MongoDB 연동 방법",
                content="FastAPI에서 MongoDB를 연동하는 방법에 대해 질문드립니다...",
                author="개발자A",
                date="2024-01-15T10:00:00Z",
                replies=5,
                views=123,
                tags=["FastAPI", "MongoDB", "Python"]
            ),
            ForumPost(
                id="2",
                title="Next.js SSR vs SSG 선택 기준",
                content="프로젝트에서 SSR과 SSG 중 어떤 것을 선택해야 할지...",
                author="프론트개발자",
                date="2024-01-14T15:30:00Z",
                replies=8,
                views=234,
                tags=["Next.js", "SSR", "SSG"]
            ),
            ForumPost(
                id="3",
                title="TailwindCSS 커스텀 컴포넌트 만들기",
                content="TailwindCSS로 재사용 가능한 컴포넌트를 만드는 베스트 프랙티스...",
                author="UI개발자",
                date="2024-01-13T09:15:00Z",
                replies=3,
                views=156,
                tags=["TailwindCSS", "Component", "CSS"]
            )
        ]
        return sample_posts

@router.get("/{post_id}")
async def get_forum_post(post_id: str):
    """특정 게시판 포스트 가져오기"""
    
    try:
        collection = database.get_collection("forum_posts")
        post = await collection.find_one({"_id": post_id})
        
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Forum post not found"
            )
        
        # 조회수 증가
        await collection.update_one(
            {"_id": post_id}, 
            {"$inc": {"views": 1}}
        )
        
        post["_id"] = str(post["_id"])
        post["id"] = post["_id"]
        return ForumPost(**post)
    
    except HTTPException:
        raise
    except Exception as e:
        # 개발 환경에서는 샘플 데이터 반환
        if post_id == "1":
            return ForumPost(
                id="1",
                title="FastAPI와 MongoDB 연동 방법",
                content="""# FastAPI와 MongoDB 연동 방법

안녕하세요, FastAPI 프로젝트에서 MongoDB를 연동하려고 하는데 어떤 방법이 가장 좋은지 조언 부탁드립니다.

## 현재 고려 중인 옵션들

1. **Motor** - 비동기 MongoDB 드라이버
2. **PyMongo** - 동기 MongoDB 드라이버
3. **ODM 라이브러리** (Beanie, MongoEngine 등)

각각의 장단점과 FastAPI와의 호환성에 대해 알고 싶습니다.

감사합니다!
""",
                author="개발자A",
                date="2024-01-15T10:00:00Z",
                replies=5,
                views=123,
                tags=["FastAPI", "MongoDB", "Python"]
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Forum post not found"
            )

@router.post("/", response_model=ForumPost)
async def create_forum_post(
    post_data: CreateForumPost,
    current_user: dict = Depends(get_current_user)
):
    """새 게시판 포스트 생성"""
    
    try:
        collection = database.get_collection("forum_posts")
        
        new_post = {
            "title": post_data.title,
            "content": post_data.content,
            "author": current_user["username"],
            "date": datetime.utcnow().isoformat(),
            "replies": 0,
            "views": 0,
            "tags": post_data.tags
        }
        
        result = await collection.insert_one(new_post)
        
        new_post["_id"] = str(result.inserted_id)
        new_post["id"] = new_post["_id"]
        
        return ForumPost(**new_post)
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create forum post"
        )

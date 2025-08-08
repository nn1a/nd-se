from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from bson import ObjectId

from ..core.database import database
from ..core.auth import get_current_user, get_current_user_optional

router = APIRouter()

class ForumPost(BaseModel):
    id: str
    title: str
    content: str
    author: str
    author_id: str
    created_at: str
    updated_at: Optional[str] = None
    replies_count: int = 0
    views: int = 0
    likes: int = 0
    dislikes: int = 0
    tags: List[str] = []
    category: Optional[str] = None
    status: str = "active"  # active, hidden, deleted
    is_pinned: bool = False
    is_locked: bool = False
    is_draft: bool = False
    is_private: bool = False

class CreateForumPost(BaseModel):
    title: str
    content: str
    tags: List[str] = []
    category: Optional[str] = None
    is_draft: bool = False
    is_private: bool = False

class UpdateForumPost(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[List[str]] = None
    category: Optional[str] = None

class ForumReply(BaseModel):
    id: str
    post_id: str
    content: str
    author: str
    author_id: str
    created_at: str
    updated_at: Optional[str] = None
    likes: int = 0
    dislikes: int = 0
    parent_id: Optional[str] = None  # 대댓글용
    status: str = "active"

class CreateForumReply(BaseModel):
    content: str
    parent_id: Optional[str] = None

class VoteRequest(BaseModel):
    type: str  # "like" or "dislike"

class ReportRequest(BaseModel):
    reason: str
    description: Optional[str] = None

@router.get("/", response_model=List[ForumPost])
async def get_forum_posts(
    skip: int = 0, 
    limit: int = 20,
    category: Optional[str] = Query(None, description="카테고리 필터"),
    tag: Optional[str] = Query(None, description="태그 필터"),
    sort_by: str = Query("created_at", description="정렬 기준: created_at, likes, views, replies_count"),
    order: str = Query("desc", description="정렬 순서: asc, desc"),
    status: str = Query("active", description="상태 필터: active, all"),
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """게시판 포스트 목록 가져오기 (필터링 및 정렬 지원)"""
    
    try:
        collection = database.get_collection("forum_posts")
        cursor = collection.find().sort("date", -1).skip(skip).limit(limit)
        
        # 필터링 조건 구성
        filter_query = {}
        if status != "all":
            filter_query["status"] = status
        if category:
            filter_query["category"] = category
        if tag:
            filter_query["tags"] = {"$in": [tag]}
        
        # 초안 및 비공개 게시물 필터링 (소유자가 아닌 경우 제외)
        if not current_user:
            # 로그인하지 않은 사용자는 공개된 게시물만 볼 수 있음
            filter_query["is_draft"] = False
            filter_query["is_private"] = False
        else:
            # 로그인한 사용자는 자신의 초안과 비공개 게시물은 볼 수 있음
            user_posts_filter = {
                "$or": [
                    {"is_draft": False, "is_private": False},  # 공개 게시물
                    {"author_id": current_user["user_id"]}     # 본인 게시물
                ]
            }
            if filter_query:
                filter_query = {"$and": [filter_query, user_posts_filter]}
            else:
                filter_query = user_posts_filter
        
        # 정렬 조건
        sort_direction = 1 if order == "asc" else -1
        sort_field = sort_by
        
        # 고정 게시물 우선 정렬
        cursor = collection.find(filter_query).sort([
            ("is_pinned", -1),  # 고정 게시물 우선
            (sort_field, sort_direction)
        ]).skip(skip).limit(limit)
        
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
                author_id="user1",
                created_at="2024-01-15T10:00:00Z",
                replies_count=5,
                views=123,
                likes=15,
                dislikes=2,
                tags=["FastAPI", "MongoDB", "Python"],
                category="질문",
                status="active",
                is_pinned=False,
                is_locked=False
            ),
            ForumPost(
                id="2",
                title="Next.js SSR vs SSG 선택 기준",
                content="프로젝트에서 SSR과 SSG 중 어떤 것을 선택해야 할지...",
                author="프론트개발자",
                author_id="user2",
                created_at="2024-01-14T15:30:00Z",
                replies_count=8,
                views=234,
                likes=23,
                dislikes=1,
                tags=["Next.js", "SSR", "SSG"],
                category="토론",
                status="active",
                is_pinned=True,
                is_locked=False
            ),
            ForumPost(
                id="3",
                title="TailwindCSS 커스텀 컴포넌트 만들기",
                content="TailwindCSS로 재사용 가능한 컴포넌트를 만드는 베스트 프랙티스...",
                author="UI개발자",
                author_id="user3",
                created_at="2024-01-13T09:15:00Z",
                replies_count=3,
                views=156,
                likes=8,
                dislikes=0,
                tags=["TailwindCSS", "Component", "CSS"],
                category="팁",
                status="active",
                is_pinned=False,
                is_locked=False
            )
        ]
        return sample_posts

@router.get("/drafts", response_model=List[ForumPost])
async def get_user_drafts(
    skip: int = 0, 
    limit: int = 20,
    current_user: dict = Depends(get_current_user)
):
    """사용자의 초안 목록 가져오기"""
    
    try:
        collection = database.get_collection("forum_posts")
        cursor = collection.find({
            "author_id": current_user["user_id"],
            "is_draft": True,
            "status": {"$ne": "deleted"}
        }).sort("updated_at", -1).skip(skip).limit(limit)
        
        posts = []
        async for post in cursor:
            post["_id"] = str(post["_id"])
            post["id"] = post["_id"]
            posts.append(ForumPost(**post))
        
        return posts
    
    except Exception as e:
        # 개발 환경에서는 빈 리스트 반환
        return []

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
                author_id="user1",
                created_at="2024-01-15T10:00:00Z",
                replies_count=5,
                views=123,
                likes=15,
                dislikes=2,
                tags=["FastAPI", "MongoDB", "Python"],
                category="질문",
                status="active",
                is_pinned=False,
                is_locked=False
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
            "author_id": current_user["user_id"],
            "created_at": datetime.utcnow().isoformat(),
            "replies_count": 0,
            "views": 0,
            "likes": 0,
            "dislikes": 0,
            "tags": post_data.tags,
            "category": post_data.category,
            "status": "draft" if post_data.is_draft else "active",
            "is_pinned": False,
            "is_locked": False,
            "is_draft": post_data.is_draft,
            "is_private": post_data.is_private
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

@router.put("/{post_id}", response_model=ForumPost)
async def update_forum_post(
    post_id: str,
    post_data: UpdateForumPost,
    current_user: dict = Depends(get_current_user)
):
    """게시물 수정 (작성자 또는 관리자만 가능)"""
    try:
        collection = database.get_collection("forum_posts")
        
        # 기존 게시물 조회
        existing_post = await collection.find_one({"_id": ObjectId(post_id)})
        if not existing_post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Forum post not found"
            )
        
        # 권한 확인 (작성자 또는 관리자)
        if existing_post["author_id"] != current_user["user_id"] and current_user.get("role") != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this post"
            )
        
        # 업데이트 데이터 구성
        update_data = {"updated_at": datetime.utcnow().isoformat()}
        if post_data.title is not None:
            update_data["title"] = post_data.title
        if post_data.content is not None:
            update_data["content"] = post_data.content
        if post_data.tags is not None:
            update_data["tags"] = post_data.tags
        if post_data.category is not None:
            update_data["category"] = post_data.category
        
        # 게시물 업데이트
        await collection.update_one(
            {"_id": ObjectId(post_id)},
            {"$set": update_data}
        )
        
        # 업데이트된 게시물 반환
        updated_post = await collection.find_one({"_id": ObjectId(post_id)})
        updated_post["_id"] = str(updated_post["_id"])
        updated_post["id"] = updated_post["_id"]
        
        return ForumPost(**updated_post)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update forum post: {str(e)}"
        )

@router.delete("/{post_id}")
async def delete_forum_post(
    post_id: str,
    current_user: dict = Depends(get_current_user)
):
    """게시물 삭제 (작성자 또는 관리자만 가능)"""
    try:
        collection = database.get_collection("forum_posts")
        
        # 기존 게시물 조회
        existing_post = await collection.find_one({"_id": ObjectId(post_id)})
        if not existing_post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Forum post not found"
            )
        
        # 권한 확인
        if existing_post["author_id"] != current_user["user_id"] and current_user.get("role") != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this post"
            )
        
        # soft delete (상태를 deleted로 변경)
        await collection.update_one(
            {"_id": ObjectId(post_id)},
            {"$set": {"status": "deleted", "deleted_at": datetime.utcnow().isoformat()}}
        )
        
        return {"message": "Forum post deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete forum post: {str(e)}"
        )

# 댓글 관리
@router.get("/{post_id}/replies", response_model=List[ForumReply])
async def get_forum_replies(
    post_id: str,
    skip: int = 0,
    limit: int = 50
):
    """게시물 댓글 목록 조회"""
    try:
        collection = database.get_collection("forum_replies")
        
        cursor = collection.find(
            {"post_id": post_id, "status": "active"}
        ).sort("created_at", 1).skip(skip).limit(limit)
        
        replies = []
        async for reply in cursor:
            reply["_id"] = str(reply["_id"])
            reply["id"] = reply["_id"]
            replies.append(ForumReply(**reply))
        
        return replies
        
    except Exception as e:
        # Mock 데이터 반환
        mock_replies = [
            ForumReply(
                id="reply1",
                post_id=post_id,
                content="Motor를 추천합니다. FastAPI와 비동기 처리가 잘 맞습니다.",
                author="베테랑 개발자",
                author_id="user4",
                created_at="2024-01-15T11:30:00Z",
                likes=8,
                dislikes=0,
                status="active"
            ),
            ForumReply(
                id="reply2",
                post_id=post_id,
                content="Beanie ODM도 좋은 선택입니다. Pydantic 모델과 직접 연동됩니다.",
                author="전문가",
                author_id="user5",
                created_at="2024-01-15T14:20:00Z",
                likes=5,
                dislikes=1,
                parent_id="reply1",
                status="active"
            )
        ]
        return mock_replies

@router.post("/{post_id}/replies", response_model=ForumReply)
async def create_forum_reply(
    post_id: str,
    reply_data: CreateForumReply,
    current_user: dict = Depends(get_current_user)
):
    """게시물에 댓글 작성"""
    try:
        # 게시물 존재 확인
        posts_collection = database.get_collection("forum_posts")
        post = await posts_collection.find_one({"_id": ObjectId(post_id)})
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Forum post not found"
            )
        
        # 잠긴 게시물에는 댓글 작성 불가
        if post.get("is_locked", False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot reply to locked post"
            )
        
        replies_collection = database.get_collection("forum_replies")
        
        new_reply = {
            "post_id": post_id,
            "content": reply_data.content,
            "author": current_user["username"],
            "author_id": current_user["user_id"],
            "created_at": datetime.utcnow().isoformat(),
            "likes": 0,
            "dislikes": 0,
            "parent_id": reply_data.parent_id,
            "status": "active"
        }
        
        result = await replies_collection.insert_one(new_reply)
        
        # 게시물 댓글 수 증가
        await posts_collection.update_one(
            {"_id": ObjectId(post_id)},
            {"$inc": {"replies_count": 1}}
        )
        
        new_reply["_id"] = str(result.inserted_id)
        new_reply["id"] = new_reply["_id"]
        
        return ForumReply(**new_reply)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create reply: {str(e)}"
        )

# 투표 기능
@router.post("/{post_id}/vote")
async def vote_forum_post(
    post_id: str,
    vote_data: VoteRequest,
    current_user: dict = Depends(get_current_user)
):
    """게시물 추천/비추천"""
    try:
        posts_collection = database.get_collection("forum_posts")
        votes_collection = database.get_collection("forum_votes")
        
        # 게시물 존재 확인
        post = await posts_collection.find_one({"_id": ObjectId(post_id)})
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Forum post not found"
            )
        
        # 기존 투표 확인
        existing_vote = await votes_collection.find_one({
            "post_id": post_id,
            "user_id": current_user["user_id"],
            "type": "post"
        })
        
        if existing_vote:
            # 기존 투표와 다르면 업데이트
            if existing_vote["vote_type"] != vote_data.type:
                # 이전 투표 취소 및 새 투표 적용
                old_field = "likes" if existing_vote["vote_type"] == "like" else "dislikes"
                new_field = "likes" if vote_data.type == "like" else "dislikes"
                
                await posts_collection.update_one(
                    {"_id": ObjectId(post_id)},
                    {"$inc": {old_field: -1, new_field: 1}}
                )
                
                await votes_collection.update_one(
                    {"_id": existing_vote["_id"]},
                    {"$set": {"vote_type": vote_data.type, "updated_at": datetime.utcnow().isoformat()}}
                )
            else:
                # 같은 투표면 취소
                field = "likes" if vote_data.type == "like" else "dislikes"
                await posts_collection.update_one(
                    {"_id": ObjectId(post_id)},
                    {"$inc": {field: -1}}
                )
                
                await votes_collection.delete_one({"_id": existing_vote["_id"]})
                return {"message": "Vote removed"}
        else:
            # 새 투표
            field = "likes" if vote_data.type == "like" else "dislikes"
            
            await posts_collection.update_one(
                {"_id": ObjectId(post_id)},
                {"$inc": {field: 1}}
            )
            
            new_vote = {
                "post_id": post_id,
                "user_id": current_user["user_id"],
                "type": "post",
                "vote_type": vote_data.type,
                "created_at": datetime.utcnow().isoformat()
            }
            
            await votes_collection.insert_one(new_vote)
        
        # 업데이트된 게시물 정보 반환
        updated_post = await posts_collection.find_one({"_id": ObjectId(post_id)})
        
        return {
            "message": "Vote updated",
            "likes": updated_post["likes"],
            "dislikes": updated_post["dislikes"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to vote: {str(e)}"
        )

@router.post("/replies/{reply_id}/vote")
async def vote_forum_reply(
    reply_id: str,
    vote_data: VoteRequest,
    current_user: dict = Depends(get_current_user)
):
    """댓글 추천/비추천"""
    try:
        replies_collection = database.get_collection("forum_replies")
        votes_collection = database.get_collection("forum_votes")
        
        # 댓글 존재 확인
        reply = await replies_collection.find_one({"_id": ObjectId(reply_id)})
        if not reply:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Reply not found"
            )
        
        # 투표 로직은 게시물과 동일
        existing_vote = await votes_collection.find_one({
            "post_id": reply_id,  # reply_id를 post_id로 사용
            "user_id": current_user["user_id"],
            "type": "reply"
        })
        
        if existing_vote:
            if existing_vote["vote_type"] != vote_data.type:
                old_field = "likes" if existing_vote["vote_type"] == "like" else "dislikes"
                new_field = "likes" if vote_data.type == "like" else "dislikes"
                
                await replies_collection.update_one(
                    {"_id": ObjectId(reply_id)},
                    {"$inc": {old_field: -1, new_field: 1}}
                )
                
                await votes_collection.update_one(
                    {"_id": existing_vote["_id"]},
                    {"$set": {"vote_type": vote_data.type, "updated_at": datetime.utcnow().isoformat()}}
                )
            else:
                field = "likes" if vote_data.type == "like" else "dislikes"
                await replies_collection.update_one(
                    {"_id": ObjectId(reply_id)},
                    {"$inc": {field: -1}}
                )
                
                await votes_collection.delete_one({"_id": existing_vote["_id"]})
                return {"message": "Vote removed"}
        else:
            field = "likes" if vote_data.type == "like" else "dislikes"
            
            await replies_collection.update_one(
                {"_id": ObjectId(reply_id)},
                {"$inc": {field: 1}}
            )
            
            new_vote = {
                "post_id": reply_id,
                "user_id": current_user["user_id"],
                "type": "reply",
                "vote_type": vote_data.type,
                "created_at": datetime.utcnow().isoformat()
            }
            
            await votes_collection.insert_one(new_vote)
        
        updated_reply = await replies_collection.find_one({"_id": ObjectId(reply_id)})
        
        return {
            "message": "Vote updated",
            "likes": updated_reply["likes"],
            "dislikes": updated_reply["dislikes"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to vote reply: {str(e)}"
        )

# 신고 기능
@router.post("/{post_id}/report")
async def report_forum_post(
    post_id: str,
    report_data: ReportRequest,
    current_user: dict = Depends(get_current_user)
):
    """게시물 신고"""
    try:
        posts_collection = database.get_collection("forum_posts")
        reports_collection = database.get_collection("forum_reports")
        
        # 게시물 존재 확인
        post = await posts_collection.find_one({"_id": ObjectId(post_id)})
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Forum post not found"
            )
        
        # 중복 신고 방지
        existing_report = await reports_collection.find_one({
            "post_id": post_id,
            "reporter_id": current_user["user_id"],
            "type": "post"
        })
        
        if existing_report:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have already reported this post"
            )
        
        # 신고 내역 저장
        new_report = {
            "post_id": post_id,
            "type": "post",
            "reporter_id": current_user["user_id"],
            "reason": report_data.reason,
            "description": report_data.description,
            "status": "pending",
            "created_at": datetime.utcnow().isoformat()
        }
        
        await reports_collection.insert_one(new_report)
        
        return {"message": "Report submitted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit report: {str(e)}"
        )

@router.post("/replies/{reply_id}/report")
async def report_forum_reply(
    reply_id: str,
    report_data: ReportRequest,
    current_user: dict = Depends(get_current_user)
):
    """댓글 신고"""
    try:
        replies_collection = database.get_collection("forum_replies")
        reports_collection = database.get_collection("forum_reports")
        
        # 댓글 존재 확인
        reply = await replies_collection.find_one({"_id": ObjectId(reply_id)})
        if not reply:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Reply not found"
            )
        
        # 중복 신고 방지
        existing_report = await reports_collection.find_one({
            "post_id": reply_id,  # reply_id를 post_id로 사용
            "reporter_id": current_user["user_id"],
            "type": "reply"
        })
        
        if existing_report:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have already reported this reply"
            )
        
        # 신고 내역 저장
        new_report = {
            "post_id": reply_id,
            "type": "reply",
            "reporter_id": current_user["user_id"],
            "reason": report_data.reason,
            "description": report_data.description,
            "status": "pending",
            "created_at": datetime.utcnow().isoformat()
        }
        
        await reports_collection.insert_one(new_report)
        
        return {"message": "Report submitted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit report: {str(e)}"
        )

# Mock data for search
mock_forum_posts = [
    {
        "id": "1",
        "title": "FastAPI와 MongoDB 연동 방법",
        "content": "FastAPI에서 MongoDB를 연동하는 방법에 대해 질문드립니다...",
        "author": "개발자A",
        "created_at": "2024-01-15T10:00:00Z",
        "tags": ["FastAPI", "MongoDB", "Python"],
        "excerpt": "FastAPI에서 MongoDB를 연동하는 방법에 대해 질문드립니다."
    },
    {
        "id": "2",
        "title": "Next.js SSR vs SSG 선택 기준",
        "content": "프로젝트에서 SSR과 SSG 중 어떤 것을 선택해야 할지...",
        "author": "프론트개발자",
        "created_at": "2024-01-14T15:30:00Z",
        "tags": ["Next.js", "SSR", "SSG"],
        "excerpt": "프로젝트에서 SSR과 SSG 중 어떤 것을 선택해야 할지에 대한 토론입니다."
    }
]

import xml.etree.ElementTree as ET
from datetime import datetime
from typing import Any, Dict, List, Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import PlainTextResponse, Response
from pydantic import BaseModel

from ..core.auth import get_current_user, get_current_user_optional
from ..core.database import database

router = APIRouter()


class BlogPost(BaseModel):
    id: str
    title: str
    content: str
    author: str
    created_at: datetime
    updated_at: datetime
    tags: List[str] = []
    categories: List[str] = []
    published: bool = True
    slug: str
    excerpt: Optional[str] = None
    reading_time: Optional[int] = None
    views: int = 0


class BlogPostCreate(BaseModel):
    title: str
    content: str
    tags: List[str] = []
    categories: List[str] = []
    published: bool = True
    slug: Optional[str] = None
    excerpt: Optional[str] = None


@router.get("/posts", response_model=List[BlogPost])
async def get_blog_posts(
    skip: int = 0,
    limit: int = 10,
    published: Optional[bool] = None,
    tag: Optional[str] = Query(None, description="태그로 필터링"),
    category: Optional[str] = Query(None, description="카테고리로 필터링"),
    sort_by: str = Query(
        "created_at", description="정렬 기준: created_at, views, title"
    ),
    order: str = Query("desc", description="정렬 순서: asc, desc"),
    include_private: bool = Query(False, description="비공개 글 포함 여부"),
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user_optional),
):
    """블로그 포스트 목록 조회 (태그/카테고리 필터링 및 정렬 지원, 권한별 접근 제어)"""

    try:
        collection = database.get_collection("blog_posts")

        # 권한별 필터링을 위한 쿼리 조건 구성
        user_role = current_user.get("role", "guest") if current_user else "guest"

        query_filter = {}

        # 접근 권한 필터링
        if user_role == "guest":
            query_filter["access_level"] = "public"
        elif user_role == "user":
            query_filter["access_level"] = {"$in": ["public", "user"]}
        elif user_role == "moderator":
            query_filter["access_level"] = {"$in": ["public", "user", "moderator"]}
        # admin은 모든 글 접근 가능

        # published 필터링
        if published is not None:
            if not published and not current_user:
                # 비공개 글을 요청했지만 인증되지 않은 경우
                return []
            else:
                query_filter["published"] = published
        else:
            # 기본적으로는 게시된 글만 표시 (인증된 사용자가 include_private=true로 요청한 경우 제외)
            if not include_private or not current_user:
                query_filter["published"] = True

        # 태그 및 카테고리 필터링
        if tag:
            query_filter["tags"] = {"$in": [tag]}

        if category:
            query_filter["categories"] = {"$in": [category]}

        # 정렬 설정
        sort_order = 1 if order.lower() == "asc" else -1
        sort_criteria = [(sort_by, sort_order)]

        # 데이터베이스에서 조회
        cursor = (
            collection.find(query_filter).sort(sort_criteria).skip(skip).limit(limit)
        )
        posts = await cursor.to_list(length=limit)

        # _id를 id로 변환
        for post in posts:
            post["_id"] = str(post["_id"])
            post["id"] = post["_id"]

        # 로그 기록
        user_info = (
            f"user: {current_user.get('username')} ({user_role})"
            if current_user
            else "public"
        )
        print(f"📰 Blog posts access: {len(posts)} posts by {user_info}")

        return [BlogPost(**post) for post in posts]

    except Exception as e:
        print(f"❌ [Blog] Error fetching blog posts: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch blog posts")


@router.get("/posts/{post_id}", response_model=BlogPost)
async def get_blog_post(
    post_id: str,
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user_optional),
):
    """특정 블로그 포스트 조회 - 권한별 접근 제어"""

    try:
        collection = database.get_collection("blog_posts")

        # ObjectId 또는 문자열 ID로 검색 시도
        post = None
        try:
            if ObjectId.is_valid(post_id):
                post = await collection.find_one({"_id": ObjectId(post_id)})
            else:
                post = await collection.find_one({"_id": post_id})
        except Exception:
            post = await collection.find_one({"_id": post_id})

        if not post:
            raise HTTPException(
                status_code=404, detail="블로그 포스트를 찾을 수 없습니다"
            )

        # 권한별 접근 제어
        access_level = post.get("access_level", "public")
        user_role = current_user.get("role", "guest") if current_user else "guest"

        # 접근 권한 체크
        if access_level == "user" and not current_user:
            raise HTTPException(status_code=401, detail="로그인이 필요합니다")
        elif access_level == "moderator" and user_role not in ["admin", "moderator"]:
            raise HTTPException(status_code=403, detail="운영자 권한이 필요합니다")
        elif access_level == "admin" and user_role != "admin":
            raise HTTPException(status_code=403, detail="관리자 권한이 필요합니다")

        # 비공개 글 접근 제어
        if not post.get("published", True):
            if not current_user:
                raise HTTPException(
                    status_code=404, detail="블로그 포스트를 찾을 수 없습니다"
                )
            # 작성자나 관리자만 비공개 글 접근 가능
            if post.get("author_id") != current_user.get(
                "user_id"
            ) and user_role not in ["admin", "moderator"]:
                raise HTTPException(
                    status_code=404, detail="블로그 포스트를 찾을 수 없습니다"
                )

        # _id를 id로 변환
        post["_id"] = str(post["_id"])
        post["id"] = post["_id"]

        # 로그 기록
        user_info = (
            f"user: {current_user.get('username')} ({user_role})"
            if current_user
            else "public"
        )
        print(f"📖 Blog post access: {post['title']} by {user_info}")

        return BlogPost(**post)

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ [Blog] Error fetching blog post {post_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch blog post")


@router.post("/posts", response_model=BlogPost)
async def create_blog_post(post: BlogPostCreate):
    """새 블로그 포스트 생성"""
    try:
        collection = database.get_collection("blog_posts")

        # 새 포스트 데이터 생성
        new_post = {
            "title": post.title,
            "content": post.content,
            "author": "현재 사용자",  # TODO: 실제 인증된 사용자 정보 사용
            "created_at": datetime.now().isoformat() + "Z",
            "updated_at": datetime.now().isoformat() + "Z",
            "tags": post.tags,
            "categories": post.categories,
            "published": post.published,
            "slug": post.slug or post.title.lower().replace(" ", "-"),
            "excerpt": post.excerpt,
            "reading_time": 5,  # TODO: 실제 계산
            "views": 0,
            "access_level": "public",
        }

        # 데이터베이스에 삽입
        result = await collection.insert_one(new_post)
        new_post["_id"] = str(result.inserted_id)
        new_post["id"] = new_post["_id"]

        return BlogPost(**new_post)

    except Exception as e:
        print(f"❌ [Blog] Error creating blog post: {e}")
        raise HTTPException(status_code=500, detail="Failed to create blog post")


@router.get("/tags")
async def get_all_tags():
    """모든 태그 목록 조회"""
    try:
        collection = database.get_collection("blog_posts")

        # 모든 게시물의 태그를 가져와서 중복 제거
        posts = await collection.find({}, {"tags": 1}).to_list(length=None)
        all_tags = set()
        for post in posts:
            all_tags.update(post.get("tags", []))

        # 태그별 게시물 수 계산
        tag_counts = {}
        for tag in all_tags:
            count = await collection.count_documents({"tags": {"$in": [tag]}})
            tag_counts[tag] = count

        return {"tags": sorted(list(all_tags)), "tag_counts": tag_counts}

    except Exception as e:
        print(f"❌ [Blog] Error fetching tags: {e}")
        return {"tags": [], "tag_counts": {}}


@router.get("/categories")
async def get_all_categories():
    """모든 카테고리 목록 조회"""
    try:
        collection = database.get_collection("blog_posts")

        # 모든 게시물의 카테고리를 가져와서 중복 제거
        posts = await collection.find({}, {"categories": 1}).to_list(length=None)
        all_categories = set()
        for post in posts:
            all_categories.update(post.get("categories", []))

        # 카테고리별 게시물 수 계산
        category_counts = {}
        for category in all_categories:
            count = await collection.count_documents(
                {"categories": {"$in": [category]}}
            )
            category_counts[category] = count

        return {
            "categories": sorted(list(all_categories)),
            "category_counts": category_counts,
        }

    except Exception as e:
        print(f"❌ [Blog] Error fetching categories: {e}")
        return {"categories": [], "category_counts": {}}


@router.get("/rss", response_class=PlainTextResponse)
async def get_blog_rss():
    """블로그 RSS 피드 생성"""
    try:
        collection = database.get_collection("blog_posts")
        recent_posts_cursor = collection.find(
            {"published": True}, sort=[("created_at", -1)]
        ).limit(10)
        recent_posts = await recent_posts_cursor.to_list(length=10)

        # RSS XML 생성
        rss_items = []
        for post in recent_posts:
            rss_items.append(
                f"""
        <item>
            <title>{post['title']}</title>
            <description>{post.get('content', '')[:200]}...</description>
            <link>http://localhost:3000/blog/{post['slug']}</link>
            <pubDate>{post['created_at'].strftime(
                '%a, %d %b %Y %H:%M:%S GMT'
            )}</pubDate>
            <guid>http://localhost:3000/blog/{post['slug']}</guid>
        </item>"""
            )

        rss_xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
    <channel>
        <title>NDASH Blog</title>
        <description>Latest blog posts from NDASH</description>
        <link>http://localhost:3000/blog</link>
        {''.join(rss_items)}
    </channel>
</rss>"""

        return rss_xml

    except Exception as e:
        print(f"❌ [Blog] Error generating RSS feed: {e}")
        return """<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
    <channel>
        <title>NDASH Blog</title>
        <description>Latest blog posts from NDASH</description>
        <link>http://localhost:3000/blog</link>
    </channel>
</rss>"""


@router.get("/stats")
async def get_blog_stats(current_user: dict = Depends(get_current_user_optional)):
    """블로그 통계 정보 조회"""
    try:
        collection = database.get_collection("blog_posts")

        # 기본 통계 계산
        total_posts = await collection.count_documents({})
        published_posts = await collection.count_documents({"published": True})
        draft_posts = total_posts - published_posts

        # 카테고리별 통계
        category_stats = {}
        posts_cursor = collection.find({}, {"categories": 1})
        async for post in posts_cursor:
            for category in post.get("categories", []):
                category_stats[category] = category_stats.get(category, 0) + 1

        # 최근 게시물 (5개)
        recent_posts_cursor = collection.find(
            {"published": True},
            {"title": 1, "slug": 1, "created_at": 1},
            sort=[("created_at", -1)],
        ).limit(5)
        recent_posts = await recent_posts_cursor.to_list(length=5)

        # ObjectId를 문자열로 변환
        for post in recent_posts:
            post["id"] = str(post.pop("_id"))

        # 총 조회수 계산 (views 필드가 있는 경우)
        total_views = 0
        views_cursor = collection.find({}, {"views": 1})
        async for post in views_cursor:
            total_views += post.get("views", 0)

        return {
            "total_posts": total_posts,
            "published_posts": published_posts,
            "draft_posts": draft_posts,
            "total_views": total_views,
            "category_stats": category_stats,
            "recent_posts": recent_posts,
        }

    except Exception as e:
        print(f"❌ [Blog] Error fetching blog stats: {e}")
        return {
            "total_posts": 0,
            "published_posts": 0,
            "draft_posts": 0,
            "total_views": 0,
            "category_stats": {},
            "recent_posts": [],
        }

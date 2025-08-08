from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
import xml.etree.ElementTree as ET

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

# Mock data with enhanced fields
mock_blog_posts = [
    {
        "id": "1",
        "title": "Next.js 15의 새로운 기능들",
        "content": "Next.js 15에서 도입된 새로운 기능들에 대해 알아보겠습니다. App Router의 개선사항, Server Components의 향상된 성능, 그리고 새로운 개발자 도구들에 대해 자세히 살펴보겠습니다...",
        "author": "개발자",
        "created_at": "2024-01-15T10:00:00Z",
        "updated_at": "2024-01-15T10:00:00Z",
        "tags": ["nextjs", "react", "frontend"],
        "categories": ["프론트엔드", "튜토리얼"],
        "published": True,
        "slug": "nextjs-15-new-features",
        "excerpt": "Next.js 15에서 도입된 새로운 기능들과 개선사항들을 살펴봅니다.",
        "reading_time": 5,
        "views": 142
    },
    {
        "id": "2", 
        "title": "FastAPI와 Python으로 백엔드 개발하기",
        "content": "FastAPI를 사용한 현대적인 Python 백엔드 개발 방법을 소개합니다. 비동기 프로그래밍, 자동 API 문서화, 타입 힌트 활용법 등을 다룹니다...",
        "author": "백엔드 개발자",
        "created_at": "2024-01-14T09:00:00Z",
        "updated_at": "2024-01-14T09:00:00Z",
        "tags": ["fastapi", "python", "backend"],
        "categories": ["백엔드", "가이드"],
        "published": True,
        "slug": "fastapi-python-backend-development",
        "excerpt": "FastAPI를 활용한 현대적인 Python 백엔드 개발 방법론을 알아봅니다.",
        "reading_time": 8,
        "views": 256
    },
    {
        "id": "3",
        "title": "React Query를 활용한 상태 관리",
        "content": "React Query를 사용하여 서버 상태를 효율적으로 관리하는 방법을 알아봅시다. 캐싱 전략, 낙관적 업데이트, 에러 처리 방법 등을 다룹니다...",
        "author": "프론트엔드 개발자",
        "created_at": "2024-01-13T14:30:00Z",
        "updated_at": "2024-01-13T14:30:00Z",
        "tags": ["react", "react-query", "state-management"],
        "categories": ["프론트엔드", "상태관리"],
        "published": True,
        "slug": "react-query-state-management",
        "excerpt": "React Query를 사용한 효율적인 서버 상태 관리 방법을 살펴봅니다.",
        "reading_time": 7,
        "views": 189
    },
    {
        "id": "4",
        "title": "TypeScript 모범 사례",
        "content": "TypeScript를 효과적으로 사용하기 위한 모범 사례들을 정리했습니다. 타입 정의, 제네릭 활용, 유틸리티 타입 등을 다룹니다...",
        "author": "시니어 개발자",
        "created_at": "2024-01-12T16:20:00Z",
        "updated_at": "2024-01-12T16:20:00Z",
        "tags": ["typescript", "javascript", "best-practices"],
        "categories": ["프로그래밍", "모범사례"],
        "published": True,
        "slug": "typescript-best-practices",
        "excerpt": "TypeScript를 더 효과적으로 사용하기 위한 실무 중심의 모범 사례들을 소개합니다.",
        "reading_time": 10,
        "views": 324
    }
]

@router.get("/posts", response_model=List[BlogPost])
async def get_blog_posts(
    skip: int = 0,
    limit: int = 10,
    published: Optional[bool] = None,
    tag: Optional[str] = Query(None, description="태그로 필터링"),
    category: Optional[str] = Query(None, description="카테고리로 필터링"),
    sort_by: str = Query("created_at", description="정렬 기준: created_at, views, title"),
    order: str = Query("desc", description="정렬 순서: asc, desc")
):
    """블로그 포스트 목록 조회 (태그/카테고리 필터링 및 정렬 지원)"""
    posts = mock_blog_posts.copy()
    
    # 필터링
    if published is not None:
        posts = [p for p in posts if p["published"] == published]
    
    if tag:
        posts = [p for p in posts if tag.lower() in [t.lower() for t in p["tags"]]]
    
    if category:
        posts = [p for p in posts if category in p["categories"]]
    
    # 정렬
    reverse_order = order.lower() == "desc"
    if sort_by == "created_at":
        posts = sorted(posts, key=lambda x: x["created_at"], reverse=reverse_order)
    elif sort_by == "views":
        posts = sorted(posts, key=lambda x: x["views"], reverse=reverse_order)
    elif sort_by == "title":
        posts = sorted(posts, key=lambda x: x["title"], reverse=reverse_order)
    
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

@router.get("/tags")
async def get_all_tags():
    """모든 태그 목록 조회"""
    all_tags = set()
    for post in mock_blog_posts:
        all_tags.update(post["tags"])
    
    # 태그별 게시물 수 계산
    tag_counts = {}
    for tag in all_tags:
        tag_counts[tag] = len([p for p in mock_blog_posts if tag in p["tags"]])
    
    return {
        "tags": sorted(list(all_tags)),
        "tag_counts": tag_counts
    }

@router.get("/categories")
async def get_all_categories():
    """모든 카테고리 목록 조회"""
    all_categories = set()
    for post in mock_blog_posts:
        all_categories.update(post["categories"])
    
    # 카테고리별 게시물 수 계산
    category_counts = {}
    for category in all_categories:
        category_counts[category] = len([p for p in mock_blog_posts if category in p["categories"]])
    
    return {
        "categories": sorted(list(all_categories)),
        "category_counts": category_counts
    }

@router.get("/rss")
async def get_rss_feed():
    """블로그 RSS 피드 제공"""
    # RSS XML 생성
    rss = ET.Element("rss", version="2.0")
    channel = ET.SubElement(rss, "channel")
    
    # 채널 정보
    ET.SubElement(channel, "title").text = "ND-SE 블로그"
    ET.SubElement(channel, "description").text = "최신 개발 소식, 튜토리얼, 그리고 팁"
    ET.SubElement(channel, "link").text = "http://localhost:3000/blog"
    ET.SubElement(channel, "language").text = "ko-KR"
    
    # 최근 게시물 10개
    recent_posts = sorted(mock_blog_posts, key=lambda x: x["created_at"], reverse=True)[:10]
    
    for post in recent_posts:
        if post["published"]:
            item = ET.SubElement(channel, "item")
            ET.SubElement(item, "title").text = post["title"]
            ET.SubElement(item, "description").text = post.get("excerpt", post["content"][:200] + "...")
            ET.SubElement(item, "link").text = f"http://localhost:3000/blog/{post['slug']}"
            ET.SubElement(item, "guid").text = f"http://localhost:3000/blog/{post['slug']}"
            ET.SubElement(item, "pubDate").text = datetime.fromisoformat(post["created_at"].replace('Z', '+00:00')).strftime("%a, %d %b %Y %H:%M:%S %z")
            ET.SubElement(item, "author").text = post["author"]
            
            # 태그를 카테고리로 추가
            for tag in post["tags"]:
                ET.SubElement(item, "category").text = tag
    
    # XML 문자열로 변환
    xml_str = ET.tostring(rss, encoding="utf-8", method="xml")
    xml_declaration = b'<?xml version="1.0" encoding="UTF-8"?>\n'
    
    return Response(
        content=xml_declaration + xml_str,
        media_type="application/rss+xml",
        headers={"Content-Type": "application/rss+xml; charset=utf-8"}
    )

@router.get("/stats")
async def get_blog_stats():
    """블로그 통계 정보"""
    total_posts = len(mock_blog_posts)
    published_posts = len([p for p in mock_blog_posts if p["published"]])
    
    # 인기 태그 TOP 5
    tag_counts = {}
    for post in mock_blog_posts:
        for tag in post["tags"]:
            tag_counts[tag] = tag_counts.get(tag, 0) + 1
    popular_tags = sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    
    return {
        "total_posts": total_posts,
        "published_posts": published_posts,
        "draft_posts": total_posts - published_posts,
        "total_views": sum(p["views"] for p in mock_blog_posts),
        "popular_tags": popular_tags,
        "recent_posts": sorted(mock_blog_posts, key=lambda x: x["created_at"], reverse=True)[:5]
    }
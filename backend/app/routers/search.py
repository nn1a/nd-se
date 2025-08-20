from datetime import datetime
from typing import List, Optional, Union

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from ..routers import blog, docs, forum

router = APIRouter()


class SearchResult(BaseModel):
    id: str
    type: str  # 'docs', 'blog', 'forum'
    title: str
    content: str
    url: str
    excerpt: Optional[str] = None
    tags: Optional[List[str]] = None
    category: Optional[str] = None
    author: Optional[str] = None
    created_at: Optional[str] = None
    match_score: Optional[float] = None


class SearchResponse(BaseModel):
    results: List[SearchResult]
    total: int
    query: str
    took_ms: int


@router.get("/", response_model=SearchResponse)
async def unified_search(
    q: str = Query(..., description="검색어"),
    types: Optional[str] = Query(None, description="검색 타입 (docs,blog,forum)"),
    limit: int = Query(20, description="결과 수 제한"),
    version: Optional[str] = Query(None, description="문서 버전"),
    language: Optional[str] = Query(None, description="문서 언어"),
):
    """통합 검색 API"""
    start_time = datetime.now()

    try:
        results = []
        search_types = types.split(",") if types else ["docs", "blog", "forum"]

        # 문서 검색
        if "docs" in search_types:
            try:
                docs_collection = await docs.get_docs_collection()
                docs_query = {
                    "$or": [
                        {"title": {"$regex": q, "$options": "i"}},
                        {"content": {"$regex": q, "$options": "i"}},
                        {"metadata.tags": {"$in": [{"$regex": q, "$options": "i"}]}},
                    ]
                }

                if version:
                    docs_query["version"] = version
                if language:
                    docs_query["language"] = language

                docs_cursor = docs_collection.find(docs_query).limit(
                    limit // len(search_types)
                )
                async for doc in docs_cursor:
                    result = SearchResult(
                        id=f"docs-{doc['_id']}",
                        type="docs",
                        title=doc.get("title", ""),
                        content=doc.get("content", ""),
                        url=f"/docs/{doc.get('version', 'v1')}/{doc.get('language', 'ko')}/{doc.get('slug', '')}",
                        excerpt=doc.get("metadata", {}).get("description")
                        or doc.get("excerpt"),
                        tags=doc.get("tags", []),
                        category=doc.get("metadata", {}).get("category"),
                        created_at=doc.get("created_at"),
                    )
                    results.append(result)
            except Exception as e:
                print(f"Error searching docs: {e}")

        # 블로그 검색
        if "blog" in search_types:
            try:
                # Mock data에서 검색 (실제로는 DB 검색)
                from .blog import mock_blog_posts

                for post in mock_blog_posts:
                    if (
                        q.lower() in post["title"].lower()
                        or q.lower() in post["content"].lower()
                        or any(q.lower() in tag.lower() for tag in post.get("tags", []))
                    ):

                        result = SearchResult(
                            id=f"blog-{post['id']}",
                            type="blog",
                            title=post["title"],
                            content=post["content"],
                            url=f"/blog/{post.get('slug', post['id'])}",
                            excerpt=post.get("excerpt"),
                            tags=post.get("tags", []),
                            author=post.get("author"),
                            created_at=post.get("created_at"),
                        )
                        results.append(result)

                        if len(
                            [r for r in results if r.type == "blog"]
                        ) >= limit // len(search_types):
                            break
            except Exception as e:
                print(f"Error searching blog: {e}")

        # 포럼 검색
        if "forum" in search_types:
            try:
                from .forum import mock_forum_posts

                for post in mock_forum_posts:
                    if (
                        q.lower() in post["title"].lower()
                        or q.lower() in post["content"].lower()
                        or any(q.lower() in tag.lower() for tag in post.get("tags", []))
                    ):

                        result = SearchResult(
                            id=f"forum-{post['id']}",
                            type="forum",
                            title=post["title"],
                            content=post["content"],
                            url=f"/forum/{post['id']}",
                            excerpt=post.get("excerpt"),
                            tags=post.get("tags", []),
                            author=post.get("author"),
                            created_at=post.get("created_at"),
                        )
                        results.append(result)

                        if len(
                            [r for r in results if r.type == "forum"]
                        ) >= limit // len(search_types):
                            break
            except Exception as e:
                print(f"Error searching forum: {e}")

        # 관련도 순으로 정렬 (제목 매치가 높은 점수)
        def calculate_score(result: SearchResult) -> float:
            score = 0.0
            q_lower = q.lower()

            # 제목에서 정확한 매치
            if q_lower == result.title.lower():
                score += 100.0
            elif q_lower in result.title.lower():
                score += 50.0

            # 태그 매치
            if result.tags:
                for tag in result.tags:
                    if q_lower in tag.lower():
                        score += 20.0

            # 콘텐츠 매치
            if q_lower in result.content.lower():
                score += 10.0

            # 타입별 가중치
            if result.type == "docs":
                score *= 1.2
            elif result.type == "blog":
                score *= 1.1

            return score

        # 점수 계산 및 정렬
        for result in results:
            result.match_score = calculate_score(result)

        results.sort(key=lambda x: x.match_score or 0, reverse=True)
        results = results[:limit]

        end_time = datetime.now()
        took_ms = int((end_time - start_time).total_seconds() * 1000)

        return SearchResponse(
            results=results, total=len(results), query=q, took_ms=took_ms
        )

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"검색 중 오류가 발생했습니다: {str(e)}"
        )


@router.get("/suggestions")
async def get_search_suggestions(
    q: str = Query(..., description="검색어"),
    limit: int = Query(10, description="제안 수 제한"),
):
    """검색 자동완성 제안"""
    try:
        suggestions = []

        # 간단한 제안 로직 (실제로는 더 정교한 알고리즘 사용)
        common_terms = [
            "Next.js",
            "React",
            "FastAPI",
            "Python",
            "TypeScript",
            "문서",
            "가이드",
            "튜토리얼",
            "API",
            "설치",
            "시작하기",
            "개발",
            "배포",
            "설정",
        ]

        q_lower = q.lower()
        for term in common_terms:
            if q_lower in term.lower() and term not in suggestions:
                suggestions.append(term)
                if len(suggestions) >= limit:
                    break

        return {"suggestions": suggestions}

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"검색 제안 중 오류가 발생했습니다: {str(e)}"
        )


@router.get("/popular")
async def get_popular_searches(limit: int = Query(10, description="인기 검색어 수")):
    """인기 검색어 조회"""
    try:
        # Mock 데이터 (실제로는 검색 로그에서 집계)
        popular_queries = [
            {"query": "Next.js 시작하기", "count": 145, "trend": "up"},
            {"query": "FastAPI 튜토리얼", "count": 132, "trend": "up"},
            {"query": "React Query", "count": 98, "trend": "stable"},
            {"query": "TypeScript 설정", "count": 87, "trend": "down"},
            {"query": "MongoDB 연동", "count": 76, "trend": "up"},
            {"query": "JWT 인증", "count": 65, "trend": "stable"},
            {"query": "Docker 배포", "count": 54, "trend": "up"},
            {"query": "TailwindCSS", "count": 43, "trend": "stable"},
            {"query": "API 문서화", "count": 38, "trend": "up"},
            {"query": "프로젝트 구조", "count": 32, "trend": "stable"},
        ]

        return {"queries": popular_queries[:limit]}

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"인기 검색어 조회 중 오류가 발생했습니다: {str(e)}"
        )


@router.get("/docs", response_model=SearchResponse)
async def search_documents(
    q: str = Query(..., description="검색어"),
    version: Optional[str] = Query(None, description="문서 버전"),
    language: Optional[str] = Query(None, description="문서 언어"),
    limit: int = Query(20, description="결과 수 제한"),
):
    """문서 전용 검색"""
    return await unified_search(
        q=q, types="docs", limit=limit, version=version, language=language
    )


@router.get("/blog", response_model=SearchResponse)
async def search_blog(
    q: str = Query(..., description="검색어"),
    limit: int = Query(20, description="결과 수 제한"),
):
    """블로그 전용 검색"""
    return await unified_search(q=q, types="blog", limit=limit)


@router.get("/forum", response_model=SearchResponse)
async def search_forum(
    q: str = Query(..., description="검색어"),
    limit: int = Query(20, description="결과 수 제한"),
):
    """포럼 전용 검색"""
    return await unified_search(q=q, types="forum", limit=limit)

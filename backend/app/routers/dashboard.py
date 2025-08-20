from fastapi import APIRouter

from ..core.database import database

router = APIRouter()


@router.get("/")
async def get_dashboard_data():
    """대시보드 데이터 가져오기"""

    try:
        # 실제 데이터베이스에서 통계 정보 수집
        blog_collection = database.get_collection("blog_posts")
        forum_collection = database.get_collection("forum_posts")

        # 기본 통계 수집 (사용자 컬렉션은 제외)
        total_blog_posts = await blog_collection.count_documents({"published": True})
        total_forum_posts = await forum_collection.count_documents({})
        total_users = 3  # 임시 고정값 (실제로는 users 컬렉션에서 가져와야 함)

        # 총 조회수 계산 (블로그 + 포럼)
        blog_views_pipeline = [
            {"$group": {"_id": None, "total_views": {"$sum": "$views"}}}
        ]
        blog_views_result = await blog_collection.aggregate(
            blog_views_pipeline
        ).to_list(1)
        blog_total_views = (
            blog_views_result[0]["total_views"] if blog_views_result else 0
        )

        forum_views_pipeline = [
            {"$group": {"_id": None, "total_views": {"$sum": "$views"}}}
        ]
        forum_views_result = await forum_collection.aggregate(
            forum_views_pipeline
        ).to_list(1)
        forum_total_views = (
            forum_views_result[0]["total_views"] if forum_views_result else 0
        )

        total_views = blog_total_views + forum_total_views

        # 최근 활동 (블로그 + 포럼 게시물에서 최신 3개)
        recent_blog_posts = (
            await blog_collection.find(
                {"published": True}, {"title": 1, "created_at": 1}
            )
            .sort("created_at", -1)
            .limit(2)
            .to_list(2)
        )

        recent_forum_posts = (
            await forum_collection.find({}, {"title": 1, "created_at": 1})
            .sort("created_at", -1)
            .limit(1)
            .to_list(1)
        )

        recent_activities = []

        # 블로그 포스트 활동 추가
        for post in recent_blog_posts:
            recent_activities.append(
                {
                    "type": "blog",
                    "message": f"블로그 포스트 '{post['title']}'가 게시되었습니다",
                    "time": "최근",
                    "status": "success",
                }
            )

        # 포럼 포스트 활동 추가
        for post in recent_forum_posts:
            recent_activities.append(
                {
                    "type": "forum",
                    "message": f"포럼 게시글 '{post['title']}'가 작성되었습니다",
                    "time": "최근",
                    "status": "info",
                }
            )

        # 인기 콘텐츠 (조회수 기준 상위 3개)
        popular_blog_posts = (
            await blog_collection.find({"published": True}, {"title": 1, "views": 1})
            .sort("views", -1)
            .limit(2)
            .to_list(2)
        )

        popular_forum_posts = (
            await forum_collection.find({}, {"title": 1, "views": 1})
            .sort("views", -1)
            .limit(1)
            .to_list(1)
        )

        popular_content = []

        for post in popular_blog_posts:
            popular_content.append(
                {
                    "title": post["title"],
                    "type": "블로그",
                    "views": post.get("views", 0),
                }
            )

        for post in popular_forum_posts:
            popular_content.append(
                {"title": post["title"], "type": "포럼", "views": post.get("views", 0)}
            )

        # 조회수 기준으로 정렬
        popular_content.sort(key=lambda x: x["views"], reverse=True)
        popular_content = popular_content[:3]  # 상위 3개만

        dashboard_data = {
            "users": total_users,
            "posts": total_blog_posts + total_forum_posts,
            "views": total_views,
            "comments": 0,  # 댓글 기능이 구현되면 수정
            "recent_activities": recent_activities,
            "popular_content": popular_content,
        }

        return dashboard_data

    except Exception as e:
        print(f"❌ [Dashboard] Error fetching dashboard data: {e}")
        import traceback

        traceback.print_exc()
        # 에러 발생 시 기본값 반환
        return {
            "users": 0,
            "posts": 0,
            "views": 0,
            "comments": 0,
            "recent_activities": [],
            "popular_content": [],
        }


@router.get("/stats")
async def get_stats():
    """시스템 통계 가져오기"""

    try:
        # 실제 데이터베이스에서 통계 정보 수집
        docs_collection = database.get_collection("docs")
        blog_collection = database.get_collection("blog_posts")
        forum_collection = database.get_collection("forum_posts")

        # 기본 통계 수집 (사용자는 임시 고정값)
        total_documents = await docs_collection.count_documents({})
        total_blog_posts = await blog_collection.count_documents({"published": True})
        total_forum_posts = await forum_collection.count_documents({})
        active_users = 3  # 임시 고정값

        # 월별 방문 수 계산 (조회수 기준)
        blog_views_pipeline = [
            {"$group": {"_id": None, "total_views": {"$sum": "$views"}}}
        ]
        blog_views_result = await blog_collection.aggregate(
            blog_views_pipeline
        ).to_list(1)
        blog_total_views = (
            blog_views_result[0]["total_views"] if blog_views_result else 0
        )

        forum_views_pipeline = [
            {"$group": {"_id": None, "total_views": {"$sum": "$views"}}}
        ]
        forum_views_result = await forum_collection.aggregate(
            forum_views_pipeline
        ).to_list(1)
        forum_total_views = (
            forum_views_result[0]["total_views"] if forum_views_result else 0
        )

        monthly_visits = blog_total_views + forum_total_views

        # 성장률 계산 (예시 - 실제로는 이전 달 데이터와 비교해야 함)
        growth_rate = 15.3  # 임시값, 실제로는 계산 로직 필요

        stats = {
            "total_documents": total_documents,
            "total_blog_posts": total_blog_posts,
            "total_forum_posts": total_forum_posts,
            "active_users": active_users,
            "monthly_visits": monthly_visits,
            "growth_rate": growth_rate,
        }

        return stats

    except Exception as e:
        print(f"❌ [Dashboard] Error fetching stats: {e}")
        # 에러 발생 시 기본값 반환
        return {
            "total_documents": 0,
            "total_blog_posts": 0,
            "total_forum_posts": 0,
            "active_users": 0,
            "monthly_visits": 0,
            "growth_rate": 0.0,
        }

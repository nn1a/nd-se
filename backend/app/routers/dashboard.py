from fastapi import APIRouter
from typing import Dict

router = APIRouter()

@router.get("/")
async def get_dashboard_data():
    """대시보드 데이터 가져오기"""
    
    # 실제 환경에서는 데이터베이스에서 실제 통계를 가져와야 함
    # 여기서는 샘플 데이터를 반환
    
    dashboard_data = {
        "users": 1245,
        "posts": 89,
        "views": 12543,
        "comments": 456,
        "recent_activities": [
            {
                "type": "document",
                "message": "새로운 문서가 추가되었습니다",
                "time": "5분 전",
                "status": "success"
            },
            {
                "type": "blog",
                "message": "블로그 포스트가 게시되었습니다",
                "time": "1시간 전",
                "status": "info"
            },
            {
                "type": "system",
                "message": "시스템 백업이 완료되었습니다",
                "time": "3시간 전",
                "status": "warning"
            }
        ],
        "popular_content": [
            {
                "title": "Next.js 시작하기",
                "type": "문서",
                "views": 1234
            },
            {
                "title": "FastAPI 튜토리얼",
                "type": "블로그",
                "views": 987
            },
            {
                "title": "API 설계 가이드",
                "type": "문서",
                "views": 756
            }
        ]
    }
    
    return dashboard_data

@router.get("/stats")
async def get_stats():
    """시스템 통계 가져오기"""
    
    stats = {
        "total_documents": 45,
        "total_blog_posts": 23,
        "total_forum_posts": 156,
        "active_users": 89,
        "monthly_visits": 12543,
        "growth_rate": 15.3
    }
    
    return stats

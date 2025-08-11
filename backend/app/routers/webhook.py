from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from ..core.revalidation import revalidation_service

router = APIRouter()

class RevalidationRequest(BaseModel):
    action: str  # 'document-updated', 'document-created', 'document-deleted', 'navigation-updated', 'bulk-update'
    slug: Optional[str] = None
    secret: str

@router.post("/revalidate")
async def trigger_revalidation(request: RevalidationRequest):
    """수동으로 Next.js revalidation 트리거"""
    try:
        # 보안 검증은 revalidation_service에서 처리되지 않으므로 여기서 처리
        from ..core.config import settings
        if request.secret != settings.REVALIDATION_SECRET:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid secret"
            )
        
        success = await revalidation_service.trigger_revalidation(
            request.action, 
            request.slug
        )
        
        if success:
            return {
                "message": "Revalidation triggered successfully",
                "action": request.action,
                "slug": request.slug,
                "timestamp": "2025-01-01T00:00:00Z"  # 실제로는 현재 시간
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Revalidation failed"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Webhook processing failed: {str(e)}"
        )

@router.get("/health")
async def webhook_health():
    """Webhook 상태 확인"""
    return {"status": "ok", "service": "webhook"}
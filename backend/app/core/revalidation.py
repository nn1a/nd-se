import asyncio
from typing import Optional

import httpx

from ..core.config import settings


class RevalidationService:
    def __init__(self):
        self.frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:3000")
        self.secret = getattr(settings, "REVALIDATION_SECRET", "your-secret-key")

    async def trigger_revalidation(self, action: str, slug: Optional[str] = None):
        """Next.js revalidation 트리거"""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                payload = {"action": action, "slug": slug, "secret": self.secret}

                response = await client.post(
                    f"{self.frontend_url}/api/revalidate",
                    json=payload,
                    headers={"Content-Type": "application/json"},
                )

                if response.status_code == 200:
                    print(f"✅ Revalidation successful: {action} - {slug}")
                    return True
                else:
                    print(
                        f"❌ Revalidation failed: {response.status_code} - {response.text}"
                    )
                    return False

        except Exception as e:
            print(f"❌ Revalidation error: {e}")
            return False

    def trigger_revalidation_background(self, action: str, slug: Optional[str] = None):
        """백그라운드에서 revalidation 실행"""
        asyncio.create_task(self.trigger_revalidation(action, slug))


# 전역 revalidation 서비스 인스턴스
revalidation_service = RevalidationService()

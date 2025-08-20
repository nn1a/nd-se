# NDASH 통합 문서 시스템 - AI Agent Guide

## 🏗️ Architecture Overview

NDASH is a **modern full-stack documentation platform** combining Next.js 15 frontend with FastAPI backend. The system provides documentation, blog, forum, and dashboard features with **MongoDB** as the primary database.

**Key Design Principles:**
- **API-first architecture** with auto-generated TypeScript clients
- **App Router pattern** in Next.js 15 with server/client component separation
- **Service-based FastAPI** with router modularization (`/api/docs`, `/api/blog`, `/api/forum`, etc.)
- **Real-time data fetching** using TanStack Query with optimistic caching

## 📁 Critical Project Structure

```
/backend/app/
├── core/                   # Database, auth, config (MongoDB motor client)
├── routers/               # API endpoints (docs, blog, forum, dashboard, analytics, users, auth)
└── main.py               # FastAPI app with CORS + router registration

/frontend/
├── app/                   # Next.js App Router (SSR/CSR pages)
├── components/           # React components (MDX processing, navigation, dashboard UI)
├── hooks/               # TanStack Query hooks + useAuth context
├── lib/                 # API client, utilities, auto-generated OpenAPI types
└── src/lib/api/         # Auto-generated API client from @hey-api/openapi-ts
```

## 🔧 Essential Development Workflows

### Backend Development
```bash
cd backend
source venv/bin/activate                    # Always activate venv first
PYTHONPATH=/home/meakd/ndash/backend uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### API Client Generation
```bash
cd frontend
npm run generate-api                        # Generates TypeScript client from FastAPI OpenAPI
```

### Full Development Stack
```bash
./start-dev.sh                             # Starts MongoDB + Backend + Frontend
# URLs: Frontend (3000), Backend (8000), API docs (8000/docs)
```

## 🔗 API Integration Patterns

**Critical:** This project uses **auto-generated TypeScript clients** from FastAPI OpenAPI schemas.

### FastAPI Router Pattern
```python
# backend/app/routers/docs.py
from ..core.database import database
from ..core.auth import get_current_user

@router.get("/{slug:path}")
async def get_document(slug: str):
    collection = await get_docs_collection()
    return await collection.find_one({"slug": slug})
```

### Frontend API Usage Pattern
```typescript
// Use generated hooks from src/lib/api/@tanstack/react-query.gen.ts
import { useQuery } from '@tanstack/react-query'
import { client } from '@/lib/api/client.gen'

// Generated query options pattern
export function useDocument(slug: string) {
  return useQuery({
    queryKey: ['document', slug],
    queryFn: () => client.getDocumentApiDocsSlugGet({ path: { slug } }),
    enabled: !!slug
  })
}
```

## 🗃️ Database & Authentication

### MongoDB Connection Pattern
```python
# backend/app/core/database.py
from motor.motor_asyncio import AsyncIOMotorClient

# Always use async/await with motor collections
collection = database.get_collection("docs")
document = await collection.find_one({"slug": slug})
```

### Authentication Flow
```typescript
// frontend/hooks/useAuth.tsx - Context pattern
// JWT tokens stored in localStorage (access_token, refresh_token)
// Default test credentials: admin/admin
```

## 🎨 Frontend Component Patterns

### App Router Structure
- **Server Components:** `/app/docs/page.tsx` (SEO-optimized)
- **Client Components:** `/app/dashboard/**/*` (interactive)
- **Dynamic Routes:** `/app/docs/[...slug]/page.tsx` (catch-all for docs)

### Dashboard Layout Pattern
```typescript
// app/dashboard/layout.tsx - Sidebar + Breadcrumb wrapper
// components/dashboard/sidebar.tsx - Multi-level navigation with lucide-react icons
```

### MDX Processing
```typescript
// components/MDXComponents.tsx - Custom renderers for markdown
// components/MDXProcessor.tsx - Unified MDX pipeline
```

## 🧪 Testing & Data

### Mock Data Loading
```bash
python scripts/load_test_data.py           # Loads /docs-testdata into MongoDB
python scripts/insert_test_data.py         # Alternative test data script
```

### API Testing
```bash
curl http://localhost:8000/openapi.json    # Verify API schema
curl http://localhost:8000/api/docs        # Test endpoints
```

## ⚠️ Common Gotchas

1. **Virtual Environment:** Backend MUST use activated venv - install via `pip install pymongo motor pydantic-settings`
2. **Import Paths:** Generated API client uses `../src/lib/api/` paths from frontend root
3. **CORS Configuration:** Backend allows `localhost:3000` - check `core/config.py`
4. **MongoDB Dependency:** Always start MongoDB before backend (Docker: `docker run -d -p 27017:27017 mongo:7`)
5. **Path Parameters:** FastAPI slug routes use `{slug:path}` for nested paths

## 🚀 Key Integration Points

- **OpenAPI Generation:** Backend `/openapi.json` → Frontend TypeScript client
- **TanStack Query:** Server state management with 5-minute stale time
- **Next.js Rewrites:** `/api/*` proxies to `http://localhost:8000/api/*`
- **MongoDB Collections:** `docs`, `navigation`, `users` (see router files for schemas)

When making changes, **always regenerate API client** after backend modifications and **test both frontend/backend** together.

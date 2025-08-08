# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

ND-SE is a modern full-stack documentation platform combining **Next.js 15 frontend** with **FastAPI backend**, using **MongoDB** as the database. The system provides documentation, blog, forum, and dashboard features with auto-generated TypeScript API clients.

### Key Technologies
- **Frontend**: Next.js 15 (App Router), TypeScript, TailwindCSS v4+, Shadcn UI, TanStack Query
- **Backend**: FastAPI, Motor (async MongoDB), JWT authentication, Pydantic validation
- **Database**: MongoDB with async Motor driver
- **API Generation**: OpenAPI → TypeScript client via @hey-api/openapi-ts

## Essential Development Commands

### Backend Development
```bash
cd backend
source venv/bin/activate
PYTHONPATH=/home/meakd/nd-se/backend uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development
```bash
cd frontend
npm run dev                    # Start development server
npm run generate-api           # Generate TypeScript client from FastAPI OpenAPI
npm run build                  # Production build
npm run lint                   # Run ESLint
```

### Full Stack Development
```bash
./start-dev.sh                 # Starts MongoDB + Backend + Frontend
# URLs: Frontend (3000), Backend (8000), API docs (8000/docs)
```

### Testing and Linting
```bash
# Backend
cd backend
pytest                         # Run tests
black . && isort . && flake8   # Format and lint

# Frontend  
cd frontend
npm run lint                   # ESLint check
npm run build                  # Type checking via build
```

## Project Architecture

### Backend Structure (`/backend/app/`)
```
app/
├── core/                      # Database, auth, config
│   ├── database.py           # Motor MongoDB client
│   ├── auth.py               # JWT token handling
│   └── config.py             # Pydantic settings
├── routers/                  # API endpoints
│   ├── auth.py              # /api/auth (login, register, refresh)
│   ├── docs.py              # /api/docs (markdown documents)
│   ├── blog.py              # /api/blog (blog posts)
│   ├── forum.py             # /api/forum (Q&A discussions)
│   ├── dashboard.py         # /api/dashboard (admin interface)
│   ├── analytics.py         # /api/analytics (usage stats)
│   └── users.py             # /api/users (user management)
└── main.py                  # FastAPI app with CORS + router registration
```

### Frontend Structure (`/frontend/`)
```
app/                          # Next.js App Router
├── docs/[...slug]/          # Dynamic document routes (catch-all)
├── dashboard/               # Admin interface (multi-level nested)
├── blog/                    # Blog post pages
├── forum/                   # Forum discussions
└── api-test/               # API testing interface

components/
├── dashboard/              # Admin UI components (sidebar, breadcrumb)
├── ui/                     # Shadcn UI components
├── MDXComponents.tsx       # Custom markdown renderers
└── ApiClientProvider.tsx   # API client configuration

lib/
├── api-client.ts           # Manual API utilities (auth, error handling)
├── query-client.ts         # TanStack Query configuration
└── types.ts               # Shared TypeScript types

src/lib/api/                # Auto-generated OpenAPI client
├── client.gen.ts           # API client
├── types.gen.ts            # TypeScript types
└── @tanstack/react-query.gen.ts  # Generated query hooks
```

## API Integration Patterns

**Critical**: This project uses **auto-generated TypeScript clients** from FastAPI OpenAPI schemas.

### Regenerating API Client
Always run after backend API changes:
```bash
cd frontend
npm run generate-api
```

### Using Generated API Client
```typescript
// Use generated query hooks
import { useGetDocumentApiDocsSlugGetQuery } from '@/src/lib/api/@tanstack/react-query.gen'

function DocumentPage({ slug }: { slug: string }) {
  const { data, error, isLoading } = useGetDocumentApiDocsSlugGetQuery({
    path: { slug }
  })
  
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  return <div>{data?.content}</div>
}
```

### Manual API Calls (fallback)
```typescript
import { apiRequest } from '@/lib/api-client'

// With automatic JWT token handling and refresh
const data = await apiRequest('/api/docs/introduction')
```

## Database Patterns

### MongoDB Collections
- `docs` - Markdown documents with frontmatter
- `blog` - Blog posts and metadata
- `forum` - Discussion threads and replies  
- `users` - User accounts and profiles
- `navigation` - Site navigation structure

### Async Database Usage
```python
# backend/app/routers/docs.py
from motor.motor_asyncio import AsyncIOMotorClient
from ..core.database import database

async def get_document(slug: str):
    collection = database.get_collection("docs")
    return await collection.find_one({"slug": slug})
```

## Authentication System

### Default Credentials
- Username: `admin`
- Password: `admin`

### JWT Token Flow
1. Login → Receive access_token + refresh_token
2. Store tokens in localStorage
3. Include `Authorization: Bearer <token>` in API requests
4. Auto-refresh expired tokens via `/api/auth/refresh`

### Auth Context Usage
```typescript
import { useAuth } from '@/hooks/useAuth'

function Component() {
  const { user, login, logout, isAuthenticated } = useAuth()
  return isAuthenticated ? <Dashboard /> : <LoginForm />
}
```

## Development Workflow

### Starting Development
1. **MongoDB**: `docker run -d -p 27017:27017 --name mongodb mongo:7`
2. **Backend**: Activate venv → `uvicorn app.main:app --reload`
3. **Frontend**: `npm run generate-api && npm run dev`

### Making API Changes
1. Modify FastAPI routers in `/backend/app/routers/`
2. Test backend: `http://localhost:8000/docs`
3. Regenerate client: `cd frontend && npm run generate-api`
4. Update frontend components using new generated hooks

### Environment Setup
- **Backend**: Copy `.env.example` to `.env` (MongoDB URL, JWT secret)
- **Frontend**: Copy `.env.example` to `.env.local` (API URL)
- **MongoDB**: Default `mongodb://localhost:27017/nd_se_db`

## Common Issues

1. **Virtual Environment**: Backend requires activated venv with dependencies from `requirements.txt`
2. **API Client**: Always regenerate after backend changes via `npm run generate-api`
3. **CORS**: Backend allows `localhost:3000` - check `core/config.py` for issues
4. **MongoDB**: Ensure MongoDB is running before starting backend
5. **Path Parameters**: FastAPI uses `{slug:path}` for nested document routes
6. **Import Paths**: Generated API client uses `@/src/lib/api/` paths
7. **Search Modal**: Press `/` key to open global search anywhere on the site
8. **Forum Permissions**: Posts can only be edited/deleted by author or admin
9. **Token Refresh**: Refresh tokens automatically handle expired access tokens

## Test Data

Load test documents:
```bash
python scripts/load_test_data.py     # Loads /docs-testdata into MongoDB
python scripts/insert_test_data.py   # Alternative test data
```

## Requirements Compliance Status

✅ **All major requirements implemented:**
- Document system with TOC, versioning, and language support
- Blog with tags, categories, and RSS
- Dashboard with 3-depth sidebar navigation  
- Forum with full CRUD, voting, and reporting
- FlexSearch integration for unified search
- JWT authentication with refresh tokens
- API-first architecture with auto-generated TypeScript clients

## Quick Development Checklist

1. **Start MongoDB**: `docker run -d -p 27017:27017 --name mongodb mongo:7`
2. **Backend**: `cd backend && source venv/bin/activate && uvicorn app.main:app --reload`
3. **Frontend**: `cd frontend && npm run generate-api && npm run dev`
4. **Test Auth**: Login with `admin/admin` or `user/user`
5. **Test Search**: Press `/` key for global search modal
6. **Test Forum**: Create posts, vote, and add replies
7. **Test Blog**: Filter by tags/categories, sort by date/views

## Key URLs (Development)
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`  
- API Documentation: `http://localhost:8000/docs`
- OpenAPI Schema: `http://localhost:8000/openapi.json`
- RSS Feed: `http://localhost:8000/api/blog/rss`

When making changes, **always regenerate API client** after backend modifications and **test both frontend/backend** together.
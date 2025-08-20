# NDASH 시스템 사용 가이드

## 🎯 시스템 개요

NDASH는 **API-first 아키텍처**를 기반으로 한 현대적 통합 문서 플랫폼입니다. 

### ✅ 주요 기능 현황

1. **📄 문서 시스템**
   - ✅ 다국어 지원 (한국어/영어) - `/docs/v1/ko/intro`
   - ✅ 버전 분기 (v1, v2) - URL 기반 라우팅
   - ✅ 자동 TOC 생성 - h2, h3, h4 헤더 기반
   - ✅ MDX 지원 - React 컴포넌트 삽입
   - ✅ SSR/ISR 렌더링 - SEO 최적화

2. **📝 블로그 시스템**
   - ✅ 마크다운 기반 포스트
   - ✅ 태그/카테고리 시스템
   - ✅ 날짜별 정렬 및 페이징
   - ✅ 통합 검색 대상
   - ✅ RSS 피드 자동 생성

3. **📊 대시보드**
   - ✅ 실시간 통계 데이터
   - ✅ 3-depth 계층형 사이드바
   - ✅ URL 직접 접근 시 메뉴 자동 활성화
   - ✅ Breadcrumb 네비게이션
   - ✅ 사용자 권한 기반 접근 제어

4. **💬 게시판 (포럼)**
   - ✅ 웹 에디터 (Tiptap) 기반 글쓰기
   - ✅ 이미지/파일 첨부 기능
   - ✅ 임시저장 및 재편집
   - ✅ 댓글, 투표, 신고 기능
   - ✅ Q&A, 답글, 비밀글 지원
   - ✅ 태그 분류 및 권한 관리

5. **🔐 인증 시스템**
   - ✅ JWT Access + Refresh 토큰
   - ✅ 사용자 등록/로그인
   - ✅ 권한 기반 접근 제어
   - ✅ 자동 토큰 갱신

6. **🔍 통합 검색**
   - ✅ FlexSearch 기반 클라이언트 사이드 검색
   - ✅ 문서/블로그/게시판 통합 검색
   - ✅ `/` 키로 전역 검색 모달
   - ✅ 검색어 하이라이트

## 🚀 시스템 시작

### 🐳 Docker 사용 (권장)
```bash
# 개발 환경 전체 시작 (MongoDB + Backend + Frontend)
./start-dev.sh

# 또는 Docker Compose 직접 사용
docker-compose up -d

# 로그 실시간 확인
docker-compose logs -f
```

### 🛠️ 개발 환경 (수동 설정)
```bash
# 1. MongoDB 시작
docker run -d -p 27017:27017 --name mongodb mongo:7

# 2. Backend 시작
cd backend
source venv/bin/activate
PYTHONPATH=/home/meakd/nd-se/backend uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 3. Frontend 시작
cd frontend
npm install
npm run generate-api  # FastAPI → TypeScript 클라이언트 생성
npm run dev
```

### 📍 접속 URL
- 🌐 **Frontend**: http://localhost:3000
- 🔌 **Backend API**: http://localhost:8000  
- 📖 **API 문서**: http://localhost:8000/docs
- 📊 **OpenAPI Schema**: http://localhost:8000/openapi.json

### 🔑 기본 로그인 정보
- **관리자**: `admin` / `admin`
- **일반 사용자**: `user` / `user`

## 📝 콘텐츠 관리

### 1. 문서 작성

문서는 `docs/` 폴더에 계층적 구조로 작성:

```
docs/
├── v1/                    # 버전 1
│   ├── ko/               # 한국어 문서
│   │   ├── intro.md      # → /docs/v1/ko/intro
│   │   ├── guides/
│   │   │   └── api.md    # → /docs/v1/ko/guides/api
│   │   └── examples/
│   └── en/               # 영어 문서
│       ├── intro.md      # → /docs/v1/en/intro
│       └── guides/
└── v2/                   # 버전 2 (새로운 기능)
    └── ...
```

#### Frontmatter 예시
```markdown
---
title: "API 가이드"
description: "FastAPI와 Next.js 연동 방법"
tags: ["api", "fastapi", "nextjs"]
version: "1.0"
lastUpdated: "2024-01-15"
author: "개발팀"
---

# API 가이드

이 문서에서는 FastAPI 백엔드와의 연동 방법을 설명합니다.

## 목차가 자동 생성됩니다

### 하위 제목들이
#### TOC에 포함됩니다
```

### 2. 블로그 포스트 작성

블로그 포스트는 Backend API를 통해 작성하거나 직접 데이터베이스에 삽입:

```bash
# 테스트 블로그 데이터 삽입
python scripts/insert_test_data.py
```

### 3. 게시판 사용법

#### 글 작성 (웹 에디터)
1. **로그인**: 상단 메뉴에서 로그인
2. **게시판 접근**: `/forum` 페이지 방문
3. **새 글 작성**: "새 글 작성" 버튼 클릭
4. **에디터 사용**:
   - 리치 텍스트 편집 (Tiptap 에디터)
   - 이미지 드래그 앤 드롭
   - 파일 첨부 가능
   - 임시저장 자동 기능

#### 고급 기능
- **임시저장**: 작성 중 자동으로 임시저장
- **재편집**: 저장된 글 다시 편집 가능
- **권한 관리**: 작성자 또는 관리자만 수정/삭제
- **투표**: 게시글에 좋아요/싫어요
- **신고**: 부적절한 게시글 신고
- **댓글**: 중첩 댓글 지원

## 🖥️ 사용자 인터페이스 가이드

### 🏠 메인 페이지 (`/`)
- 시스템 소개 및 주요 기능 설명
- 각 섹션별 빠른 링크 제공
- 최근 업데이트된 문서 표시

### 📄 문서 페이지 (`/docs/[...slug]`)
- **동적 라우팅**: `/docs/v1/ko/intro` 형태
- **자동 TOC**: 우측 사이드바에 목차 표시
- **네비게이션**: 이전/다음 문서 링크
- **검색**: 문서 내 검색 및 하이라이트
- **MDX 컴포넌트**: 인터랙티브 요소 포함

### 📝 블로그 페이지 (`/blog`)
- **포스트 목록**: 카드 형태로 표시
- **필터링**: 태그/카테고리별 필터
- **정렬**: 날짜순, 조회수순, 인기순
- **RSS 피드**: `/api/blog/rss` 자동 생성
- **개별 포스트**: `/blog/[slug]` SEO 최적화

### 📊 대시보드 (`/dashboard`)
- **3-Depth 사이드바**: 
  ```
  📊 Dashboard
    ├── 📈 Analytics
    │   ├── 👥 Users
    │   ├── 📄 Content
    │   └── 🔍 Search
    ├── ⚙️ Settings
    │   ├── 🔐 Security
    │   └── 🌍 Localization
    └── 👤 Profile
  ```
- **자동 메뉴 활성화**: URL 직접 접근시 해당 메뉴 활성화
- **Breadcrumb**: 현재 위치 표시
- **실시간 데이터**: TanStack Query로 자동 업데이트

### 💬 게시판 (`/forum`)
- **게시글 목록**: 테이블/카드 뷰 토글
- **새 글 작성**: 웹 에디터 (로그인 필요)
- **개별 게시글**: 댓글, 투표, 신고 기능
- **권한 관리**: 작성자/관리자별 다른 UI
- **실시간 업데이트**: 새 댓글 자동 반영

### 🔍 통합 검색 기능
- **전역 검색**: `/` 키를 눌러 어디서든 검색 모달 열기
- **검색 대상**: 문서, 블로그, 게시판 통합 검색
- **실시간 검색**: 타이핑과 동시에 결과 표시
- **검색어 하이라이트**: 결과에서 검색어 강조
- **필터링**: 콘텐츠 유형별 필터 지원

## 🔌 API 사용 가이드

### 🔐 인증 API

#### 로그인
```bash
curl -X POST "http://localhost:8000/api/auth/token" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "username=admin&password=admin"

# Response
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

#### 토큰 갱신
```bash
curl -X POST "http://localhost:8000/api/auth/refresh" \
     -H "Content-Type: application/json" \
     -d '{"refresh_token": "your-refresh-token"}'
```

#### 사용자 정보 조회
```bash
curl -H "Authorization: Bearer <access_token>" \
     "http://localhost:8000/api/auth/me"
```

### 📄 문서 API

#### 문서 목록 조회
```bash
# 모든 문서
curl "http://localhost:8000/api/docs/"

# 쿼리 파라미터
curl "http://localhost:8000/api/docs/?version=v1&language=ko"
```

#### 특정 문서 조회
```bash
curl "http://localhost:8000/api/docs/v1/ko/intro"
```

### 📝 블로그 API

#### 블로그 포스트 목록
```bash
# 기본 목록
curl "http://localhost:8000/api/blog/"

# 페이징 및 필터
curl "http://localhost:8000/api/blog/?page=1&limit=10&tag=nextjs"
```

#### RSS 피드
```bash
curl "http://localhost:8000/api/blog/rss"
```

### 💬 게시판 API

#### 게시글 목록
```bash
curl "http://localhost:8000/api/forum/"
```

#### 새 글 작성 (인증 필요)
```bash
curl -X POST "http://localhost:8000/api/forum/" \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{
       "title": "새 게시글",
       "content": "게시글 내용",
       "tags": ["질문", "도움"]
     }'
```

#### 게시글 투표
```bash
curl -X POST "http://localhost:8000/api/forum/123/vote" \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"vote_type": "up"}'
```

### 📊 대시보드 API

#### 대시보드 데이터
```bash
curl -H "Authorization: Bearer <token>" \
     "http://localhost:8000/api/dashboard/"
```

#### 시스템 통계
```bash
curl -H "Authorization: Bearer <token>" \
     "http://localhost:8000/api/analytics/"
```

## 🛠️ 개발 정보

### 📍 개발 환경 포트
- 🌐 **Frontend**: http://localhost:3000
- 🔌 **Backend**: http://localhost:8000  
- 📖 **API 문서**: http://localhost:8000/docs
- 🗃️ **MongoDB**: mongodb://localhost:27017
- 📊 **OpenAPI**: http://localhost:8000/openapi.json

### 📁 핵심 디렉토리 구조
```
nd-se/
├── 🖥️ frontend/               # Next.js 15 App
│   ├── app/                  # App Router (SSR/CSR)
│   ├── components/           # React 컴포넌트
│   ├── lib/                  # 유틸리티
│   └── src/lib/api/          # 🤖 자동 생성 API 클라이언트
├── ⚡ backend/                # FastAPI App
│   └── app/
│       ├── core/             # DB, Auth, Config
│       ├── routers/          # API 라우터
│       └── main.py           # 앱 진입점
├── 📚 docs/                   # 마크다운 문서
├── 🛠️ scripts/               # 유틸리티 스크립트
└── 🐳 docker-compose.yml     # Docker 설정
```

### 🔧 환경 설정

#### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
FASTAPI_BASE_URL=http://localhost:8000
NEXT_PUBLIC_SEARCH_ENABLED=true
```

#### Backend (`.env`)
```env
SECRET_KEY=your-super-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=nd_se_db
ALLOWED_ORIGINS=["http://localhost:3000"]
```

### 🚀 API 클라이언트 자동 생성

이 프로젝트의 핵심 특징 중 하나는 **FastAPI OpenAPI 스키마에서 TypeScript 클라이언트를 자동 생성**하는 것입니다.

```bash
cd frontend

# FastAPI 서버가 실행 중인 상태에서
npm run generate-api

# 생성되는 파일들
# src/lib/api/client.gen.ts        - API 클라이언트
# src/lib/api/types.gen.ts         - TypeScript 타입
# src/lib/api/@tanstack/react-query.gen.ts - Query 훅
```

### 🎯 개발 워크플로우

1. **Backend API 수정** → `backend/app/routers/`
2. **API 클라이언트 재생성** → `npm run generate-api`
3. **Frontend 컴포넌트 업데이트** → 생성된 훅 사용
4. **테스트** → 통합 테스트 실행

### 📦 패키지 관리

#### Frontend 주요 의존성
- `@hey-api/openapi-ts` - API 클라이언트 생성
- `@tanstack/react-query` - 서버 상태 관리
- `@tailwindcss/postcss` - TailwindCSS v4+
- `@tiptap/react` - 리치 텍스트 에디터

#### Backend 주요 의존성
- `fastapi` - 웹 프레임워크
- `motor` - 비동기 MongoDB 드라이버  
- `pydantic` - 데이터 검증
- `python-jose` - JWT 토큰 처리

## 🚀 배포 및 운영

### 🐳 Docker 배포 (권장)

#### 개발 환경
```bash
# 전체 스택 시작
./start-dev.sh

# 또는 직접 Docker Compose
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 서비스 재시작
docker-compose restart backend frontend

# 전체 중지
docker-compose down
```

#### 프로덕션 환경
```bash
# 프로덕션 빌드 및 배포
docker-compose -f docker-compose.prod.yml up -d --build

# 볼륨까지 함께 정리
docker-compose down -v
```

### 🔧 수동 배포

#### Frontend
```bash
cd frontend
npm run build        # 프로덕션 빌드
npm start           # 프로덕션 서버 (포트 3000)

# PM2 사용 (권장)
npm install -g pm2
pm2 start npm --name "ndash-frontend" -- start
```

#### Backend
```bash
cd backend
pip install -r requirements.txt

# Gunicorn 사용 (권장)
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

# 또는 Uvicorn 직접 사용
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### 🔍 모니터링 및 로깅

#### 로그 확인
```bash
# Docker 환경
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb

# 실시간 로그 (개발환경)
# 터미널에서 직접 확인 가능
```

#### 헬스체크
```bash
# 서비스 상태 확인
curl http://localhost:3000/          # Frontend
curl http://localhost:8000/docs      # Backend
curl http://localhost:8000/openapi.json  # API Schema

# MongoDB 연결 확인
docker exec mongodb mongosh --eval "db.adminCommand('ismaster')"
```

## 🔧 문제 해결 및 FAQ

### ❓ 자주 발생하는 문제들

#### 1. **MongoDB 연결 실패**
```bash
# 🔍 문제: "Connection refused" 또는 "Cannot connect to MongoDB"
# ✅ 해결:
docker ps | grep mongo                # MongoDB 컨테이너 확인
docker restart mongodb              # MongoDB 재시작
docker logs mongodb                  # 로그 확인

# MongoDB가 없다면 새로 생성
docker run -d -p 27017:27017 --name mongodb mongo:7
```

#### 2. **API 클라이언트 생성 실패**
```bash
# 🔍 문제: "Cannot fetch openapi.json"
# ✅ 해결:
curl http://localhost:8000/openapi.json  # API 서버 확인
cd frontend
rm -rf src/lib/api/                      # 기존 생성된 파일 삭제
npm run generate-api                     # 재생성
```

#### 3. **포트 충돌 문제**
```bash
# 🔍 문제: "Port already in use"
# ✅ 해결:
lsof -i :3000     # Frontend 포트 확인
lsof -i :8000     # Backend 포트 확인
lsof -i :27017    # MongoDB 포트 확인

kill -9 <PID>     # 해당 프로세스 종료
```

#### 4. **패키지 설치 오류**
```bash
# 🔍 문제: Node.js/Python 버전 호환성
# ✅ 해결:
node --version    # 18+ 필요
python --version  # 3.11+ 필요

# 캐시 클리어
npm cache clean --force
pip cache purge
```

#### 5. **CORS 오류**
```bash
# 🔍 문제: "CORS policy blocked"
# ✅ 해결: backend/.env 파일 확인
ALLOWED_ORIGINS=["http://localhost:3000"]

# 또는 backend/app/core/config.py 확인
```

### 🔄 개발 환경 초기화

#### 완전 초기화
```bash
# 1. 모든 컨테이너 정리
docker-compose down -v

# 2. 이미지 재빌드
docker-compose up -d --build

# 3. 테스트 데이터 로드
python scripts/load_test_data.py
```

#### API 클라이언트 재생성
```bash
cd frontend
rm -rf src/lib/api/                    # 기존 파일 삭제
npm run generate-api                   # 재생성
npm run dev                           # 개발 서버 재시작
```

### 💡 유용한 팁

#### 검색 기능 활용
- **전역 검색**: 어느 페이지에서든 `/` 키를 눌러 검색 모달 열기
- **문서 검색**: 문서 페이지에서 `Ctrl+F`로 페이지 내 검색
- **필터링**: 검색 결과를 콘텐츠 유형별로 필터링

#### 게시판 고급 기능
- **임시저장**: 글 작성 중 자동으로 임시저장됨
- **이미지 첨부**: 드래그 앤 드롭으로 이미지 쉽게 첨부
- **마크다운 지원**: 에디터에서 마크다운 문법 사용 가능

#### 대시보드 네비게이션
- **URL 직접 접근**: `/dashboard/analytics/users` 직접 입력 가능
- **메뉴 자동 활성화**: URL 접근시 해당 메뉴가 자동으로 열림
- **Breadcrumb**: 상단 경로 표시로 현재 위치 확인

## 🎨 커스터마이징 가이드

### 🎭 테마 및 스타일 변경

#### TailwindCSS 커스터마이징
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // 브랜드 컬러 추가
        brand: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        }
      },
      fontFamily: {
        // 커스텀 폰트 추가
        sans: ['Inter', 'sans-serif'],
      }
    }
  }
}
```

#### CSS 변수 수정
```css
/* app/globals.css */
:root {
  --primary: #3b82f6;
  --secondary: #64748b;
  --accent: #f59e0b;
  --background: #ffffff;
  --foreground: #0f172a;
}

.dark {
  --primary: #60a5fa;
  --secondary: #94a3b8;
  --background: #0f172a;
  --foreground: #f8fafc;
}
```

### 🔧 API 확장

#### 새 라우터 추가
```python
# backend/app/routers/custom.py
from fastapi import APIRouter

router = APIRouter(prefix="/api/custom", tags=["custom"])

@router.get("/")
async def get_custom_data():
    return {"message": "Custom API endpoint"}
```

#### 라우터 등록
```python
# backend/app/main.py
from .routers import custom

app.include_router(custom.router)
```

#### Frontend API 클라이언트 업데이트
```bash
cd frontend
npm run generate-api  # 새로운 API 자동 생성
```

### 📝 문서 스타일링

#### MDX 컴포넌트 추가
```typescript
// components/MDXComponents.tsx
export const MDXComponents = {
  // 커스텀 컴포넌트 추가
  CustomAlert: ({ children, type = 'info' }) => (
    <div className={`alert alert-${type}`}>
      {children}
    </div>
  ),
  
  // 코드 블록 커스터마이징
  pre: ({ children }) => (
    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
      {children}
    </pre>
  ),
}
```

#### 마크다운 스타일 변경
```css
/* styles/markdown.css */
.prose {
  /* 제목 스타일 */
  h1 { @apply text-3xl font-bold text-gray-900 mb-6; }
  h2 { @apply text-2xl font-semibold text-gray-800 mb-4; }
  
  /* 링크 스타일 */
  a { @apply text-blue-600 hover:text-blue-800 underline; }
  
  /* 코드 블록 스타일 */
  code { @apply bg-gray-100 px-2 py-1 rounded text-sm; }
}
```

### 🔍 검색 엔진 변경

현재 FlexSearch 대신 다른 검색 엔진 사용:

#### Algolia 통합 (선택사항)
```typescript
// lib/search/algolia.ts
import algoliasearch from 'algoliasearch/lite';

const client = algoliasearch('YOUR_APP_ID', 'YOUR_SEARCH_KEY');
const index = client.initIndex('ndash_docs');

export const searchAlgolia = async (query: string) => {
  const { hits } = await index.search(query);
  return hits;
};
```

### 🌍 다국어 확장

#### 새 언어 추가
1. **문서 구조**: `docs/v1/ja/` (일본어 예시)
2. **라우팅 설정**: Next.js i18n 설정
3. **UI 번역**: `lib/i18n/` 폴더에 번역 파일 추가

```typescript
// lib/i18n/ja.ts
export const ja = {
  navigation: {
    docs: 'ドキュメント',
    blog: 'ブログ',
    forum: 'フォーラム',
    dashboard: 'ダッシュボード'
  },
  search: {
    placeholder: '検索...',
    noResults: '結果が見つかりません'
  }
};
```

## 🎯 고급 기능

### 📊 분석 및 모니터링

#### Google Analytics 통합
```typescript
// lib/analytics.ts
import { gtag } from 'ga-gtag';

export const trackEvent = (action: string, category: string, label?: string) => {
  gtag('event', action, {
    event_category: category,
    event_label: label,
  });
};
```

### 🔒 보안 강화

#### API Rate Limiting
```python
# backend/app/middleware/rate_limit.py
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@router.get("/")
@limiter.limit("10/minute")
async def limited_endpoint(request: Request):
    return {"message": "This endpoint is rate limited"}
```

### 🚀 성능 최적화

#### Redis 캐싱 추가
```python
# backend/app/core/cache.py
import redis
from typing import Optional

redis_client = redis.Redis(host='localhost', port=6379, db=0)

async def get_cache(key: str) -> Optional[str]:
    return redis_client.get(key)

async def set_cache(key: str, value: str, expire: int = 3600):
    redis_client.setex(key, expire, value)
```


#### Doc 확인
```python
python -c "
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check_data():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client.nd_se
    
    # Check documents
    docs = await db.docs.find({}).to_list(None)
    print(f'Documents in database: {len(docs)}')
    for doc in docs:
        print(f'  - {doc[\"slug\"]}: {doc[\"title\"]}')
    
    # Check navigation
    nav = await db.navigation.find_one({})
    if nav and 'navigation' in nav:
        print(f'Navigation items: {len(nav[\"navigation\"])}')
        for item in nav['navigation']:
            print(f'  - {item[\"slug\"]}: {item[\"title\"]}')
    
    client.close()

asyncio.run(check_data())
"
```

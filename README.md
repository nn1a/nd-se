# NDASH 통합 문서 시스템

Next.js 15와 FastAPI를 기반으로 한 현대적인 API-first 통합 문서 플랫폼입니다.

## ✨ 주요 기능

- 📄 **문서 시스템**: 다국어/버전 지원, 자동 TOC, MDX 컴포넌트
- 📝 **블로그**: 마크다운 기반, 태그/카테고리, RSS 피드
- 📊 **대시보드**: 3-depth 사이드바, 실시간 통계, 권한 관리
- 💬 **게시판**: Q&A, 댓글, 투표, 신고, 웹 에디터
- 🔍 **검색**: FlexSearch 기반 통합 검색 (/ 키로 모달 열기)
- 🔐 **인증**: JWT 기반 인증 (Access + Refresh 토큰)
- 🚀 **API-first**: 자동 생성 TypeScript 클라이언트

## 🛠️ 기술 스택

### Frontend
- **Next.js 15** - App Router, Server/Client Components
- **TypeScript** - 완전한 타입 안전성
- **TailwindCSS v4+** - 현대적 CSS 프레임워크
- **Shadcn UI** - 접근성 우선 컴포넌트
- **TanStack Query v5** - 서버 상태 관리
- **@hey-api/openapi-ts** - 자동 API 클라이언트 생성

### Backend
- **FastAPI** - 현대적 Python 웹 프레임워크
- **Pydantic v2** - 데이터 검증 및 직렬화
- **MongoDB + Motor** - 비동기 NoSQL 데이터베이스
- **JWT** - Access + Refresh 토큰 인증

## 🚀 빠른 시작

### 사전 요구사항

- **Node.js 18+** (프론트엔드)
- **Python 3.11+** (백엔드)
- **MongoDB 7+** (데이터베이스)

### 1. 레포지토리 클론 및 설정

```bash
git clone <repository-url>
cd nd-se
```

### 2. Docker를 사용한 실행 (권장)

```bash
# 모든 서비스 시작 (MongoDB + Backend + Frontend)
./start-dev.sh

# 또는 Docker Compose 사용
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

**접속 URL:**
- 🌐 Frontend: http://localhost:3000
- 🔌 Backend API: http://localhost:8000
- 📖 API 문서: http://localhost:8000/docs
- 📊 OpenAPI Schema: http://localhost:8000/openapi.json

### 3. 개발 환경 수동 설정

#### MongoDB 시작
```bash
# Docker로 MongoDB 실행
docker run -d -p 27017:27017 --name mongodb mongo:7

# 또는 로컬 MongoDB 사용
mongod --dbpath /your/db/path
```

#### Backend 시작
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# PYTHONPATH 설정하고 서버 시작
PYTHONPATH=/home/meakd/nd-se/backend uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend 시작
```bash
cd frontend
npm install

# FastAPI에서 TypeScript 클라이언트 생성
npm run generate-api

# 개발 서버 시작
npm run dev
```

### 4. 테스트 데이터 로드

```bash
# 테스트 문서 데이터 로드
python scripts/load_test_data.py

# 추가 테스트 데이터 삽입
python scripts/insert_test_data.py
```

### 5. 기본 로그인 정보

- **관리자**: `admin` / `admin`
- **일반 사용자**: `user` / `user`

## 📁 프로젝트 구조

```
nd-se/
├── 📁 frontend/                # Next.js 15 앱 (TypeScript)
│   ├── 📁 app/                # App Router
│   │   ├── 📁 docs/[...slug]/ # 동적 문서 라우팅
│   │   ├── 📁 dashboard/      # 3-depth 대시보드
│   │   ├── 📁 blog/           # 블로그 페이지
│   │   ├── 📁 forum/          # 게시판 페이지
│   │   └── 📁 auth/           # 인증 페이지
│   ├── 📁 components/         # React 컴포넌트
│   │   ├── 📁 ui/            # Shadcn UI 컴포넌트
│   │   ├── 📁 dashboard/     # 대시보드 전용 컴포넌트
│   │   └── 📁 docs/          # 문서 관련 컴포넌트
│   ├── 📁 lib/               # 유틸리티 및 설정
│   │   └── 📁 api/           # 수동 API 유틸리티
│   └── 📁 src/lib/api/       # 🤖 자동 생성 API 클라이언트
│
├── 📁 backend/                # FastAPI 앱 (Python)
│   └── 📁 app/
│       ├── 📁 core/          # 핵심 설정 (DB, Auth, Config)
│       ├── 📁 routers/       # API 라우터
│       │   ├── auth.py       # 🔐 인증 API
│       │   ├── docs.py       # 📄 문서 API
│       │   ├── blog.py       # 📝 블로그 API
│       │   ├── forum.py      # 💬 게시판 API
│       │   ├── dashboard.py  # 📊 대시보드 API
│       │   ├── analytics.py  # 📈 분석 API
│       │   └── users.py      # 👥 사용자 API
│       └── main.py           # FastAPI 앱 진입점
│
├── 📁 docs/                   # 📚 마크다운 문서
│   ├── 📁 v1/
│   │   ├── 📁 ko/            # 한국어 문서
│   │   └── 📁 en/            # 영어 문서
│   └── 📁 v2/                # 새 버전 문서
│
├── 📁 scripts/               # 🛠️ 유틸리티 스크립트
├── 📁 uploads/               # 📎 업로드된 파일
├── docker-compose.yml        # 🐳 Docker 설정
├── start-dev.sh              # 🚀 개발 환경 시작 스크립트
└── README.md                 # 📖 이 파일
```

## 🌟 핵심 특징

### 🤖 자동 API 클라이언트 생성
- FastAPI OpenAPI 스키마에서 TypeScript 클라이언트 자동 생성
- 타입 안전한 API 호출 및 TanStack Query 훅
- API 변경 시 `npm run generate-api`로 클라이언트 업데이트

### 📱 현대적 프론트엔드
- Next.js 15 App Router (서버/클라이언트 컴포넌트)
- TailwindCSS v4+ (성능 최적화)
- 접근성 우선 Shadcn UI 컴포넌트

### 🔍 통합 검색 시스템
- FlexSearch 기반 클라이언트 사이드 검색
- 문서, 블로그, 게시판 통합 검색
- `/` 키로 어디서나 검색 모달 열기

### 📊 3-Depth 대시보드
- 계층형 사이드바 네비게이션
- URL 직접 접근 시 메뉴 자동 활성화
- Breadcrumb 네비게이션

## 📚 문서 시스템

### 문서 구조
```
docs/
├── v1/                   # 버전 1
│   ├── ko/              # 한국어
│   │   ├── intro.md
│   │   └── guide.md
│   └── en/              # 영어
│       ├── intro.md
│       └── guide.md
└── v2/                   # 버전 2 (새로운 기능)
    └── ...
```

### 문서 메타데이터 (Frontmatter)
```markdown
---
title: "문서 제목"
description: "문서 설명"
tags: ["tag1", "tag2"]
version: "1.0"
lastUpdated: "2024-01-01"
---

# 문서 내용
```

### 지원 기능
- ✅ **자동 TOC 생성** (h2, h3, h4 헤더 기반)
- ✅ **MDX 컴포넌트** 지원 (React 컴포넌트 삽입 가능)
- ✅ **다국어 라우팅** `/docs/v1/ko/intro`
- ✅ **버전 분기** v1, v2, latest 등
- ✅ **SSR/ISR 렌더링** (SEO 최적화)

## 🔧 API 엔드포인트

### 🔐 인증 (`/api/auth`)
```bash
POST /api/auth/token        # 로그인 (username/password)
POST /api/auth/refresh      # 토큰 갱신
POST /api/auth/register     # 회원가입
GET  /api/auth/me           # 현재 사용자 정보
POST /api/auth/logout       # 로그아웃
```

### 📄 문서 (`/api/docs`)
```bash
GET  /api/docs/              # 문서 목록
GET  /api/docs/{path}        # 특정 문서 (예: v1/ko/intro)
POST /api/docs/              # 새 문서 생성 (관리자)
PUT  /api/docs/{path}        # 문서 수정 (관리자)
DELETE /api/docs/{path}      # 문서 삭제 (관리자)
```

### 📝 블로그 (`/api/blog`)
```bash
GET  /api/blog/              # 블로그 포스트 목록
GET  /api/blog/{slug}        # 특정 포스트
GET  /api/blog/rss           # RSS 피드
POST /api/blog/              # 새 포스트 작성
PUT  /api/blog/{slug}        # 포스트 수정
DELETE /api/blog/{slug}      # 포스트 삭제
```

### 💬 게시판 (`/api/forum`)
```bash
GET  /api/forum/             # 게시글 목록
GET  /api/forum/{id}         # 특정 게시글
POST /api/forum/             # 새 글 작성 (인증 필요)
PUT  /api/forum/{id}         # 글 수정 (작성자/관리자)
DELETE /api/forum/{id}       # 글 삭제 (작성자/관리자)
POST /api/forum/{id}/vote    # 게시글 투표
POST /api/forum/{id}/report  # 게시글 신고
```

### 📊 대시보드 (`/api/dashboard`)
```bash
GET  /api/dashboard/         # 대시보드 데이터
GET  /api/dashboard/stats    # 시스템 통계
GET  /api/analytics/         # 분석 데이터
```

### 👥 사용자 (`/api/users`)
```bash
GET  /api/users/             # 사용자 목록 (관리자)
GET  /api/users/{id}         # 특정 사용자
PUT  /api/users/{id}         # 사용자 정보 수정
```

## 🌍 환경변수 설정

### Frontend (`.env.local`)
```env
# Next.js 앱 설정
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# FastAPI 백엔드 URL (서버사이드에서 사용)
FASTAPI_BASE_URL=http://localhost:8000

# 검색 설정
NEXT_PUBLIC_SEARCH_ENABLED=true
```

### Backend (`.env`)
```env
# JWT 설정
SECRET_KEY=your-super-secret-key-change-in-production-please
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# MongoDB 설정
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=nd_se_db

# CORS 설정
ALLOWED_ORIGINS=["http://localhost:3000"]

# 파일 업로드
MAX_FILE_SIZE=10485760  # 10MB
UPLOAD_DIR=uploads/
```

## 🧪 개발 및 테스트

### API 클라이언트 생성
```bash
cd frontend

# FastAPI 서버가 실행 중일 때
npm run generate-api

# API 서버 상태 확인
npm run api:check
```

### 테스트 실행
```bash
# Backend 테스트
cd backend
source venv/bin/activate
pytest

# Frontend 테스트 (설정 필요)
cd frontend
npm run test
npm run test:e2e
```

### 코드 품질 검사
```bash
# Backend
cd backend
black . && isort . && flake8

# Frontend
cd frontend
npm run lint
npm run type-check
```

## 📱 주요 사용법

### 검색 기능 사용
- **전역 검색**: 어디서든 `/` 키를 눌러 검색 모달 열기
- **문서 내 검색**: `Ctrl+F`로 현재 페이지 내 검색
- **필터링**: 태그, 카테고리, 날짜별 필터링 지원

### 게시판 사용법
1. **글 작성**: 로그인 후 "새 글 작성" 클릭
2. **웹 에디터**: Tiptap 에디터로 리치 텍스트 편집
3. **이미지/파일**: 드래그 앤 드롭으로 첨부
4. **임시저장**: 작성 중 자동 임시저장
5. **투표/신고**: 게시글에 대한 투표 및 신고 기능

### 대시보드 네비게이션
- **3-depth 사이드바**: 최대 3단계 계층형 메뉴
- **URL 접근**: 직접 URL로 접근시 해당 메뉴 자동 활성화
- **Breadcrumb**: 현재 위치 표시 및 빠른 네비게이션

## 📦 프로덕션 배포

### Docker Compose를 사용한 배포 (권장)
```bash
# 프로덕션 환경 빌드 및 실행
docker-compose -f docker-compose.yml up -d --build

# 로그 확인
docker-compose logs -f

# 서비스 중지
docker-compose down

# 볼륨까지 함께 삭제
docker-compose down -v
```

### 개별 서비스 수동 배포

#### Frontend 배포
```bash
cd frontend

# 프로덕션 빌드
npm run build

# PM2로 프로덕션 서버 실행 (권장)
npm install -g pm2
pm2 start npm --name "ndash-frontend" -- start

# 또는 직접 실행
npm start
```

#### Backend 배포
```bash
cd backend

# 의존성 설치
pip install -r requirements.txt

# Gunicorn으로 프로덕션 서버 실행 (권장)
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

# 또는 Uvicorn 직접 실행
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Nginx 리버스 프록시 설정
```nginx
# /etc/nginx/sites-available/ndash
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 정적 파일 서빙
    location /uploads {
        alias /path/to/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 🔧 성능 최적화

### Frontend 최적화
- **Next.js ISR**: 문서 페이지 증분 정적 재생성
- **Image 최적화**: Next.js Image 컴포넌트 사용
- **Code Splitting**: 동적 import로 번들 분할
- **Service Worker**: 오프라인 캐싱 (선택적)

### Backend 최적화
- **MongoDB 인덱싱**: 검색 쿼리 최적화
- **Redis 캐싱**: API 응답 캐싱 (선택적)
- **Connection Pooling**: MongoDB 연결 풀링
- **Background Tasks**: Celery 또는 FastAPI BackgroundTasks

## 🚨 문제 해결

### 자주 발생하는 문제

#### 1. MongoDB 연결 실패
```bash
# MongoDB 서비스 확인
docker ps | grep mongo

# MongoDB 재시작
docker restart mongodb

# 로그 확인
docker logs mongodb
```

#### 2. API 클라이언트 생성 실패
```bash
# FastAPI 서버 실행 상태 확인
curl http://localhost:8000/openapi.json

# API 클라이언트 재생성
cd frontend
rm -rf src/lib/api/
npm run generate-api
```

#### 3. 포트 충돌 문제
```bash
# 포트 사용 중인 프로세스 확인
lsof -i :3000  # Frontend
lsof -i :8000  # Backend
lsof -i :27017 # MongoDB

# 프로세스 종료
kill -9 <PID>
```

#### 4. 패키지 설치 오류
```bash
# Node.js 버전 확인 (18+ 필요)
node --version

# Python 버전 확인 (3.11+ 필요)
python --version

# 캐시 클리어
npm cache clean --force
pip cache purge
```

### 로그 확인 방법
```bash
# Docker 환경
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f mongodb

# 개발 환경 - 터미널에서 직접 확인
```

### 개발 환경 초기화
```bash
# 전체 재시작
docker-compose down -v
docker-compose up -d --build

# 데이터베이스 초기화
python scripts/load_test_data.py
```

## 🤝 기여하기

### 개발 워크플로우
1. **Fork** 프로젝트
2. **Feature 브랜치** 생성: `git checkout -b feature/amazing-feature`
3. **변경사항 커밋**: `git commit -m 'Add amazing feature'`
4. **브랜치에 푸시**: `git push origin feature/amazing-feature`
5. **Pull Request** 생성

### 코딩 스타일 가이드
- **Frontend**: ESLint + Prettier 설정 준수
- **Backend**: Black + isort + flake8 스타일
- **Commit**: Conventional Commits 형식 권장

### API 변경 시 필수 작업
1. FastAPI 라우터 수정
2. `npm run generate-api` 실행
3. 관련 컴포넌트 업데이트
4. 테스트 케이스 추가

## 📄 라이선스 및 지원

### 라이선스
이 프로젝트는 **MIT 라이선스**를 따릅니다.

### 지원 및 문의
- 📝 **이슈**: GitHub Issues로 버그 리포트 및 기능 요청
- 💬 **토론**: GitHub Discussions로 일반적인 질문
- 📖 **문서**: 프로젝트 실행 후 `/docs` 페이지 참조
- 🔍 **검색**: 사이트 내에서 `/` 키를 눌러 통합 검색 사용

---

## ✅ 요구사양 준수 현황

| 기능 | 상태 | 설명 |
|------|------|------|
| 📄 문서 시스템 | ✅ 완료 | TOC, 버전/언어 분기, MDX, SSR |
| 📝 블로그 | ✅ 완료 | 태그/카테고리, RSS 피드 |
| 📊 대시보드 | ✅ 완료 | 3-depth 사이드바, 실시간 통계 |
| 💬 게시판 | ✅ 완료 | 웹 에디터, CRUD, 투표, 신고 |
| 🔍 검색 | ✅ 완료 | FlexSearch 통합 검색 |
| 🔐 인증 | ✅ 완료 | JWT Access + Refresh 토큰 |
| 🌍 다국어 | ✅ 완료 | 한국어/영어 지원 |
| 📱 반응형 | ✅ 완료 | 모바일/태블릿/데스크톱 |

**NDASH는 모든 요구사양을 만족하는 완전한 통합 문서 플랫폼입니다! 🎉**

---

**Made with ❤️ using Next.js 15 + FastAPI**

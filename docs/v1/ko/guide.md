---
title: "개발 가이드"
description: "NDASH 시스템 개발 방법"
---

# 개발 가이드

이 가이드는 NDASH 시스템을 개발하고 커스터마이징하는 방법을 설명합니다.

## 프로젝트 구조

```
ndash/
├── frontend/          # Next.js 프론트엔드
│   ├── app/          # App Router 페이지
│   ├── components/   # 재사용 가능한 컴포넌트
│   └── lib/          # 유틸리티 함수
├── backend/          # FastAPI 백엔드
│   ├── app/
│   │   ├── core/     # 핵심 설정
│   │   ├── routers/  # API 라우터
│   │   └── main.py   # 앱 엔트리포인트
└── docs/             # 마크다운 문서
```

## API 엔드포인트

### 문서 API
- `GET /api/docs/{path}` - 문서 가져오기
- `GET /api/docs/` - 문서 목록

### 블로그 API
- `GET /api/blog/` - 블로그 포스트 목록
- `GET /api/blog/{slug}` - 특정 포스트

### 게시판 API
- `GET /api/forum/` - 게시판 목록
- `POST /api/forum/` - 새 글 작성
- `GET /api/forum/{id}` - 특정 게시물

### 인증 API
- `POST /api/auth/token` - 로그인
- `POST /api/auth/register` - 회원가입
- `GET /api/auth/me` - 현재 사용자

## 환경 설정

### Frontend 환경변수
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend 환경변수
```env
SECRET_KEY=your-secret-key
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=nd_se_db
```

## 개발 서버 실행

### 프론트엔드
```bash
cd frontend
npm run dev
```

### 백엔드
```bash
cd backend
uvicorn app.main:app --reload
```

## 데이터베이스 스키마

### 사용자 (users)
```json
{
  "_id": "ObjectId",
  "username": "string",
  "email": "string",
  "hashed_password": "string",
  "is_active": "boolean"
}
```

### 블로그 포스트 (blog_posts)
```json
{
  "_id": "ObjectId",
  "title": "string",
  "content": "string",
  "excerpt": "string",
  "author": "string",
  "date": "string",
  "tags": ["string"],
  "slug": "string",
  "published": "boolean"
}
```

### 게시판 포스트 (forum_posts)
```json
{
  "_id": "ObjectId",
  "title": "string",
  "content": "string",
  "author": "string",
  "date": "string",
  "replies": "number",
  "views": "number",
  "tags": ["string"]
}
```

## 배포 가이드

### Docker를 사용한 배포
```bash
# 프론트엔드 빌드
cd frontend
docker build -t ndash-frontend .

# 백엔드 빌드
cd backend
docker build -t ndash-backend .

# Docker Compose로 실행
docker-compose up -d
```

## 기여하기

1. Fork 프로젝트
2. Feature 브랜치 생성
3. 변경사항 커밋
4. Pull Request 생성

더 자세한 내용은 [Contributing Guide](./contributing)를 참고하세요.

---
title: "시작하기"
description: "ND-SE 문서 시스템 소개"
---

# ND-SE 문서 시스템에 오신 것을 환영합니다

이 문서 시스템은 Next.js와 FastAPI를 기반으로 구축된 현대적인 통합 플랫폼입니다.

## 주요 기능

### 📄 문서 관리
- 다국어 지원 (한국어, 영어)
- 버전 관리 (v1, v2, latest)
- 자동 TOC 생성
- MDX 지원

### 📝 블로그
- Markdown 기반 작성
- 태그 및 카테고리
- 검색 기능
- RSS 피드

### 📊 대시보드
- 실시간 통계
- 사용자 활동 모니터링
- 콘텐츠 관리

### 💬 게시판
- Q&A 및 토론
- 댓글 시스템
- 태그 기반 분류

## 빠른 시작

### 1. 환경 설정

프론트엔드 (Next.js):
```bash
cd frontend
npm install
npm run dev
```

백엔드 (FastAPI):
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 2. 문서 작성

문서는 `docs/` 폴더에 다음과 같은 구조로 작성합니다:

```
docs/
├── v1/
│   ├── ko/
│   │   ├── intro.md
│   │   └── guide.md
│   └── en/
│       ├── intro.md
│       └── guide.md
└── v2/
    └── ...
```

### 3. 블로그 포스트 작성

블로그 포스트는 API를 통해 관리하거나 데이터베이스에 직접 추가할 수 있습니다.

## 기술 스택

- **Frontend**: Next.js 15, TypeScript, TailwindCSS
- **Backend**: FastAPI, Python
- **Database**: MongoDB
- **Search**: FlexSearch
- **Auth**: JWT

## 다음 단계

- [설치 가이드](./installation)
- [API 문서](./api)
- [기여 가이드](./contributing)

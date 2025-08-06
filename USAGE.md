# ND-SE 시스템 사용 가이드

## 시스템 개요

ND-SE는 요구사양서에 따라 구현된 통합 문서 시스템입니다. 다음과 같은 주요 기능들을 제공합니다:

### ✅ 구현된 기능

1. **📄 문서 시스템**
   - 다국어 지원 (한국어/영어)
   - 버전 분기 (v1, v2 등)
   - 자동 TOC 생성
   - MDX 지원
   - SSR/ISR 렌더링

2. **📝 블로그 시스템**
   - 마크다운 기반 포스트
   - 태그 시스템
   - 날짜별 정렬
   - 검색 기능

3. **📊 대시보드**
   - 실시간 통계
   - 사용자 활동 모니터링
   - 인기 콘텐츠 표시

4. **💬 게시판 (포럼)**
   - Q&A 기능
   - 댓글 시스템
   - 태그 분류
   - 인증 기반 글쓰기

5. **🔐 인증 시스템**
   - JWT 기반 인증
   - Access/Refresh 토큰
   - 사용자 등록/로그인

## 사용 방법

### 1. 시스템 시작

#### Docker 사용 (권장):
```bash
docker-compose up -d
```

#### 개발 환경:
```bash
./start-dev.sh  # Linux/Mac
start-dev.bat   # Windows
```

### 2. 문서 작성

문서는 `docs/` 폴더에 다음 구조로 작성:

```
docs/
├── v1/
│   ├── ko/           # 한국어 문서
│   │   ├── intro.md
│   │   └── guide.md
│   └── en/           # 영어 문서
│       ├── intro.md
│       └── guide.md
└── v2/               # 새 버전
```

각 마크다운 파일은 frontmatter 포함:
```markdown
---
title: "문서 제목"
description: "문서 설명"
---

# 내용

...
```

### 3. 사용자 인터페이스

#### 메인 페이지 (/)
- 시스템 개요
- 각 기능별 링크

#### 문서 페이지 (/docs/[...slug])
- 동적 라우팅: `/docs/v1/ko/intro`
- 자동 TOC 생성
- 이전/다음 문서 네비게이션

#### 블로그 페이지 (/blog)
- 포스트 목록
- 태그별 필터링
- 개별 포스트 페이지

#### 대시보드 (/dashboard)
- 시스템 통계
- 실시간 활동 정보
- 인기 콘텐츠

#### 게시판 (/forum)
- 게시글 목록
- 새 글 작성 (인증 필요)
- 개별 게시글 보기

### 4. API 사용법

#### 인증
```bash
# 로그인
curl -X POST "http://localhost:8000/api/auth/token" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "username=admin&password=admin"

# 사용자 정보
curl -H "Authorization: Bearer <token>" \
     "http://localhost:8000/api/auth/me"
```

#### 문서
```bash
# 문서 가져오기
curl "http://localhost:8000/api/docs/v1/ko/intro"

# 문서 목록
curl "http://localhost:8000/api/docs/"
```

#### 블로그
```bash
# 블로그 포스트 목록
curl "http://localhost:8000/api/blog/"

# 특정 포스트
curl "http://localhost:8000/api/blog/nextjs-fastapi-fullstack"
```

### 5. 개발 정보

#### 포트 정보
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API 문서: http://localhost:8000/docs
- MongoDB: mongodb://localhost:27017

#### 디렉토리 구조
```
nd-se/
├── frontend/         # Next.js 앱
├── backend/          # FastAPI 앱
├── docs/             # 마크다운 문서
├── docker-compose.yml
└── README.md
```

#### 환경 설정
- Frontend: `.env.local`
- Backend: `.env`
- 예제 파일들이 제공됨

## 배포

### Docker를 사용한 배포
```bash
# 전체 스택 배포
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 중지
docker-compose down
```

### 개별 서비스 배포

#### Frontend
```bash
cd frontend
npm run build
npm start
```

#### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## 문제 해결

### 자주 발생하는 문제들

1. **MongoDB 연결 실패**
   - Docker MongoDB 컨테이너 확인
   - 포트 27017 사용 여부 확인

2. **패키지 설치 오류**
   - Node.js 18+ 필요
   - Python 3.11+ 필요

3. **CORS 오류**
   - Backend CORS 설정 확인
   - Frontend API URL 설정 확인

### 로그 확인
```bash
# Docker 로그
docker-compose logs backend
docker-compose logs frontend

# 개발 모드 로그
# 터미널에서 직접 확인 가능
```

## 커스터마이징

### 테마 변경
- `frontend/app/globals.css`에서 CSS 변수 수정
- Tailwind 설정은 `tailwind.config.js`에서 변경

### API 확장
- `backend/app/routers/`에 새 라우터 추가
- `main.py`에 라우터 등록

### 문서 스타일링
- MDX 컴포넌트로 커스텀 요소 추가
- CSS로 마크다운 스타일 변경

이제 요구사양서에 명시된 모든 기능이 구현된 통합 문서 시스템이 완성되었습니다! 🎉

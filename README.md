# ND-SE 통합 문서 시스템

Next.js와 FastAPI를 기반으로 한 현대적인 통합 문서 시스템입니다.

## ✨ 주요 기능

- 📄 **문서 시스템**: 다국어 지원, 버전 관리, 자동 TOC 생성
- 📝 **블로그**: 마크다운 기반, 태그/검색 기능
- 📊 **대시보드**: 실시간 통계 및 모니터링
- 💬 **게시판**: Q&A 및 토론 플랫폼
- 🔍 **검색**: FlexSearch 기반 통합 검색
- 🔐 **인증**: JWT 기반 사용자 인증

## 🛠️ 기술 스택

### Frontend
- **Next.js 15** - React 프레임워크
- **TypeScript** - 타입 안전성
- **TailwindCSS v4+** - 유틸리티 CSS
- **Shadcn UI** - UI 컴포넌트

### Backend
- **FastAPI** - 현대적인 Python 웹 프레임워크
- **Pydantic** - 데이터 검증
- **MongoDB** - NoSQL 데이터베이스
- **JWT** - 토큰 기반 인증

## 🚀 빠른 시작

### 사전 요구사항

- Node.js 18+
- Python 3.11+
- MongoDB (또는 Docker)

### 1. 레포지토리 클론

```bash
git clone https://github.com/your-repo/nd-se.git
cd nd-se
```

### 2. Docker를 사용한 실행 (권장)

```bash
# 모든 서비스 시작
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API 문서: http://localhost:8000/docs

### 3. 개발 환경 설정

#### Frontend 설정

```bash
cd frontend
npm install
npm run dev
```

#### Backend 설정

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 4. MongoDB 설정

로컬 MongoDB가 없는 경우:

```bash
docker run -d -p 27017:27017 --name mongodb mongo:7
```

## 📁 프로젝트 구조

```
nd-se/
├── frontend/              # Next.js 프론트엔드
│   ├── app/              # App Router
│   ├── components/       # React 컴포넌트
│   └── lib/              # 유틸리티
├── backend/              # FastAPI 백엔드
│   ├── app/
│   │   ├── core/         # 핵심 설정
│   │   ├── routers/      # API 라우터
│   │   └── main.py       # 메인 앱
├── docs/                 # 마크다운 문서
│   ├── v1/
│   │   ├── ko/          # 한국어 문서
│   │   └── en/          # 영어 문서
│   └── v2/
├── docker-compose.yml    # Docker 설정
└── README.md
```

## 📚 문서 작성

문서는 `docs/` 폴더에 다음 구조로 작성합니다:

```
docs/
├── v1/                   # 버전 1
│   ├── ko/              # 한국어
│   │   ├── intro.md
│   │   └── guide.md
│   └── en/              # 영어
│       ├── intro.md
│       └── guide.md
└── v2/                   # 버전 2
    └── ...
```

### 문서 메타데이터

각 마크다운 파일은 frontmatter를 포함해야 합니다:

```markdown
---
title: "문서 제목"
description: "문서 설명"
---

# 문서 내용

...
```

## 🔧 API 엔드포인트

### 인증
- `POST /api/auth/token` - 로그인
- `POST /api/auth/register` - 회원가입
- `GET /api/auth/me` - 현재 사용자

### 문서
- `GET /api/docs/{path}` - 문서 가져오기
- `GET /api/docs/` - 문서 목록

### 블로그
- `GET /api/blog/` - 블로그 포스트 목록
- `GET /api/blog/{slug}` - 특정 포스트

### 게시판
- `GET /api/forum/` - 게시판 목록
- `POST /api/forum/` - 새 글 작성 (인증 필요)
- `GET /api/forum/{id}` - 특정 게시물

### 대시보드
- `GET /api/dashboard/` - 대시보드 데이터
- `GET /api/dashboard/stats` - 시스템 통계

## 🌍 환경변수

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (.env)

```env
SECRET_KEY=your-secret-key-change-in-production
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=nd_se_db
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

## 🧪 테스트

### Frontend 테스트

```bash
cd frontend
npm run test
npm run test:e2e
```

### Backend 테스트

```bash
cd backend
pytest
```

## 📦 배포

### Docker를 사용한 프로덕션 배포

```bash
# 프로덕션 빌드
docker-compose -f docker-compose.prod.yml up -d

# Nginx 프록시 사용
docker-compose up -d nginx
```

### 수동 배포

1. Frontend 빌드:
```bash
cd frontend
npm run build
npm start
```

2. Backend 실행:
```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## 🤝 기여하기

1. Fork 프로젝트
2. Feature 브랜치 생성: `git checkout -b feature/new-feature`
3. 변경사항 커밋: `git commit -am 'Add new feature'`
4. 브랜치에 푸시: `git push origin feature/new-feature`
5. Pull Request 생성

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참고하세요.

## 🆘 지원

- 이슈: [GitHub Issues](https://github.com/your-repo/nd-se/issues)
- 토론: [GitHub Discussions](https://github.com/your-repo/nd-se/discussions)
- 문서: [http://localhost:3000/docs](http://localhost:3000/docs)

---

**Made with ❤️ by ND-SE Team**

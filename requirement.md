
# ✅ 요구사양서: 통합 문서 시스템 (Next.js + FastAPI)

## 1. 📌 개요

본 시스템은 Next.js 기반의 React SPA/SSR 웹앱으로 구성되며, 문서, 블로그, 대시보드, 게시판 기능을 포함합니다. 콘텐츠는 FastAPI 백엔드와 실시간으로 연동되며, 문서는 소스코드와 분리되어 독립적으로 배포 및 업데이트됩니다.

---

## 2. 🎯 주요 기능 및 요구사항

### 2.1 📄 문서 기능 (Documentation)

| 항목 | 설명 |
|------|------|
| 콘텐츠 형식 | Markdown (.md, .mdx) |
| 버전 관리 | /docs/v1/ko/intro.md, /docs/v2/en/guide.md 형태 |
| 언어 지원 | 다국어 (예: 한국어, 영어 등) |
| 라우팅 구조 | /docs/[version]/[lang]/[slug] |
| 렌더링 방식 | SSR 또는 ISR (Incremental Static Regeneration) |
| TOC 자동 생성 | Markdown 헤더(heading)로부터 자동 생성 (h2, h3, h4) |
| MDX 지원 | 문서 내 React 컴포넌트 삽입 가능 |
| 문서 API 연동 | FastAPI로부터 Markdown 콘텐츠를 API로 fetch |
| 문서 수정 시 반영 | Git, CMS 등에서 문서 변경 시 자동 반영 (SSR, webhook 등 활용) |

### 2.2 📝 블로그 기능 (Blog)

| 항목 | 설명 |
|------|------|
| 콘텐츠 형식 | Markdown 또는 MDX |
| 태그/카테고리 | 다중 태그 지원 |
| 날짜 기반 정렬 | 최신순 정렬 및 페이징 |
| 라우팅 | /blog/[slug] |
| 검색 | 문서와 통합된 검색 대상 |
| RSS 피드 | 선택적으로 RSS 피드 생성 지원 |

### 2.3 📊 대시보드 기능 (Dashboard)

| 항목 | 설명 |
|------|------|
| 렌더링 | SSR 또는 CSR (클라이언트 데이터 요청) |
| 데이터 소스 | FastAPI에서 제공하는 JSON API |
| 기능 예 | 통계 차트, 상태 정보, 사용자 정보 등 |
| 보안 | 인증된 사용자만 접근 가능 (JWT 기반) |
| 사이드바 | 3depth 이상 지원하는 계층형 메뉴 구조 |
| 메뉴 활성화 | URL 직접 접속 시 해당 메뉴 자동 활성화 |
| 네비게이션 | breadcrumb과 active 상태 표시 |

### 2.4 💬 게시판 (Forum/QnA)

| 항목 | 설명 |
|------|------|
| 기능 | 글쓰기, 댓글, 추천, 신고 등 |
| 데이터 관리 | FastAPI 기반 REST API (CRUD 지원) |
| 인증 | JWT 기반 사용자 인증 (ASSSO 로그인 포함) |
| 정렬/필터 | 최신순, 인기순, 태그별 필터링 |
| 권한 | 사용자/관리자 권한 분리 및 제어 |

---

## 3. 🔍 검색 기능

| 항목 | 설명 |
|------|------|
| 대상 | 문서, 블로그, 게시판 |
| 구현 방식 | 클라이언트/서버 사이드 검색 (FlexSearch 등) 또는 Algolia DocSearch 연동 |
| 인덱스 구성 | 제목, 본문, 태그, 버전, 언어 등 포함 |
| 하이라이트 표시 | 검색어 하이라이트 기능 포함 |

---

## 4. 🌐 다국어 및 버전 분기

| 항목 | 설명 |
|------|------|
| 언어 구조 | /docs/[version]/[lang]/[slug] |
| 번역 방식 | Markdown 폴더 분기 (/docs/v1/ko, /docs/v1/en) |
| 지원 언어 | 기본: 한국어(ko), 영어(en) |
| 버전 분기 | v1, v2, latest 등으로 구성 |
| 기본 언어/버전 | 설정 가능 (/docs → /docs/v2/en/intro 리디렉션) |

---

## 5. ⚙️ 시스템 아키텍처

```
+----------------------+           +---------------------+
|  Git/CMS 문서 저장소 | ─────▶   |   FastAPI 서버 (문서 API) |
+----------------------+           +---------------------+
                                                  │
                                                  ▼
                                    +-------------------------+
                                    | Next.js (SSR + CSR 앱)  |
                                    | - 문서 렌더링            |
                                    | - 블로그/게시판/대시보드 |
                                    +-------------------------+
```

### 구성 요약

| 컴포넌트 | 설명 |
|----------|------|
| Next.js App | 프론트엔드, 라우팅, SSR/CSR 처리 |
| FastAPI | API 서버, 문서/블로그/게시판 등 데이터 제공 |
| Markdown 저장소 | GitHub, S3, 또는 CMS (예: Notion API) |
| 인증 서버 | JWT 기반 로그인 및 권한 인증 처리 |

---

## 6. 🛠️ 기술 스택

| 영역 | 스택 |
|------|------|
| 프론트엔드 | Next.js 15+, TypeScript, TailwindCSS v4+, Shadcn UI, React Markdown, MDX |
| 백엔드 | FastAPI, Uvicorn, Pydantic, Mongodb/DB (선택) |
| 검색 | FlexSearch (기본) or Algolia (선택) 또는 다른 검색툴 사용 가능 |
| 인증 | JWT (Access + Refresh 토큰) |
| 배포 | Docker + Nginx |
| 문서 업데이트 트리거 | Webhook, ISR, API revalidate |

---

## 7. ✅ 요구되는 결과

- [ ] 문서 시스템 (TOC + 버전 + 언어 분기 + SSR)
- [ ] 블로그 페이지 (태그 + 날짜 + 검색)
- [ ] 대시보드 예시 페이지 (FastAPI API 연동)
- [ ] 게시판 CRUD (JWT 인증 연동 포함)
- [ ] 검색 기능 구현 (FlexSearch 또는 Algolia)
- [ ] FastAPI 서버 예제 (Markdown 반환 및 API 라우팅)

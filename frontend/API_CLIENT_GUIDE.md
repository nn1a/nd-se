# API Client Generation Guide

이 가이드는 `@hey-api/openapi-ts`와 `@tanstack/react-query`를 사용하여 FastAPI 백엔드와의 API 클라이언트를 설정하는 방법을 설명합니다.

## 설정 완료 사항

### 1. 패키지 설치
- `@hey-api/openapi-ts`: OpenAPI 스키마에서 TypeScript 클라이언트 생성
- `@tanstack/react-query`: 서버 상태 관리 및 캐싱

### 2. 설정 파일
- `openapi-ts.config.ts`: OpenAPI 클라이언트 생성 설정
- `.env.local`: 환경 변수 설정

### 3. API 클라이언트 구조
```
src/lib/
├── api-client.ts        # API 클라이언트 설정 및 인터셉터
├── query-client.ts      # React Query 설정
├── types.ts             # 공통 타입 정의
└── api/                 # 생성될 API 클라이언트 (자동 생성)
    ├── client.ts
    ├── types.ts
    └── services/
```

### 4. React Query 훅
- `hooks/useAuth.ts`: 인증 관련 훅
- `hooks/useDocs.ts`: 문서 관련 훅  
- `hooks/useBlog.ts`: 블로그 관련 훅
- `hooks/useForum.ts`: 게시판 관련 훅
- `hooks/useDashboard.ts`: 대시보드 관련 훅
- `hooks/useSearch.ts`: 검색 관련 훅

## API 클라이언트 생성 방법

### 1. 백엔드 서버 실행
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. OpenAPI 스키마 확인
브라우저에서 http://localhost:8000/docs 또는 http://localhost:8000/openapi.json 접속하여 스키마 확인

### 3. API 클라이언트 생성
```bash
cd frontend
npm run generate-api
# 또는
npm run api:generate
```

### 4. 생성된 파일 확인
- `src/lib/api/client.ts`: Axios 기반 API 클라이언트
- `src/lib/api/types.ts`: API 타입 정의
- `src/lib/api/services/`: 각 엔드포인트별 서비스 함수들
- React Query 훅들 (TanStack Query 플러그인 사용 시)

## 사용 방법

### 1. 프로바이더 설정 (이미 완료)
```tsx
// app/providers.tsx
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/query-client'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

### 2. 커스텀 훅 사용
```tsx
// 문서 목록 조회
const { data, isLoading, error } = useDocuments({
  version: 'v1',
  language: 'ko',
  page: 1,
  limit: 10
});

// 블로그 포스트 생성
const createPost = useCreateBlogPost();

const handleSubmit = async (postData) => {
  try {
    await createPost.mutateAsync(postData);
    // 성공 처리
  } catch (error) {
    // 에러 처리
  }
};
```

### 3. 직접 API 호출
```tsx
import { apiRequest } from '@/lib/api-client';

// 직접 API 호출 (fallback)
const data = await apiRequest('/api/docs', {
  method: 'GET'
});
```

## 주요 기능

### 1. 자동 인증 토큰 관리
- Access Token 자동 첨부
- Token 만료 시 자동 갱신
- 갱신 실패 시 자동 로그아웃

### 2. 에러 처리
- 401 Unauthorized 자동 처리
- 네트워크 에러 재시도
- 타입 안전한 에러 핸들링

### 3. 캐싱 및 상태 관리
- 5분간 stale time 설정
- 자동 백그라운드 업데이트
- Optimistic 업데이트 지원

### 4. TypeScript 지원
- 완전한 타입 안전성
- API 스키마 기반 자동 타입 생성
- IDE 자동완성 지원

## 환경 변수

`.env.local` 파일에서 설정:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## 주의사항

1. **백엔드 서버 실행**: API 클라이언트 생성 전에 FastAPI 서버가 실행되어야 합니다.
2. **CORS 설정**: 백엔드에서 적절한 CORS 설정이 필요합니다.
3. **타입 동기화**: API 스키마 변경 시 클라이언트 재생성이 필요합니다.

## 트러블슈팅

### API 클라이언트 생성 실패
- 백엔드 서버가 실행 중인지 확인
- OpenAPI 스키마 URL이 올바른지 확인
- 네트워크 연결 상태 확인

### 타입 에러
- `npm run generate-api` 재실행
- TypeScript 서버 재시작

### 인증 문제
- localStorage에 토큰이 저장되어 있는지 확인
- 토큰 만료 시간 확인
- 백엔드 인증 로직 확인

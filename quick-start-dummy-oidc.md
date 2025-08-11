# 🚀 더미 OIDC Provider 빠른 시작 가이드

## ⚡ 1분 설정

### 1. 환경변수 설정
`backend/.env` 파일 생성 또는 수정:
```bash
# 기본 설정 (기존 유지)
ENVIRONMENT=development
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=nd_se_db

# 더미 OIDC 활성화
OIDC_ENABLED=true
OIDC_CLIENT_ID=dummy-client-id  
OIDC_CLIENT_SECRET=dummy-client-secret
OIDC_DISCOVERY_URL=http://localhost:8000/dummy-oidc/.well-known/openid_configuration
OIDC_REDIRECT_URI=http://localhost:8000/api/auth/oidc/callback
OIDC_SCOPES=openid profile email
```

### 2. 서버 시작
```bash
# 터미널 1: Backend
cd backend
PYTHONPATH=/home/meakd/nd-se/backend uvicorn app.main:app --reload

# 터미널 2: Frontend  
cd frontend
npm run dev
```

### 3. 테스트
브라우저에서 `http://localhost:3000/auth/login` 접근 → **SSO로 로그인** 버튼 클릭

## 🔗 주요 URL

- **프론트엔드**: http://localhost:3000
- **로그인 페이지**: http://localhost:3000/auth/login
- **백엔드 API**: http://localhost:8000
- **더미 OIDC Info**: http://localhost:8000/dummy-oidc/
- **OIDC Discovery**: http://localhost:8000/dummy-oidc/.well-known/openid_configuration

## 👥 테스트 사용자

| 사용자 | 이메일 | 권한 |
|--------|--------|------|
| admin | admin@example.com | 관리자 |
| user | user@example.com | 일반 사용자 |
| developer | dev@example.com | 개발자 |

## 🧪 자동 테스트 실행
```bash
./test-oidc-flow.sh
```

## ⚡ 트러블슈팅

**SSO 버튼이 보이지 않는 경우:**
1. 백엔드 서버가 실행 중인지 확인
2. `http://localhost:8000/api/auth/oidc/status` 에서 `enabled: true` 확인
3. 브라우저 개발자 도구에서 네트워크 에러 확인

**로그인이 안 되는 경우:**
1. 브라우저 개발자 도구 콘솔 확인
2. 백엔드 서버 로그 확인
3. MongoDB가 실행 중인지 확인 (선택사항)

## 🎯 완료!
이제 더미 OIDC Provider로 SSO 기능을 자유롭게 테스트할 수 있습니다! 🎉
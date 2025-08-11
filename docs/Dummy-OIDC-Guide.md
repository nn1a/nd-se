# 🔐 더미 OIDC Provider 사용 가이드

로컬 개발을 위한 더미 OIDC Provider가 구현되었습니다. 실제 외부 OIDC 서비스 없이도 SSO 기능을 테스트할 수 있습니다.

## ✨ 주요 기능

- **완전한 OIDC 플로우**: Authorization Code Grant + PKCE 지원
- **3명의 더미 사용자**: admin, user, developer
- **웹 기반 로그인**: 사용자 선택 인터페이스
- **JWT 토큰**: 실제와 유사한 토큰 구조
- **사용자 정보**: 프로필, 이메일 등 클레임 제공

## 🚀 빠른 시작

### 1. 환경 설정

`backend/.env` 파일에 다음 설정을 추가하거나 주석을 해제하세요:

```bash
# 개발용 더미 OIDC 설정
OIDC_ENABLED=true
OIDC_CLIENT_ID=dummy-client-id
OIDC_CLIENT_SECRET=dummy-client-secret
OIDC_DISCOVERY_URL=http://localhost:8000/dummy-oidc/.well-known/openid_configuration
OIDC_REDIRECT_URI=http://localhost:8000/api/auth/oidc/callback
OIDC_SCOPES=openid profile email
```

### 2. 서버 시작

백엔드 서버를 시작합니다:

```bash
cd backend
PYTHONPATH=/home/meakd/nd-se/backend uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

프론트엔드 서버를 시작합니다:

```bash
cd frontend
npm run dev
```

### 3. SSO 로그인 테스트

1. 브라우저에서 `http://localhost:3000/auth/login` 접근
2. **"SSO로 로그인"** 버튼이 표시됨을 확인
3. SSO 버튼 클릭
4. 더미 OIDC 로그인 페이지가 표시됨
5. 사용자 선택 (admin, user, developer 중 하나)
6. 로그인 버튼 클릭
7. 자동으로 프론트엔드로 리다이렉트되어 로그인 완료

## 👥 더미 사용자 정보

### 👨‍💼 Admin User
```json
{
  "sub": "dummy-admin-123",
  "preferred_username": "admin",
  "name": "Admin User",
  "email": "admin@example.com",
  "role": "admin"
}
```

### 👤 Regular User
```json
{
  "sub": "dummy-user-456",
  "preferred_username": "user", 
  "name": "Test User",
  "email": "user@example.com",
  "role": "user"
}
```

### 👨‍💻 Developer
```json
{
  "sub": "dummy-dev-789",
  "preferred_username": "developer",
  "name": "Developer User", 
  "email": "dev@example.com",
  "role": "user"
}
```

## 🔧 API 엔드포인트

### 더미 OIDC Provider 엔드포인트

- **Provider Info**: `GET /dummy-oidc/`
- **Discovery Document**: `GET /dummy-oidc/.well-known/openid_configuration`
- **Authorization**: `GET /dummy-oidc/auth`
- **Token Exchange**: `POST /dummy-oidc/token`
- **User Info**: `GET /dummy-oidc/userinfo`
- **JWKS**: `GET /dummy-oidc/jwks`

### 애플리케이션 OIDC 엔드포인트

- **Status**: `GET /api/auth/oidc/status`
- **Login Start**: `GET /api/auth/oidc/login`
- **Callback**: `GET /api/auth/oidc/callback`

## 🧪 수동 테스트

### 1. OIDC 상태 확인
```bash
curl http://localhost:8000/api/auth/oidc/status
# 응답: {"enabled":true,"configured":true}
```

### 2. Discovery Document 확인
```bash
curl http://localhost:8000/dummy-oidc/.well-known/openid_configuration
```

### 3. 로그인 URL 생성
```bash
curl http://localhost:8000/api/auth/oidc/login
```

### 4. 로그인 페이지 접근
브라우저에서 반환된 `authorization_url`에 접근하여 로그인 페이지 확인

## 🛠️ 커스터마이징

### 더미 사용자 추가

`backend/app/routers/dummy_oidc.py`의 `DUMMY_USERS` 딕셔너리에 사용자를 추가할 수 있습니다:

```python
DUMMY_USERS = {
    "custom_user": {
        "sub": "dummy-custom-999",
        "preferred_username": "custom",
        "name": "Custom User",
        "email": "custom@example.com",
        "department": "Engineering",  # 추가 클레임
        "role": "manager"
    }
}
```

### JWT 시크릿 변경

보안을 위해 `JWT_SECRET` 값을 변경할 수 있습니다:

```python
JWT_SECRET = "your-custom-secret-key"
```

## 🔍 디버깅

### 로그 확인

백엔드 서버 로그에서 OIDC 관련 요청을 확인할 수 있습니다:

```bash
INFO: GET /dummy-oidc/auth - 200 OK
INFO: POST /dummy-oidc/token - 200 OK
INFO: GET /api/auth/oidc/callback - 302 Found
```

### 토큰 검증

생성된 JWT 토큰을 https://jwt.io 에서 디코드하여 내용을 확인할 수 있습니다.

### 세션 상태 확인

더미 Provider는 메모리에 세션을 저장합니다. 서버를 재시작하면 모든 세션이 초기화됩니다.

## ⚠️ 주의사항

1. **개발용 전용**: 이 더미 Provider는 개발 목적으로만 사용하세요.
2. **프로덕션 금지**: 실제 운영 환경에서는 절대 사용하지 마세요.
3. **보안 없음**: 실제 비밀번호나 인증 없이 동작합니다.
4. **메모리 저장**: 서버 재시작 시 모든 토큰과 세션이 초기화됩니다.

## 🚫 프로덕션 사용 시

프로덕션에서는 다음과 같은 실제 OIDC Provider를 사용하세요:

- **Azure AD**: Microsoft 계정 통합
- **Google Workspace**: Google 계정 통합  
- **Okta**: 엔터프라이즈 SSO
- **Auth0**: 다양한 소셜 로그인
- **KeyCloak**: 오픈소스 자체 호스팅

## 📋 체크리스트

전체 SSO 플로우가 정상 작동하는지 확인하세요:

- [ ] 백엔드 서버 시작됨 (`http://localhost:8000`)
- [ ] 프론트엔드 서버 시작됨 (`http://localhost:3000`)
- [ ] OIDC 상태가 `enabled: true, configured: true`로 표시됨
- [ ] 로그인 페이지에 SSO 버튼이 표시됨
- [ ] SSO 버튼 클릭 시 더미 로그인 페이지 표시됨
- [ ] 사용자 선택 및 로그인 후 자동 리다이렉트됨
- [ ] 프론트엔드에서 로그인 상태가 정상적으로 표시됨
- [ ] 사용자 정보가 올바르게 표시됨

## 🎯 다음 단계

더미 OIDC Provider로 개발을 완료한 후:

1. 실제 OIDC Provider 설정 준비
2. 환경변수를 실제 값으로 변경
3. 프로덕션 배포 전 실제 Provider와 테스트
4. 보안 검토 및 최종 검증

---

Happy coding! 🚀
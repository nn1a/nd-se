#!/bin/bash

echo "🔐 더미 OIDC Provider 테스트 시작"
echo "======================================"

# 1. OIDC 상태 확인
echo "1. OIDC 상태 확인..."
response=$(curl -s http://localhost:8000/api/auth/oidc/status)
echo "응답: $response"

if [[ $response == *"\"enabled\":true"* ]]; then
    echo "✅ OIDC가 활성화되어 있습니다."
else
    echo "❌ OIDC가 비활성화되어 있습니다. 서버 설정을 확인하세요."
    exit 1
fi

echo ""

# 2. 로그인 URL 생성
echo "2. 로그인 URL 생성..."
login_response=$(curl -s http://localhost:8000/api/auth/oidc/login)
echo "응답: $login_response"

# JSON에서 authorization_url과 state 추출
auth_url=$(echo $login_response | grep -o '"authorization_url":"[^"]*' | cut -d'"' -f4)
state=$(echo $login_response | grep -o '"state":"[^"]*' | cut -d'"' -f4)

if [ -z "$auth_url" ]; then
    echo "❌ 로그인 URL 생성에 실패했습니다."
    exit 1
fi

echo "✅ 로그인 URL이 생성되었습니다."
echo "State: $state"
echo ""

# 3. 더미 로그인 페이지 접근 테스트
echo "3. 더미 로그인 페이지 접근 테스트..."
login_page=$(curl -s "$auth_url")

if [[ $login_page == *"Dummy OIDC Provider"* ]]; then
    echo "✅ 더미 로그인 페이지에 성공적으로 접근했습니다."
else
    echo "❌ 더미 로그인 페이지 접근에 실패했습니다."
    exit 1
fi

echo ""

# 4. 수동 로그인 시뮬레이션 (developer 사용자 선택)
echo "4. 수동 로그인 시뮬레이션 (developer 사용자)..."

# URL에서 파라미터 추출
client_id=$(echo "$auth_url" | grep -o 'client_id=[^&]*' | cut -d'=' -f2)
redirect_uri=$(echo "$auth_url" | grep -o 'redirect_uri=[^&]*' | cut -d'=' -f2)
scope=$(echo "$auth_url" | grep -o 'scope=[^&]*' | cut -d'=' -f2)
code_challenge=$(echo "$auth_url" | grep -o 'code_challenge=[^&]*' | cut -d'=' -f2)
code_challenge_method=$(echo "$auth_url" | grep -o 'code_challenge_method=[^&]*' | cut -d'=' -f2)

# 디코딩
redirect_uri=$(python3 -c "import urllib.parse; print(urllib.parse.unquote('$redirect_uri'))")
scope=$(python3 -c "import urllib.parse; print(urllib.parse.unquote('$scope'))")

echo "클라이언트 ID: $client_id"
echo "리다이렉트 URI: $redirect_uri"
echo "스코프: $scope"

# POST 요청으로 로그인 (developer 사용자 선택)
echo ""
echo "Developer 사용자로 로그인 진행 중..."
auth_response=$(curl -s -X POST http://localhost:8000/dummy-oidc/auth \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "client_id=$client_id" \
    -d "redirect_uri=$redirect_uri" \
    -d "response_type=code" \
    -d "scope=$scope" \
    -d "state=$state" \
    -d "code_challenge=$code_challenge" \
    -d "code_challenge_method=$code_challenge_method" \
    -d "user=developer" \
    -i)

# Location 헤더에서 인증 코드 추출
location=$(echo "$auth_response" | grep -i "location:" | cut -d' ' -f2 | tr -d '\r')
auth_code=$(echo "$location" | grep -o 'code=[^&]*' | cut -d'=' -f2)

if [ -z "$auth_code" ]; then
    echo "❌ 인증 코드 생성에 실패했습니다."
    echo "응답: $auth_response"
    exit 1
fi

echo "✅ 인증 코드가 생성되었습니다: $auth_code"
echo ""

echo "🎉 더미 OIDC Provider 테스트 완료!"
echo "======================================"
echo ""
echo "📋 테스트 결과:"
echo "✅ OIDC 상태 확인 성공"
echo "✅ 로그인 URL 생성 성공"
echo "✅ 더미 로그인 페이지 접근 성공"
echo "✅ 사용자 선택 및 인증 코드 생성 성공"
echo ""
echo "🌐 브라우저 테스트:"
echo "1. http://localhost:3000/auth/login 접근"
echo "2. 'SSO로 로그인' 버튼 클릭"
echo "3. 사용자 선택 (admin, user, developer 중 하나)"
echo "4. 로그인 버튼 클릭"
echo "5. 자동 리다이렉트 확인"
echo ""
echo "🔗 유용한 링크:"
echo "- 프론트엔드: http://localhost:3000"
echo "- 백엔드 API: http://localhost:8000"
echo "- OIDC Discovery: http://localhost:8000/dummy-oidc/.well-known/openid_configuration"
echo "- 더미 Provider 정보: http://localhost:8000/dummy-oidc/"
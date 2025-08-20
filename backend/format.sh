#!/bin/bash

# Python 코드 포매팅 및 린팅 스크립트

set -e  # 에러 발생 시 스크립트 중단

echo "🚀 Python 코드 포매팅 및 린팅을 시작합니다..."

# 가상환경 활성화 확인
if [[ "$VIRTUAL_ENV" == "" ]]; then
    echo "⚠️  가상환경을 활성화해주세요: source venv/bin/activate"
    exit 1
fi

echo "📝 Black으로 코드 포매팅 중..."
black --line-length=88 --target-version=py311 .

echo "🔧 isort로 import 정렬 중..."
isort --profile=black .

echo "🔍 flake8으로 코드 검사 중..."
flake8 . --max-line-length=88 --extend-ignore=E203,W503,F401 --exclude=.git,__pycache__,.venv,venv,.env,dist,build,*.egg-info || {
    echo "❌ Linting 검사에서 문제가 발견되었습니다. 위의 오류를 확인하고 수정해주세요."
    echo "ℹ️  주요 문제들:"
    echo "   - F841: 사용되지 않는 변수"
    echo "   - E501: 라인 길이 초과 (88자)"
    echo "   - F811: 중복 정의"
    exit 1
}

echo "✅ 모든 검사가 완료되었습니다!"

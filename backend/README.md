# NDASH Backend

FastAPI 기반의 백엔드 API 서버입니다.

## 🚀 개발 환경 설정

### 1. 가상환경 활성화
```bash
source venv/bin/activate
```

### 2. 의존성 설치
```bash
pip install -r requirements.txt
```

### 3. 서버 실행
```bash
PYTHONPATH=/home/meakd/ndash/backend uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 📝 코드 포매팅 및 린팅

### 자동 포매팅
```bash
# 전체 자동 포매팅 및 린팅 (권장)
./format.sh

# 또는 개별 실행
black . && isort . && flake8 .
```

### 사용된 도구들
- **Black**: 코드 포매터 (라인 길이: 88자)
- **isort**: import 문 정렬
- **flake8**: 코드 품질 검사

### 설정 파일
- `.flake8`: flake8 설정
- `pyproject.toml`: black, isort, pytest 설정
- `.vscode/settings.json`: VSCode 자동 포매팅 설정
- `.pre-commit-config.yaml`: Git 커밋 전 자동 검사

### Make 명령어
```bash
make format    # 코드 포매팅
make lint      # 린팅 검사
make test      # 테스트 실행
make check     # 포매팅 + 린팅 + 테스트
make clean     # 임시 파일 정리
make run       # 개발 서버 실행
```

## 📚 API 문서

서버 실행 후 다음 URL에서 API 문서를 확인할 수 있습니다:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🛠️ 개발 가이드라인

### 코드 스타일
- Python 3.11+ 사용
- Black 포매터 적용 (88자 라인 길이)
- isort로 import 정렬
- flake8 린팅 규칙 준수

### 커밋 전 체크리스트
1. `./format.sh` 실행하여 포매팅 적용
2. 모든 테스트 통과 확인
3. 새로운 기능에 대한 테스트 작성
4. API 문서 업데이트 (필요시)

## 🔧 트러블슈팅

### Poetry 버전 문제
현재 시스템 Python 버전이 pyproject.toml의 요구사항과 다를 경우:
```bash
# 가상환경 직접 사용
source venv/bin/activate
black . && isort . && flake8 .
```

### 포매팅 오류 해결
일반적인 flake8 오류들:
- `F841`: 사용되지 않는 변수 제거
- `E501`: 긴 라인을 여러 줄로 분할
- `F811`: 중복된 함수/클래스 정의 제거
- `E203`, `W503`: Black과 충돌하는 규칙 (무시됨)

@echo off
REM ND-SE 개발 서버 시작 스크립트 (Windows)

echo 🚀 ND-SE 시스템을 시작합니다...

REM MongoDB 확인 및 시작 (Docker 사용)
echo 📦 MongoDB 컨테이너 확인 중...
docker ps | findstr "nd-se-mongodb" >nul
if errorlevel 1 (
    echo 🔧 MongoDB 컨테이너를 시작합니다...
    docker run -d --name nd-se-mongodb -p 27017:27017 mongo:7
    echo ⏳ MongoDB 초기화 대기 중...
    timeout /t 5 /nobreak >nul
)

REM 백엔드 시작
echo 🐍 FastAPI 백엔드를 시작합니다...
cd backend

if not exist "venv" (
    echo 🔧 Python 가상환경을 생성합니다...
    python -m venv venv
)

call venv\Scripts\activate
pip install -r requirements.txt

REM 환경변수 파일 복사 (없는 경우)
if not exist ".env" (
    copy .env.example .env >nul
    echo ⚙️  .env 파일이 생성되었습니다. 필요시 수정하세요.
)

REM 백엔드 시작 (백그라운드)
echo 🔥 FastAPI 서버 시작...
start /b uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

cd ..

REM 프론트엔드 시작
echo ⚛️  Next.js 프론트엔드를 시작합니다...
cd frontend

if not exist "node_modules" (
    echo 📦 Node.js 의존성을 설치합니다...
    npm install
)

REM 환경변수 파일 복사 (없는 경우)
if not exist ".env.local" (
    copy .env.example .env.local >nul
    echo ⚙️  .env.local 파일이 생성되었습니다.
)

echo.
echo ✅ ND-SE 시스템이 시작되었습니다!
echo.
echo 🌐 서비스 URL:
echo    - Frontend: http://localhost:3000
echo    - Backend API: http://localhost:8000
echo    - API 문서: http://localhost:8000/docs
echo.
echo 🔥 Next.js 서버를 시작합니다...
npm run dev

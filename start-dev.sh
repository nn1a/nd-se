#!/bin/bash

# NDASH 개발 서버 시작 스크립트

echo "🚀 NDASH 시스템을 시작합니다..."

# MongoDB 확인 및 시작 (Docker 사용)
echo "📦 MongoDB 컨테이너 확인 중..."
if ! docker ps | grep -q "ndash-mongodb"; then
    echo "🔧 MongoDB 컨테이너를 시작합니다..."
    docker run -d --name ndash-mongodb -p 27017:27017 mongo:7
    echo "⏳ MongoDB 초기화 대기 중..."
    sleep 5
fi

# 백엔드 시작
echo "🐍 FastAPI 백엔드를 시작합니다..."
cd backend
if [ ! -d "venv" ]; then
    echo "🔧 Python 가상환경을 생성합니다..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt

# 환경변수 파일 복사 (없는 경우)
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "⚙️  .env 파일이 생성되었습니다. 필요시 수정하세요."
fi

# 백엔드 시작 (백그라운드)
echo "🔥 FastAPI 서버 시작..."
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

cd ..

# 프론트엔드 시작
echo "⚛️  Next.js 프론트엔드를 시작합니다..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "📦 Node.js 의존성을 설치합니다..."
    npm install
fi

# 환경변수 파일 복사 (없는 경우)
if [ ! -f ".env.local" ]; then
    cp .env.example .env.local
    echo "⚙️  .env.local 파일이 생성되었습니다."
fi

# 프론트엔드 시작
echo "🔥 Next.js 서버 시작..."
npm run dev &
FRONTEND_PID=$!

cd ..

echo ""
echo "✅ NDASH 시스템이 시작되었습니다!"
echo ""
echo "🌐 서비스 URL:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:8000"
echo "   - API 문서: http://localhost:8000/docs"
echo ""
echo "🛑 서버를 중지하려면 Ctrl+C를 누르세요."
echo ""

# 신호 처리 함수
cleanup() {
    echo ""
    echo "🛑 서버를 중지합니다..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# 신호 처리 등록
trap cleanup INT TERM

# 대기
wait

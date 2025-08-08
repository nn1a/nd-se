#!/bin/bash

echo "🚀 API Client Setup Verification"
echo "================================"

# 1. 패키지 설치 확인
echo "📦 Checking package installation..."
if npm list @hey-api/openapi-ts @tanstack/react-query > /dev/null 2>&1; then
    echo "✅ Required packages are installed"
else
    echo "❌ Missing required packages"
    exit 1
fi

# 2. 설정 파일 확인
echo "⚙️  Checking configuration files..."
if [ -f "openapi-ts.config.ts" ]; then
    echo "✅ OpenAPI config found"
else
    echo "❌ OpenAPI config missing"
    exit 1
fi

if [ -f ".env.local" ]; then
    echo "✅ Environment config found"
else
    echo "❌ Environment config missing"
    exit 1
fi

# 3. 백엔드 서버 확인
echo "🔗 Checking backend server..."
if curl -f http://localhost:8000/openapi.json > /dev/null 2>&1; then
    echo "✅ Backend server is accessible"
    
    # 4. API 클라이언트 생성 시도
    echo "🔨 Generating API client..."
    if npm run generate-api; then
        echo "✅ API client generated successfully"
    else
        echo "❌ Failed to generate API client"
        exit 1
    fi
else
    echo "⚠️  Backend server is not accessible at http://localhost:8000"
    echo "   Please start the FastAPI server first:"
    echo "   cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
fi

# 5. 생성된 파일 확인
echo "📁 Checking generated files..."
if [ -d "src/lib/api" ]; then
    echo "✅ API client directory created"
    
    if [ -f "src/lib/api/client.ts" ]; then
        echo "✅ API client file found"
    else
        echo "⚠️  API client file not found"
    fi
else
    echo "⚠️  API client directory not found"
fi

echo ""
echo "🎉 Setup verification completed!"
echo "   You can now start the development server:"
echo "   npm run dev"
echo ""
echo "   Or test the API integration at:"
echo "   http://localhost:3000/api-test"

// Next.js API Route for Dashboard
import { NextRequest, NextResponse } from 'next/server'

const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL || 'http://localhost:8000'

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${FASTAPI_BASE_URL}/api/dashboard/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // 실시간 대시보드 데이터를 위해
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: '대시보드 데이터를 가져올 수 없습니다', status: response.status },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // 추가 처리 로직이 필요한 경우 여기에 구현
    // 예: 데이터 변환, 캐싱, 로깅 등
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    console.error('Dashboard API Error:', error)
    return NextResponse.json(
      { 
        error: '서버 연결 오류가 발생했습니다',
        // 개발 환경에서는 상세 에러 정보 제공
        ...(process.env.NODE_ENV === 'development' && { details: (error as Error).message })
      },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL || 'http://localhost:8000'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value
    
    if (!token) {
      return NextResponse.json(
        { detail: '인증이 필요합니다' },
        { status: 401 }
      )
    }
    
    console.log(`👤 [API] Getting current user info`)
    
    const response = await fetch(`${FASTAPI_BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    
    if (response.ok) {
      const userData = await response.json()
      console.log(`✅ [API] User info retrieved: ${userData.username}`)
      
      return NextResponse.json(userData)
    } else {
      const errorData = await response.json()
      console.error(`❌ [API] User info failed: ${errorData.detail}`)
      
      return NextResponse.json(
        { detail: errorData.detail || '사용자 정보를 가져올 수 없습니다' },
        { status: response.status }
      )
    }
  } catch (error) {
    console.error('❌ [API] User info error:', error)
    return NextResponse.json(
      { detail: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

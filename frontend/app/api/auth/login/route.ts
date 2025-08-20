import { NextRequest, NextResponse } from 'next/server'

const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // FastAPI 로그인 엔드포인트로 폼 데이터 형식으로 전송
    const formData = new FormData()
    formData.append('username', body.username)
    formData.append('password', body.password)
    
    console.log(`🔐 [API] Login attempt: ${body.username}`)
    
    const response = await fetch(`${FASTAPI_BASE_URL}/api/auth/token`, {
      method: 'POST',
      body: formData,
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log(`✅ [API] Login successful: ${body.username}`)
      
      // 쿠키 설정을 위한 헤더 준비
      const responseHeaders = new Headers()
      responseHeaders.set('Content-Type', 'application/json')
      
      // HttpOnly 쿠키로 토큰 저장 (보안상 더 안전)
      responseHeaders.append('Set-Cookie', `access_token=${data.access_token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=3600`)
      responseHeaders.append('Set-Cookie', `refresh_token=${data.refresh_token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800`)
      
      return new NextResponse(JSON.stringify(data), {
        status: 200,
        headers: responseHeaders,
      })
    } else {
      const errorData = await response.json()
      console.error(`❌ [API] Login failed: ${body.username} - ${errorData.detail}`)
      
      return NextResponse.json(
        { detail: errorData.detail || '로그인에 실패했습니다' },
        { status: response.status }
      )
    }
  } catch (error) {
    console.error('❌ [API] Login error:', error)
    return NextResponse.json(
      { detail: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

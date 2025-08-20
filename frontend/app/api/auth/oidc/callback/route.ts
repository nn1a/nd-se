import { NextRequest, NextResponse } from 'next/server'

const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (!code || !state) {
      return NextResponse.json(
        { error: 'Missing code or state parameter' },
        { status: 400 }
      )
    }

    // FastAPI OIDC 콜백에 요청 (리다이렉트가 아닌 직접 응답)
    const response = await fetch(`${FASTAPI_BASE_URL}/api/auth/oidc/callback?code=${code}&state=${state}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      redirect: 'manual', // 리다이렉트를 수동으로 처리
    })

    if (response.status === 302 || response.status === 307) {
      // 리다이렉트 URL에서 토큰 추출
      const location = response.headers.get('location')
      if (location) {
        const url = new URL(location)
        const accessToken = url.searchParams.get('access_token')
        const refreshToken = url.searchParams.get('refresh_token')
        
        if (accessToken) {
          // HttpOnly 쿠키로 토큰 설정
          const successResponse = NextResponse.json({ success: true })
          
          successResponse.cookies.set('access_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24, // 24시간
            path: '/',
          })

          if (refreshToken) {
            successResponse.cookies.set('refresh_token', refreshToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 60 * 60 * 24 * 7, // 7일
              path: '/',
            })
          }

          return successResponse
        }
      }
    }

    return NextResponse.json(
      { error: 'OIDC authentication failed' },
      { status: 400 }
    )
  } catch (error) {
    console.error('OIDC callback error:', error)
    return NextResponse.json(
      { error: 'Failed to process OIDC callback' },
      { status: 500 }
    )
  }
}

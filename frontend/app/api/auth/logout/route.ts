import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log(`🚪 [API] Logout requested`)
    
    // 쿠키 삭제를 위한 헤더 준비
    const responseHeaders = new Headers()
    responseHeaders.set('Content-Type', 'application/json')
    
    // 쿠키 삭제 (Max-Age=0으로 즉시 만료)
    responseHeaders.append('Set-Cookie', 'access_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0')
    responseHeaders.append('Set-Cookie', 'refresh_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0')
    
    console.log(`✅ [API] Logout successful`)
    
    return new NextResponse(JSON.stringify({ message: '로그아웃되었습니다' }), {
      status: 200,
      headers: responseHeaders,
    })
  } catch (error) {
    console.error('❌ [API] Logout error:', error)
    return NextResponse.json(
      { detail: '로그아웃 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

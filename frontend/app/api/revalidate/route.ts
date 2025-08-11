import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag, revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, slug, secret } = body
    
    // 보안을 위한 secret 검증
    const expectedSecret = process.env.REVALIDATION_SECRET || 'your-secret-key'
    if (secret !== expectedSecret) {
      return NextResponse.json(
        { message: 'Invalid secret' },
        { status: 401 }
      )
    }
    
    console.log(`Revalidation triggered: action=${action}, slug=${slug}`)
    
    switch (action) {
      case 'document-updated':
      case 'document-created':
        if (slug) {
          // 특정 문서의 태그를 revalidate
          await revalidateTag(`document:${slug}`)
          // 문서 페이지 경로도 revalidate
          await revalidatePath(`/docs/${slug}`)
          console.log(`Revalidated document: ${slug}`)
        }
        // 전체 문서 목록도 갱신
        await revalidateTag('documents')
        await revalidateTag('navigation')
        break
        
      case 'document-deleted':
        if (slug) {
          // 삭제된 문서의 태그 제거
          await revalidateTag(`document:${slug}`)
          await revalidatePath(`/docs/${slug}`)
        }
        // 전체 문서 목록과 네비게이션 갱신
        await revalidateTag('documents')
        await revalidateTag('navigation')
        break
        
      case 'navigation-updated':
        // 네비게이션 갱신
        await revalidateTag('navigation')
        // 모든 문서 페이지의 네비게이션을 갱신하기 위해
        await revalidatePath('/docs', 'layout')
        break
        
      case 'bulk-update':
        // 전체 문서 시스템 갱신
        await revalidateTag('documents')
        await revalidateTag('navigation')
        await revalidatePath('/docs', 'layout')
        break
        
      default:
        return NextResponse.json(
          { message: 'Invalid action' },
          { status: 400 }
        )
    }
    
    return NextResponse.json({
      message: 'Revalidation successful',
      action,
      slug,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Revalidation error:', error)
    return NextResponse.json(
      { 
        message: 'Revalidation failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
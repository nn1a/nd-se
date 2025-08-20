// Next.js API Route for specific document
import { NextRequest, NextResponse } from 'next/server'

const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL || 'http://localhost:8000'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const { slug } = await params
    const slugPath = slug.join('/')
    
    const response = await fetch(`${FASTAPI_BASE_URL}/api/docs/${slugPath}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: '문서를 찾을 수 없습니다', status: response.status },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Document API Error:', error)
    return NextResponse.json(
      { error: '서버 연결 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const { slug } = await params
    const slugPath = slug.join('/')
    const body = await request.json()
    
    const response = await fetch(`${FASTAPI_BASE_URL}/api/docs/${slugPath}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: '문서 수정에 실패했습니다', status: response.status },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Document PUT API Error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const { slug } = await params
    const slugPath = slug.join('/')
    
    const response = await fetch(`${FASTAPI_BASE_URL}/api/docs/${slugPath}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: '문서 삭제에 실패했습니다', status: response.status },
        { status: response.status }
      )
    }

    return NextResponse.json({ message: '문서가 성공적으로 삭제되었습니다' })
  } catch (error) {
    console.error('Document DELETE API Error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

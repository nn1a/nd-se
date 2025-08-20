import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'

// Server-side API calls for SSR (Static/SEO content)
// Next.js 서버에서 FastAPI로 직접 호출 (SSR용)
const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL || 'http://localhost:8000'

// 인증된 사용자 정보 타입
interface AuthenticatedUser {
  user_id: string
  username: string
  email: string
  role: 'admin' | 'moderator' | 'user'
  is_active: boolean
}

// 권한별 접근 제어 타입
type AccessLevel = 'public' | 'user' | 'moderator' | 'admin'

// SSR에서 사용자 인증 정보 가져오기
async function getServerSideAuth(): Promise<{ token?: string; user?: AuthenticatedUser }> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value
    
    if (!token) {
      return {}
    }

    // JWT 토큰 검증을 위해 FastAPI에 요청
    const response = await fetch(`${FASTAPI_BASE_URL}/api/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'NextJS-SSR/1.0',
      }
    })

    if (response.ok) {
      const user = await response.json()
      return { token, user }
    }
  } catch (error) {
    console.error('❌ [SSR] Auth verification failed:', error)
  }
  
  return {}
}

// 권한별 헤더 생성
function createAuthHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': 'NextJS-SSR/1.0',
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  return headers
}

interface Document {
  _id: string
  slug: string
  title: string
  content: string
  version?: string
  language?: string
  category?: string
  created_at: string
  updated_at: string
  views: number
  metadata?: any
  tags?: string[]
  order?: number
}

interface BlogPost {
  id: string
  title: string
  content: string
  author: string
  created_at: string
  updated_at: string
  tags: string[]
  published: boolean
  slug: string
  excerpt?: string
}

interface NavigationItem {
  slug: string
  title: string
  children?: NavigationItem[]
  order?: number
}

interface NavigationResponse {
  navigation: NavigationItem[]
}

interface DocumentsResponse {
  documents: Document[]
  total: number
  page: number
  pages: number
  has_next: boolean
  has_prev: boolean
}

// ==================== DOCUMENT APIs (SSR) ====================

export async function getDocument(slug: string, options?: { requireAuth?: boolean }): Promise<Document> {
  try {
    console.log(`🔍 [SSR] Fetching document: ${slug}`)
    
    // 사용자 인증 정보 가져오기
    const { token, user } = await getServerSideAuth()
    
    // 인증이 필요한 경우 체크
    if (options?.requireAuth && !token) {
      console.log(`🔒 [SSR] Authentication required for document: ${slug}`)
      throw new Error('Authentication required')
    }
    
    // 서버사이드에서 FastAPI에 직접 호출
    const response = await fetch(`${FASTAPI_BASE_URL}/api/docs/${slug}`, {
      next: { 
        revalidate: token ? 900 : 3600, // 인증된 사용자는 15분, 비인증은 1시간 캐시
        tags: [`document:${slug}`, 'documents', user ? `user:${user.user_id}` : 'public']
      },
      headers: createAuthHeaders(token)
    })
    
    if (!response.ok) {
      console.error(`❌ [SSR] Document fetch failed: ${response.status} ${response.statusText}`)
      if (response.status === 404) {
        notFound()
      }
      if (response.status === 403) {
        throw new Error(`Access denied to document: ${slug}`)
      }
      throw new Error(`Failed to fetch document: ${response.status}`)
    }
    
    const document = await response.json()
    console.log(`✅ [SSR] Document fetched successfully: ${document.title} ${user ? `(user: ${user.username})` : '(public)'}`)
    
    return document
  } catch (error) {
    console.error('❌ [SSR] Error fetching document:', error)
    throw error
  }
}

export async function getDocuments(params?: {
  page?: number
  limit?: number
  category?: string
  search?: string
}): Promise<DocumentsResponse> {
  try {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.category) searchParams.append('category', params.category)
    if (params?.search) searchParams.append('search', params.search)
    
    console.log(`🔍 [SSR] Fetching documents with params:`, params)
    
    const response = await fetch(`${FASTAPI_BASE_URL}/api/docs?${searchParams}`, {
      next: { 
        revalidate: 1800, // 30분 캐시
        tags: ['documents']
      },
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NextJS-SSR/1.0',
      }
    })
    
    if (!response.ok) {
      console.error(`❌ [SSR] Documents fetch failed: ${response.status}`)
      throw new Error(`Failed to fetch documents: ${response.status}`)
    }
    
    const data = await response.json()
    console.log(`✅ [SSR] Documents fetched: ${data.total} total`)
    
    return data
  } catch (error) {
    console.error('❌ [SSR] Error fetching documents:', error)
    return {
      documents: [],
      total: 0,
      page: 1,
      pages: 0,
      has_next: false,
      has_prev: false
    }
  }
}

// ==================== BLOG APIs (SSR) ====================

export async function getBlogPosts(params?: {
  skip?: number
  limit?: number
  tag?: string
  includePrivate?: boolean // 비공개 글 포함 여부
}): Promise<BlogPost[]> {
  try {
    // 사용자 인증 정보 가져오기
    const { token, user } = await getServerSideAuth()
    
    const searchParams = new URLSearchParams()
    if (params?.skip) searchParams.append('skip', params.skip.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.tag) searchParams.append('tag', params.tag)
    
    // 비공개 글 포함 요청 (인증된 사용자만)
    if (params?.includePrivate && user) {
      searchParams.append('include_private', 'true')
    }
    
    console.log(`🔍 [SSR] Fetching blog posts with params:`, params, user ? `(user: ${user.username})` : '(public)')
    
    const response = await fetch(`${FASTAPI_BASE_URL}/api/blog/posts?${searchParams}`, {
      next: { 
        revalidate: token ? 600 : 900, // 인증된 사용자는 10분, 비인증은 15분 캐시
        tags: ['blog-posts', user ? `user:${user.user_id}` : 'public']
      },
      headers: createAuthHeaders(token)
    })
    
    if (!response.ok) {
      console.error(`❌ [SSR] Blog posts fetch failed: ${response.status}`)
      throw new Error(`Failed to fetch blog posts: ${response.status}`)
    }
    
    const posts = await response.json()
    console.log(`✅ [SSR] Blog posts fetched: ${posts.length} posts`)
    
    return posts
  } catch (error) {
    console.error('❌ [SSR] Error fetching blog posts:', error)
    return []
  }
}

// 개별 블로그 포스트 조회 (SSR)
export async function getBlogPost(id: string): Promise<BlogPost | null> {
  try {
    // 사용자 인증 정보 가져오기
    const { token, user } = await getServerSideAuth()
    
    console.log(`🔍 [SSR] Fetching blog post: ${id}`, user ? `(user: ${user.username})` : '(public)')
    
    const response = await fetch(`${FASTAPI_BASE_URL}/api/blog/posts/${id}`, {
      next: { 
        revalidate: token ? 600 : 900, // 인증된 사용자는 10분, 비인증은 15분 캐시
        tags: ['blog-posts', `blog-${id}`, user ? `user:${user.user_id}` : 'public']
      },
      headers: createAuthHeaders(token)
    })
    
    if (!response.ok) {
      console.error(`❌ [SSR] Blog post fetch failed: ${response.status}`)
      if (response.status === 403) {
        console.log(`🔒 [SSR] Access denied to blog post: ${id}`)
        return null // 권한 없으면 null 반환
      }
      return null
    }
    
    const post = await response.json()
    console.log(`✅ [SSR] Blog post fetched: ${post.title}`)
    
    return post
  } catch (error) {
    console.error('❌ [SSR] Error fetching blog post:', error)
    return null
  }
}

// ==================== NAVIGATION API (SSR) ====================

export async function getNavigation(): Promise<NavigationResponse> {
  try {
    console.log(`🔍 [SSR] Fetching navigation`)
    
    const response = await fetch(`${FASTAPI_BASE_URL}/api/docs/navigation`, {
      next: { 
        revalidate: 7200, // 2시간 캐시 (네비게이션은 자주 변경되지 않음)
        tags: ['navigation', 'documents']
      },
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NextJS-SSR/1.0',
      }
    })
    
    if (!response.ok) {
      console.error(`❌ [SSR] Navigation fetch failed: ${response.status}`)
      throw new Error(`Failed to fetch navigation: ${response.status}`)
    }
    
    const data = await response.json()
    console.log(`✅ [SSR] Navigation fetched: ${data.navigation?.length || 0} items`)
    
    return data
  } catch (error) {
    console.error('❌ [SSR] Error fetching navigation:', error)
    return { navigation: [] }
  }
}
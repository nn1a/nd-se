// Client-side API hooks for dynamic/real-time content
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// 클라이언트에서 Next.js API Routes 사용
const API_BASE_URL = typeof window !== 'undefined' ? '/api' : 'http://localhost:3000/api'

interface DashboardData {
  users: number
  posts: number
  views: number
  comments: number
  recent_activities: Array<{
    type: string
    message: string
    time: string
    status: string
  }>
  popular_content: Array<{
    title: string
    type: string
    views: number
  }>
}

interface ForumPost {
  id: string
  title: string
  content: string
  author: string
  date: string
  replies: number
  views: number
  tags: string[]
}

interface User {
  id: string
  username: string
  email: string
  full_name: string
  is_active: boolean
  is_superuser: boolean
  created_at: string
  last_login?: string
  role: string
}

// ==================== DASHBOARD HOOKS (Real-time) ====================

export function useDashboardData() {
  return useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      console.log('🔄 [CSR] Fetching dashboard data')
      const response = await fetch(`${API_BASE_URL}/dashboard`, {
        cache: 'no-store', // 실시간 데이터이므로 캐시 없음
      })
      
      if (!response.ok) {
        throw new Error(`Dashboard fetch failed: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('✅ [CSR] Dashboard data fetched')
      return data
    },
    refetchInterval: 30000, // 30초마다 자동 갱신
    staleTime: 0, // 항상 fresh 데이터 요청
    gcTime: 5 * 60 * 1000, // 5분간 캐시 유지
  })
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/dashboard/stats`)
      if (!response.ok) throw new Error('Stats fetch failed')
      return response.json()
    },
    refetchInterval: 60000, // 1분마다 갱신
    staleTime: 30000, // 30초 동안 fresh
  })
}

// ==================== FORUM HOOKS (Interactive) ====================

export function useForumPosts(params?: { skip?: number; limit?: number }) {
  return useQuery<ForumPost[]>({
    queryKey: ['forum', 'posts', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams()
      if (params?.skip) searchParams.append('skip', params.skip.toString())
      if (params?.limit) searchParams.append('limit', params.limit.toString())
      
      console.log('🔄 [CSR] Fetching forum posts')
      const response = await fetch(`${API_BASE_URL}/forum?${searchParams}`)
      
      if (!response.ok) {
        throw new Error(`Forum fetch failed: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('✅ [CSR] Forum posts fetched')
      return data
    },
    staleTime: 2 * 60 * 1000, // 2분 동안 fresh
    gcTime: 10 * 60 * 1000, // 10분간 캐시 유지
  })
}

export function useCreateForumPost() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (postData: { title: string; content: string; tags: string[] }) => {
      const response = await fetch(`${API_BASE_URL}/forum`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      })
      
      if (!response.ok) {
        throw new Error('Failed to create forum post')
      }
      
      return response.json()
    },
    onSuccess: () => {
      // 성공시 forum posts 목록 갱신
      queryClient.invalidateQueries({ queryKey: ['forum', 'posts'] })
    },
  })
}

// ==================== USER MANAGEMENT HOOKS (Admin) ====================

export function useUsers(params?: { skip?: number; limit?: number }) {
  return useQuery<User[]>({
    queryKey: ['users', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams()
      if (params?.skip) searchParams.append('skip', params.skip.toString())
      if (params?.limit) searchParams.append('limit', params.limit.toString())
      
      console.log('🔄 [CSR] Fetching users')
      const response = await fetch(`${API_BASE_URL}/users?${searchParams}`)
      
      if (!response.ok) {
        throw new Error(`Users fetch failed: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('✅ [CSR] Users fetched')
      return data
    },
    staleTime: 5 * 60 * 1000, // 5분 동안 fresh (사용자 데이터는 상대적으로 덜 변함)
    gcTime: 15 * 60 * 1000, // 15분간 캐시 유지
  })
}

// ==================== ANALYTICS HOOKS (Real-time) ====================

export function useAnalytics() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/analytics`)
      if (!response.ok) throw new Error('Analytics fetch failed')
      return response.json()
    },
    refetchInterval: 60000, // 1분마다 갱신
    staleTime: 30000, // 30초 동안 fresh
  })
}

export function useContentAnalytics() {
  return useQuery({
    queryKey: ['analytics', 'content'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/analytics/content`)
      if (!response.ok) throw new Error('Content analytics fetch failed')
      return response.json()
    },
    refetchInterval: 5 * 60 * 1000, // 5분마다 갱신
    staleTime: 2 * 60 * 1000, // 2분 동안 fresh
  })
}

export function useUserAnalytics() {
  return useQuery({
    queryKey: ['analytics', 'users'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/analytics/users`)
      if (!response.ok) throw new Error('User analytics fetch failed')
      return response.json()
    },
    refetchInterval: 10 * 60 * 1000, // 10분마다 갱신
    staleTime: 5 * 60 * 1000, // 5분 동안 fresh
  })
}

// ==================== SEARCH HOOKS (Interactive) ====================

export function useSearch(query: string, type?: 'docs' | 'blog' | 'forum') {
  return useQuery({
    queryKey: ['search', query, type],
    queryFn: async () => {
      const searchParams = new URLSearchParams()
      searchParams.append('q', query)
      if (type) searchParams.append('type', type)
      
      const response = await fetch(`${API_BASE_URL}/search?${searchParams}`)
      if (!response.ok) throw new Error('Search failed')
      return response.json()
    },
    enabled: query.length >= 2, // 최소 2글자 이상일 때만 검색
    staleTime: 2 * 60 * 1000, // 2분 동안 fresh
  })
}

// ==================== UTILITY HOOKS ====================

export function useRefreshData() {
  const queryClient = useQueryClient()
  
  return {
    refreshDashboard: () => queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
    refreshUsers: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
    refreshForum: () => queryClient.invalidateQueries({ queryKey: ['forum'] }),
    refreshAll: () => queryClient.clear(),
  }
}

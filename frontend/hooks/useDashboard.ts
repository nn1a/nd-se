import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api-client';
import { DashboardStats } from '@/lib/types';

// 대시보드 관련 쿼리 키
export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  analytics: () => [...dashboardKeys.all, 'analytics'] as const,
  activity: () => [...dashboardKeys.all, 'activity'] as const,
};

// 대시보드 통계 조회
export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: () => apiRequest<DashboardStats>('/api/dashboard/stats'),
    refetchInterval: 5 * 60 * 1000, // 5분마다 자동 갱신
  });
}

// 사용자 활동 로그 조회
export function useUserActivity(params: {
  page?: number;
  limit?: number;
  user_id?: string;
  action_type?: string;
  date_from?: string;
  date_to?: string;
} = {}) {
  return useQuery({
    queryKey: [...dashboardKeys.activity(), params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
      
      return apiRequest<{
        items: Array<{
          id: string;
          user_id: string;
          user_name: string;
          action_type: string;
          description: string;
          metadata?: any;
          created_at: string;
        }>;
        total: number;
        page: number;
        limit: number;
      }>(`/api/dashboard/activity?${searchParams.toString()}`);
    },
  });
}

// 시스템 상태 조회
export function useSystemStatus() {
  return useQuery({
    queryKey: [...dashboardKeys.all, 'system-status'],
    queryFn: () => apiRequest<{
      database: { status: 'healthy' | 'warning' | 'error'; response_time: number; };
      cache: { status: 'healthy' | 'warning' | 'error'; hit_rate: number; };
      storage: { status: 'healthy' | 'warning' | 'error'; usage_percent: number; };
      api: { status: 'healthy' | 'warning' | 'error'; avg_response_time: number; };
    }>('/api/dashboard/system-status'),
    refetchInterval: 30 * 1000, // 30초마다 자동 갱신
  });
}

// 콘텐츠 통계 조회
export function useContentStats(period: '24h' | '7d' | '30d' | '90d' = '7d') {
  return useQuery({
    queryKey: [...dashboardKeys.all, 'content-stats', period],
    queryFn: () => apiRequest<{
      documents: {
        total: number;
        created_today: number;
        updated_today: number;
        by_language: Array<{ language: string; count: number; }>;
        by_version: Array<{ version: string; count: number; }>;
      };
      blog_posts: {
        total: number;
        published: number;
        drafts: number;
        created_today: number;
        by_category: Array<{ category: string; count: number; }>;
      };
      forum_posts: {
        total: number;
        created_today: number;
        total_replies: number;
        by_category: Array<{ category: string; count: number; }>;
      };
    }>(`/api/dashboard/content-stats?period=${period}`),
  });
}

// 사용자 통계 조회
export function useUserStats(period: '24h' | '7d' | '30d' | '90d' = '7d') {
  return useQuery({
    queryKey: [...dashboardKeys.all, 'user-stats', period],
    queryFn: () => apiRequest<{
      total_users: number;
      active_users: number;
      new_registrations: number;
      user_growth: Array<{ date: string; count: number; }>;
      activity_by_type: Array<{ action_type: string; count: number; }>;
      top_contributors: Array<{
        user_id: string;
        user_name: string;
        avatar_url?: string;
        contribution_count: number;
      }>;
    }>(`/api/dashboard/user-stats?period=${period}`),
  });
}

// 페이지 뷰 통계 조회
export function usePageViewStats(period: '24h' | '7d' | '30d' | '90d' = '7d') {
  return useQuery({
    queryKey: [...dashboardKeys.analytics(), 'pageviews', period],
    queryFn: () => apiRequest<{
      total_views: number;
      unique_visitors: number;
      bounce_rate: number;
      avg_session_duration: number;
      views_by_date: Array<{ date: string; views: number; visitors: number; }>;
      top_pages: Array<{ path: string; title?: string; views: number; }>;
      traffic_sources: Array<{ source: string; visitors: number; percentage: number; }>;
      device_types: Array<{ type: string; visitors: number; percentage: number; }>;
    }>(`/api/dashboard/pageviews?period=${period}`),
  });
}

// 검색 통계 조회
export function useSearchStats(period: '24h' | '7d' | '30d' | '90d' = '7d') {
  return useQuery({
    queryKey: [...dashboardKeys.analytics(), 'search', period],
    queryFn: () => apiRequest<{
      total_searches: number;
      unique_searchers: number;
      avg_results_per_search: number;
      search_success_rate: number;
      top_queries: Array<{ query: string; count: number; success_rate: number; }>;
      no_results_queries: Array<{ query: string; count: number; }>;
      search_trends: Array<{ date: string; searches: number; }>;
    }>(`/api/dashboard/search-stats?period=${period}`),
  });
}

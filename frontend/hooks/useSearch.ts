import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api-client';
import { SearchParams, SearchResponse } from '@/lib/types';

// 검색 관련 쿼리 키
export const searchKeys = {
  all: ['search'] as const,
  results: (params: SearchParams) => [...searchKeys.all, 'results', params] as const,
  suggestions: (query: string) => [...searchKeys.all, 'suggestions', query] as const,
  popular: () => [...searchKeys.all, 'popular'] as const,
};

// 통합 검색
export function useSearch(params: SearchParams) {
  return useQuery({
    queryKey: searchKeys.results(params),
    queryFn: () => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, v));
          } else {
            searchParams.append(key, value.toString());
          }
        }
      });
      
      return apiRequest<SearchResponse>(
        `/api/search?${searchParams.toString()}`
      );
    },
    enabled: !!params.query && params.query.length > 0,
    staleTime: 1000 * 60 * 5, // 5분간 캐시
  });
}

// 검색 자동완성/제안
export function useSearchSuggestions(query: string) {
  return useQuery({
    queryKey: searchKeys.suggestions(query),
    queryFn: () => 
      apiRequest<{ suggestions: string[] }>(`/api/search/suggestions?q=${encodeURIComponent(query)}`),
    enabled: !!query && query.length >= 2,
    staleTime: 1000 * 60 * 10, // 10분간 캐시
  });
}

// 인기 검색어
export function usePopularSearchQueries(limit: number = 10) {
  return useQuery({
    queryKey: [...searchKeys.popular(), limit],
    queryFn: () => 
      apiRequest<{ 
        queries: Array<{ 
          query: string; 
          count: number; 
          trend: 'up' | 'down' | 'stable'; 
        }> 
      }>(`/api/search/popular?limit=${limit}`),
    staleTime: 1000 * 60 * 30, // 30분간 캐시
  });
}

// 문서 전용 검색
export function useSearchDocuments(params: {
  query: string;
  version?: string;
  language?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['search', 'docs', params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
      
      return apiRequest<SearchResponse>(
        `/api/search/docs?${searchParams.toString()}`
      );
    },
    enabled: !!params.query,
    staleTime: 1000 * 60 * 5,
  });
}

// 블로그 전용 검색
export function useSearchBlog(params: {
  query: string;
  category?: string;
  tags?: string[];
  limit?: number;
}) {
  return useQuery({
    queryKey: ['search', 'blog', params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, v));
          } else {
            searchParams.append(key, value.toString());
          }
        }
      });
      
      return apiRequest<SearchResponse>(
        `/api/search/blog?${searchParams.toString()}`
      );
    },
    enabled: !!params.query,
    staleTime: 1000 * 60 * 5,
  });
}

// 게시판 전용 검색
export function useSearchForum(params: {
  query: string;
  category?: string;
  tags?: string[];
  limit?: number;
}) {
  return useQuery({
    queryKey: ['search', 'forum', params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, v));
          } else {
            searchParams.append(key, value.toString());
          }
        }
      });
      
      return apiRequest<SearchResponse>(
        `/api/search/forum?${searchParams.toString()}`
      );
    },
    enabled: !!params.query,
    staleTime: 1000 * 60 * 5,
  });
}

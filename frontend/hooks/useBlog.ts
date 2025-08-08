import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api-client';
import { BlogPost, BlogPostCreate, PaginatedResponse } from '@/lib/types';

// 블로그 관련 쿼리 키
export const blogKeys = {
  all: ['blog'] as const,
  lists: () => [...blogKeys.all, 'list'] as const,
  list: (params: any) => [...blogKeys.lists(), params] as const,
  details: () => [...blogKeys.all, 'detail'] as const,
  detail: (slug: string) => [...blogKeys.details(), slug] as const,
  categories: () => [...blogKeys.all, 'categories'] as const,
  tags: () => [...blogKeys.all, 'tags'] as const,
};

// 블로그 포스트 목록 조회
export function useBlogPosts(params: {
  page?: number;
  limit?: number;
  category?: string;
  tags?: string[];
  author?: string;
  published?: boolean;
  search?: string;
} = {}) {
  return useQuery({
    queryKey: blogKeys.list(params),
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
      
      return apiRequest<PaginatedResponse<BlogPost>>(
        `/api/blog?${searchParams.toString()}`
      );
    },
  });
}

// 특정 블로그 포스트 조회
export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: blogKeys.detail(slug),
    queryFn: () => apiRequest<BlogPost>(`/api/blog/${slug}`),
    enabled: !!slug,
  });
}

// 인기 블로그 포스트 조회
export function usePopularBlogPosts(limit: number = 5) {
  return useQuery({
    queryKey: [...blogKeys.all, 'popular', limit],
    queryFn: () => 
      apiRequest<BlogPost[]>(`/api/blog/popular?limit=${limit}`),
  });
}

// 최근 블로그 포스트 조회
export function useRecentBlogPosts(limit: number = 5) {
  return useQuery({
    queryKey: [...blogKeys.all, 'recent', limit],
    queryFn: () => 
      apiRequest<BlogPost[]>(`/api/blog/recent?limit=${limit}`),
  });
}

// 관련 블로그 포스트 조회
export function useRelatedBlogPosts(slug: string, limit: number = 3) {
  return useQuery({
    queryKey: [...blogKeys.detail(slug), 'related', limit],
    queryFn: () => 
      apiRequest<BlogPost[]>(`/api/blog/${slug}/related?limit=${limit}`),
    enabled: !!slug,
  });
}

// 블로그 카테고리 목록 조회
export function useBlogCategories() {
  return useQuery({
    queryKey: blogKeys.categories(),
    queryFn: () => 
      apiRequest<{ name: string; count: number; }[]>('/api/blog/categories'),
  });
}

// 블로그 태그 목록 조회
export function useBlogTags() {
  return useQuery({
    queryKey: blogKeys.tags(),
    queryFn: () => 
      apiRequest<{ name: string; count: number; }[]>('/api/blog/tags'),
  });
}

// 블로그 검색
export function useSearchBlogPosts(params: {
  query: string;
  category?: string;
  tags?: string[];
  limit?: number;
}) {
  return useQuery({
    queryKey: [...blogKeys.all, 'search', params],
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
      
      return apiRequest<{
        results: BlogPost[];
        total: number;
        took: number;
      }>(`/api/blog/search?${searchParams.toString()}`);
    },
    enabled: !!params.query,
  });
}

// 블로그 포스트 생성
export function useCreateBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BlogPostCreate) =>
      apiRequest<BlogPost>('/api/blog', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
      queryClient.invalidateQueries({ queryKey: blogKeys.categories() });
      queryClient.invalidateQueries({ queryKey: blogKeys.tags() });
    },
  });
}

// 블로그 포스트 업데이트
export function useUpdateBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: Partial<BlogPostCreate> }) =>
      apiRequest<BlogPost>(`/api/blog/${slug}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: blogKeys.detail(variables.slug) 
      });
      queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
      queryClient.invalidateQueries({ queryKey: blogKeys.categories() });
      queryClient.invalidateQueries({ queryKey: blogKeys.tags() });
    },
  });
}

// 블로그 포스트 삭제
export function useDeleteBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) =>
      apiRequest(`/api/blog/${slug}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
      queryClient.invalidateQueries({ queryKey: blogKeys.categories() });
      queryClient.invalidateQueries({ queryKey: blogKeys.tags() });
    },
  });
}

// 블로그 포스트 좋아요
export function useLikeBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) =>
      apiRequest(`/api/blog/${slug}/like`, {
        method: 'POST',
      }),
    onSuccess: (_, slug) => {
      queryClient.invalidateQueries({ 
        queryKey: blogKeys.detail(slug) 
      });
    },
  });
}

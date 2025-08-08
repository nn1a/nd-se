import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api-client';
import { 
  ForumPost, 
  ForumPostCreate, 
  ForumReply, 
  ForumReplyCreate, 
  PaginatedResponse 
} from '@/lib/types';

// 게시판 관련 쿼리 키
export const forumKeys = {
  all: ['forum'] as const,
  posts: () => [...forumKeys.all, 'posts'] as const,
  post: (params: any) => [...forumKeys.posts(), params] as const,
  postDetail: (id: string) => [...forumKeys.all, 'post', id] as const,
  replies: (postId: string) => [...forumKeys.all, 'replies', postId] as const,
  categories: () => [...forumKeys.all, 'categories'] as const,
};

// 게시판 포스트 목록 조회
export function useForumPosts(params: {
  page?: number;
  limit?: number;
  category?: string;
  tags?: string[];
  sort?: 'latest' | 'popular' | 'views';
  search?: string;
} = {}) {
  return useQuery({
    queryKey: forumKeys.post(params),
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
      
      return apiRequest<PaginatedResponse<ForumPost>>(
        `/api/forum/posts?${searchParams.toString()}`
      );
    },
  });
}

// 특정 게시판 포스트 조회
export function useForumPost(id: string) {
  return useQuery({
    queryKey: forumKeys.postDetail(id),
    queryFn: () => apiRequest<ForumPost>(`/api/forum/posts/${id}`),
    enabled: !!id,
  });
}

// 게시판 포스트의 댓글 목록 조회
export function useForumReplies(postId: string, params: {
  page?: number;
  limit?: number;
  sort?: 'oldest' | 'newest' | 'popular';
} = {}) {
  return useQuery({
    queryKey: [...forumKeys.replies(postId), params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
      
      return apiRequest<PaginatedResponse<ForumReply>>(
        `/api/forum/posts/${postId}/replies?${searchParams.toString()}`
      );
    },
    enabled: !!postId,
  });
}

// 인기 게시판 포스트 조회
export function usePopularForumPosts(limit: number = 5) {
  return useQuery({
    queryKey: [...forumKeys.all, 'popular', limit],
    queryFn: () => 
      apiRequest<ForumPost[]>(`/api/forum/posts/popular?limit=${limit}`),
  });
}

// 최근 게시판 포스트 조회
export function useRecentForumPosts(limit: number = 5) {
  return useQuery({
    queryKey: [...forumKeys.all, 'recent', limit],
    queryFn: () => 
      apiRequest<ForumPost[]>(`/api/forum/posts/recent?limit=${limit}`),
  });
}

// 게시판 카테고리 목록 조회
export function useForumCategories() {
  return useQuery({
    queryKey: forumKeys.categories(),
    queryFn: () => 
      apiRequest<{ name: string; description?: string; count: number; }[]>(
        '/api/forum/categories'
      ),
  });
}

// 게시판 검색
export function useSearchForumPosts(params: {
  query: string;
  category?: string;
  tags?: string[];
  limit?: number;
}) {
  return useQuery({
    queryKey: [...forumKeys.all, 'search', params],
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
        results: ForumPost[];
        total: number;
        took: number;
      }>(`/api/forum/search?${searchParams.toString()}`);
    },
    enabled: !!params.query,
  });
}

// 게시판 포스트 생성
export function useCreateForumPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ForumPostCreate) =>
      apiRequest<ForumPost>('/api/forum/posts', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumKeys.posts() });
      queryClient.invalidateQueries({ queryKey: forumKeys.categories() });
    },
  });
}

// 게시판 포스트 업데이트
export function useUpdateForumPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ForumPostCreate> }) =>
      apiRequest<ForumPost>(`/api/forum/posts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: forumKeys.postDetail(variables.id) 
      });
      queryClient.invalidateQueries({ queryKey: forumKeys.posts() });
    },
  });
}

// 게시판 포스트 삭제
export function useDeleteForumPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/forum/posts/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumKeys.posts() });
    },
  });
}

// 게시판 댓글 생성
export function useCreateForumReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ForumReplyCreate) =>
      apiRequest<ForumReply>('/api/forum/replies', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: forumKeys.replies(variables.post_id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: forumKeys.postDetail(variables.post_id) 
      });
    },
  });
}

// 게시판 댓글 업데이트
export function useUpdateForumReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ForumReplyCreate> }) =>
      apiRequest<ForumReply>(`/api/forum/replies/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: forumKeys.replies(data.post_id) 
      });
    },
  });
}

// 게시판 댓글 삭제
export function useDeleteForumReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/forum/replies/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: (_, id) => {
      // 모든 댓글 쿼리를 무효화 (어떤 포스트의 댓글인지 모르므로)
      queryClient.invalidateQueries({ 
        queryKey: [...forumKeys.all, 'replies'] 
      });
    },
  });
}

// 게시판 포스트 좋아요
export function useLikeForumPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/forum/posts/${id}/like`, {
        method: 'POST',
      }),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ 
        queryKey: forumKeys.postDetail(id) 
      });
    },
  });
}

// 게시판 댓글 좋아요
export function useLikeForumReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/forum/replies/${id}/like`, {
        method: 'POST',
      }),
    onSuccess: (data: ForumReply) => {
      queryClient.invalidateQueries({ 
        queryKey: forumKeys.replies(data.post_id) 
      });
    },
  });
}

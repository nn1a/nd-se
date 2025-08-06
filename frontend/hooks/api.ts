import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

const queryKeys = {
  documents: ['documents'],
  document: (path: string) => ['documents', path],
  blogPosts: ['blogPosts'],
  blogPost: (slug: string) => ['blogPost', slug],
  forumTopics: ['forumTopics'], 
  forumTopic: (id: string) => ['forumTopic', id],
  users: ['users'],
  user: (userId: string) => ['user', userId],
  analytics: ['analytics'],
  contentAnalytics: ['analytics', 'content'],
  userAnalytics: ['analytics', 'users'],
};

// Document hooks
export function useDocuments() {
  return useQuery({
    queryKey: queryKeys.documents,
    queryFn: () => apiClient.getDocuments(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useDocument(path: string) {
  return useQuery({
    queryKey: queryKeys.document(path),
    queryFn: () => apiClient.getDocument(path),
    enabled: !!path,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Blog hooks
export function useBlogPosts() {
  return useQuery({
    queryKey: queryKeys.blogPosts,
    queryFn: () => apiClient.getBlogPosts(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: queryKeys.blogPost(slug),
    queryFn: () => apiClient.getBlogPost(slug),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000,
  });
}

// Forum hooks
export function useForumTopics() {
  return useQuery({
    queryKey: queryKeys.forumTopics,
    queryFn: () => apiClient.getForumTopics(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useForumTopic(id: string) {
  return useQuery({
    queryKey: queryKeys.forumTopic(id),
    queryFn: () => apiClient.getForumTopic(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
}

// User management hooks
export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: () => apiClient.getUsers(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: queryKeys.user(userId),
    queryFn: () => apiClient.getUser(userId),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000,
  });
}

// Analytics hooks
export function useAnalytics() {
  return useQuery({
    queryKey: queryKeys.analytics,
    queryFn: () => apiClient.getAnalytics(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useContentAnalytics() {
  return useQuery({
    queryKey: queryKeys.contentAnalytics,
    queryFn: () => apiClient.getContentAnalytics(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUserAnalytics() {
  return useQuery({
    queryKey: queryKeys.userAnalytics,
    queryFn: () => apiClient.getUserAnalytics(),
    staleTime: 5 * 60 * 1000,
  });
}

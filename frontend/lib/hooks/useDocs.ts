import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api';

// 문서 목록 조회 훅
export function useDocuments(params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['documents', params],
    queryFn: () => apiClient.getDocuments(params),
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
  });
}

// 특정 문서 조회 훅
export function useDocument(slug: string) {
  return useQuery({
    queryKey: ['document', slug],
    queryFn: () => apiClient.getDocument(slug),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000, // 10분간 캐시 유지
  });
}

// 네비게이션 구조 조회 훅
export function useDocumentNavigation() {
  return useQuery({
    queryKey: ['document-navigation'],
    queryFn: () => apiClient.getDocumentNavigation(),
    staleTime: 30 * 60 * 1000, // 30분간 캐시 유지
  });
}

// 카테고리별 문서 조회 훅
export function useDocumentsByCategory(category: string, params?: {
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['documents', 'category', category, params],
    queryFn: () => apiClient.getDocumentsByCategory(category, params),
    enabled: !!category,
    staleTime: 5 * 60 * 1000,
  });
}

// 문서 검색 훅
export function useSearchDocuments(query: string, params?: {
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['documents', 'search', query, params],
    queryFn: () => apiClient.searchDocuments(query, params),
    enabled: !!query && query.length > 2, // 2글자 이상일 때만 검색
    staleTime: 5 * 60 * 1000,
  });
}

// 문서 생성 훅
export function useCreateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentData: {
      title: string;
      slug: string;
      content: string;
      metadata: {
        category: string;
        tags: string[];
        description?: string;
      };
    }) => apiClient.createDocument(documentData),
    onSuccess: () => {
      // 문서 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document-navigation'] });
    },
  });
}

// 문서 수정 훅
export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slug, data }: {
      slug: string;
      data: Partial<{
        title: string;
        content: string;
        metadata: {
          category: string;
          tags: string[];
          description?: string;
        };
      }>;
    }) => apiClient.updateDocument(slug, data),
    onSuccess: (_, variables) => {
      // 해당 문서와 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['document', variables.slug] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

// 문서 삭제 훅
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => apiClient.deleteDocument(slug),
    onSuccess: (_, slug) => {
      // 해당 문서와 목록 캐시 무효화
      queryClient.removeQueries({ queryKey: ['document', slug] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document-navigation'] });
    },
  });
}

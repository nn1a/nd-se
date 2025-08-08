import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api-client';
import { Document, DocumentMeta, DocumentContent, PaginatedResponse } from '@/lib/types';

// 문서 관련 쿼리 키
export const docsKeys = {
  all: ['docs'] as const,
  lists: () => [...docsKeys.all, 'list'] as const,
  list: (params: any) => [...docsKeys.lists(), params] as const,
  details: () => [...docsKeys.all, 'detail'] as const,
  detail: (version: string, language: string, slug: string) => 
    [...docsKeys.details(), version, language, slug] as const,
  meta: (params: any) => [...docsKeys.all, 'meta', params] as const,
  versions: () => [...docsKeys.all, 'versions'] as const,
  languages: () => [...docsKeys.all, 'languages'] as const,
};

// 문서 목록 조회
export function useDocuments(params: {
  version?: string;
  language?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: docsKeys.list(params),
    queryFn: () => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
      
      return apiRequest<PaginatedResponse<DocumentMeta>>(
        `/api/docs?${searchParams.toString()}`
      );
    },
  });
}

// 특정 문서 조회
export function useDocument(version: string, language: string, slug: string) {
  return useQuery({
    queryKey: docsKeys.detail(version, language, slug),
    queryFn: () => 
      apiRequest<Document>(`/api/docs/${version}/${language}/${slug}`),
    enabled: !!(version && language && slug),
  });
}

// 문서 콘텐츠만 조회 (메타데이터 제외)
export function useDocumentContent(version: string, language: string, slug: string) {
  return useQuery({
    queryKey: [...docsKeys.detail(version, language, slug), 'content'],
    queryFn: () => 
      apiRequest<DocumentContent>(`/api/docs/${version}/${language}/${slug}/content`),
    enabled: !!(version && language && slug),
  });
}

// 문서 메타데이터만 조회
export function useDocumentMeta(version: string, language: string, slug: string) {
  return useQuery({
    queryKey: [...docsKeys.detail(version, language, slug), 'meta'],
    queryFn: () => 
      apiRequest<DocumentMeta>(`/api/docs/${version}/${language}/${slug}/meta`),
    enabled: !!(version && language && slug),
  });
}

// 사용 가능한 버전 목록 조회
export function useDocumentVersions() {
  return useQuery({
    queryKey: docsKeys.versions(),
    queryFn: () => apiRequest<string[]>('/api/docs/versions'),
  });
}

// 사용 가능한 언어 목록 조회
export function useDocumentLanguages(version?: string) {
  return useQuery({
    queryKey: [...docsKeys.languages(), version],
    queryFn: () => {
      const url = version 
        ? `/api/docs/languages?version=${version}`
        : '/api/docs/languages';
      return apiRequest<string[]>(url);
    },
  });
}

// 문서 네비게이션 (이전/다음 문서)
export function useDocumentNavigation(version: string, language: string, slug: string) {
  return useQuery({
    queryKey: [...docsKeys.detail(version, language, slug), 'navigation'],
    queryFn: () => 
      apiRequest<{
        prev?: { title: string; slug: string; };
        next?: { title: string; slug: string; };
      }>(`/api/docs/${version}/${language}/${slug}/navigation`),
    enabled: !!(version && language && slug),
  });
}

// 문서 검색 (특정 버전/언어 내에서)
export function useSearchDocuments(params: {
  query: string;
  version?: string;
  language?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: [...docsKeys.all, 'search', params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
      
      return apiRequest<{
        results: DocumentMeta[];
        total: number;
        took: number;
      }>(`/api/docs/search?${searchParams.toString()}`);
    },
    enabled: !!params.query,
  });
}

// 관리자용: 문서 생성
export function useCreateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Document, 'id' | 'created_at' | 'updated_at'>) =>
      apiRequest<Document>('/api/docs', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: docsKeys.lists() });
    },
  });
}

// 관리자용: 문서 업데이트
export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      version, 
      language, 
      slug, 
      data 
    }: { 
      version: string; 
      language: string; 
      slug: string; 
      data: Partial<Document>; 
    }) =>
      apiRequest<Document>(`/api/docs/${version}/${language}/${slug}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      const { version, language, slug } = variables;
      queryClient.invalidateQueries({ 
        queryKey: docsKeys.detail(version, language, slug) 
      });
      queryClient.invalidateQueries({ queryKey: docsKeys.lists() });
    },
  });
}

// 관리자용: 문서 삭제
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ version, language, slug }: { 
      version: string; 
      language: string; 
      slug: string; 
    }) =>
      apiRequest(`/api/docs/${version}/${language}/${slug}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: docsKeys.lists() });
    },
  });
}

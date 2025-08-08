import { client } from '../src/lib/api/client.gen';
import { API_BASE_URL } from './query-client';

// API 클라이언트 설정 (생성된 클라이언트용)
export function configureApiClient() {
  // 환경 변수에서 API URL 설정
  client.setConfig({
    baseURL: API_BASE_URL,
  });
  
  console.log('API client configured for:', API_BASE_URL);
}

// API 에러 타입 정의
export interface ApiError {
  status: number;
  message: string;
  detail?: any;
}

// API 에러 핸들러
export function handleApiError(error: unknown): ApiError {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as any).response;
    return {
      status: response?.status || 500,
      message: response?.data?.message || response?.statusText || 'Unknown error',
      detail: response?.data?.detail,
    };
  }

  return {
    status: 500,
    message: error instanceof Error ? error.message : 'Unknown error',
  };
}

// 공통 fetch 래퍼 (fallback용)
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('accessToken');
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    if (response.status === 401) {
      // 토큰이 만료된 경우 갱신 시도
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });

          if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            localStorage.setItem('accessToken', data.access_token);
            
            // 원래 요청 재시도
            const retryConfig: RequestInit = {
              ...options,
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${data.access_token}`,
                ...options.headers,
              },
            };
            
            const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, retryConfig);
            if (retryResponse.ok) {
              return retryResponse.json();
            }
          }
        } catch (refreshError) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    }

    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || response.statusText);
  }

  return response.json();
}

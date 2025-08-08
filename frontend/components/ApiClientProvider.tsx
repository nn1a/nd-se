'use client';

import { configureApiClient } from '@/lib/api-client';
import { useEffect } from 'react';

export function ApiClientProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // API 클라이언트 초기화 (생성된 클라이언트가 있을 때만)
    try {
      configureApiClient();
    } catch (error) {
      console.warn('Generated API client not found, using fallback');
    }
  }, []);

  return <>{children}</>;
}

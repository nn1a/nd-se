'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface OIDCAuthUrl {
  authorization_url: string;
  state: string;
}

interface OIDCStatus {
  enabled: boolean;
  configured: boolean;
}

export function useOIDC() {
  const { refetch } = useAuth();
  const [oidcStatus, setOidcStatus] = useState<OIDCStatus>({ enabled: false, configured: false });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // OIDC 상태 확인
  useEffect(() => {
    checkOIDCStatus();
  }, []);

  const checkOIDCStatus = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      console.log('OIDC Status Check - API URL:', apiUrl);
      
      if (!apiUrl) {
        console.error('NEXT_PUBLIC_API_URL is not defined');
        return;
      }
      
      const response = await fetch(`${apiUrl}/auth/oidc/status`);
      if (response.ok) {
        const status = await response.json();
        setOidcStatus(status);
      }
    } catch (err) {
      console.warn('Failed to check OIDC status:', err);
    }
  };

  const startOIDCLogin = async () => {
    if (!oidcStatus.enabled || !oidcStatus.configured) {
      setError('OIDC authentication is not available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      console.log('OIDC Login - API URL:', apiUrl);
      
      if (!apiUrl) {
        throw new Error('API URL is not configured');
      }
      
      const response = await fetch(`${apiUrl}/auth/oidc/login`);
      
      if (!response.ok) {
        throw new Error('Failed to initiate OIDC login');
      }

      const data: OIDCAuthUrl = await response.json();
      
      // 상태를 localStorage에 저장 (CSRF 보호)
      localStorage.setItem('oidc_state', data.state);
      
      // 인증 제공자로 리다이렉트
      window.location.href = data.authorization_url;
      
    } catch (err: any) {
      setError(err.message || 'Failed to start OIDC login');
      setIsLoading(false);
    }
  };

  const handleOIDCCallback = async (code: string, state: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // 저장된 state와 비교 (CSRF 보호)
      const storedState = localStorage.getItem('oidc_state');
      if (storedState !== state) {
        throw new Error('Invalid state parameter');
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      console.log('OIDC Callback - API URL:', apiUrl);
      
      if (!apiUrl) {
        throw new Error('API URL is not configured');
      }

      const response = await fetch(`${apiUrl}/auth/oidc/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, state }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'OIDC authentication failed');
      }

      const data = await response.json();
      
      // 사용자 정보 새로고침 (토큰은 이미 HttpOnly 쿠키로 설정됨)
      refetch();
      
      // state 정리
      localStorage.removeItem('oidc_state');
      
      return data.user;
      
    } catch (err: any) {
      setError(err.message || 'OIDC callback failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    oidcStatus,
    isLoading,
    error,
    startOIDCLogin,
    handleOIDCCallback,
    checkOIDCStatus,
  };
}
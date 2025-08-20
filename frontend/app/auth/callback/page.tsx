'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('=== OIDC 콜백 시작 ===');
        
        // 환경 변수가 로드될 때까지 대기
        let retryCount = 0;
        const maxRetries = 10;
        let apiUrl = process.env.NEXT_PUBLIC_API_URL;
        
        while (!apiUrl && retryCount < maxRetries) {
          console.log(`환경 변수 로드 대기 중... (${retryCount + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 100));
          apiUrl = process.env.NEXT_PUBLIC_API_URL;
          retryCount++;
        }
        
        console.log('환경 변수 확인:', {
          NEXT_PUBLIC_API_URL: apiUrl,
          NODE_ENV: process.env.NODE_ENV,
          retryCount
        });
        
        if (!apiUrl) {
          throw new Error('API URL 환경 변수를 로드할 수 없습니다');
        }
        
        console.log('현재 URL:', window.location.href);
        console.log('Search params:', Object.fromEntries(searchParams.entries()));
        
        // URL에서 토큰 확인 (백엔드에서 리다이렉트한 경우)
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        
        if (accessToken && refreshToken) {
          console.log('OIDC 토큰 받음:', { 
            access_token: accessToken.substring(0, 10) + '...', 
            refresh_token: refreshToken.substring(0, 10) + '...' 
          });
          
          // 토큰을 HttpOnly 쿠키로 저장하기 위해 API 호출
          const setTokensUrl = '/api/auth/set-tokens';
          console.log('토큰 설정 요청 URL:', setTokensUrl);
          
          const response = await fetch(setTokensUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              access_token: accessToken,
              refresh_token: refreshToken,
            }),
          });

          if (response.ok) {
            setStatus('success');
            
            // 대시보드로 리다이렉트
            setTimeout(() => {
              router.push('/dashboard');
              router.refresh(); // SSR 페이지들도 새로고침
            }, 2000);
          } else {
            throw new Error('토큰 저장에 실패했습니다');
          }
          return;
        }

        // 직접 OIDC 콜백 처리 (code/state 파라미터 있는 경우)
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        
        if (code && state) {
          console.log('OIDC 콜백 처리:', { code: code.substring(0, 10) + '...', state: state.substring(0, 10) + '...' });
          
          // 백엔드 OIDC 콜백 엔드포인트 호출 (상대경로 사용)
          const callbackUrl = `/api/auth/oidc/callback?code=${code}&state=${state}`;
          console.log('OIDC 콜백 요청 URL:', callbackUrl);
          
          const callbackResponse = await fetch(callbackUrl, {
            method: 'POST',
            credentials: 'include',
          });

          if (callbackResponse.ok) {
            setStatus('success');
            
            // 대시보드로 리다이렉트  
            setTimeout(() => {
              router.push('/dashboard');
            }, 2000);
          } else {
            throw new Error('OIDC 콜백 처리에 실패했습니다');
          }
        } else {
          throw new Error('인증 파라미터가 없습니다');
        }
        
      } catch (error) {
        console.error('OIDC 콜백 오류:', error);
        setError(error instanceof Error ? error.message : '인증 처리 중 오류가 발생했습니다');
        setStatus('error');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            로그인 처리 중...
          </h2>
          <p className="mt-2 text-gray-600">
            잠시만 기다려주세요.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 text-green-500">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            로그인 성공!
          </h2>
          <p className="mt-2 text-gray-600">
            홈페이지로 이동합니다...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center px-4">
        <div className="w-12 h-12 mx-auto mb-4 text-red-500">
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          로그인 실패
        </h2>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
        <button
          onClick={() => router.push('/login')}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          로그인 페이지로 돌아가기
        </button>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              인증 처리 중...
            </h2>
          </div>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
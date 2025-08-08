'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../hooks/useAuth';

export default function ForumDraftsPage() {
  const { user, isLoading: authLoading } = useAuth();

  // 임시로 빈 쿼리를 사용 (실제로는 drafts API를 호출해야 함)
  const { data: drafts, isLoading, error } = useQuery({
    queryKey: ['forum-drafts'],
    queryFn: async () => {
      const response = await fetch('/api/forum/drafts/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch drafts');
      }
      return response.json();
    },
    enabled: !!user
  });

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-48"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="space-y-4 p-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">로그인이 필요합니다</h3>
          <p className="text-yellow-600 mb-4">
            임시저장된 게시글을 보려면 로그인해주세요.
          </p>
          <Link
            href="/auth/login"
            className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
          >
            로그인하러 가기
          </Link>
        </div>
      </div>
    );
  }

  const draftPosts = drafts || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">임시저장 글</h1>
          <p className="text-xl text-gray-600">작성 중인 게시글들</p>
        </div>
        <div className="space-x-3">
          <Link
            href="/forum"
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            게시판으로
          </Link>
          <Link
            href="/forum/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            새 글 작성
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">임시저장 글을 불러올 수 없습니다</h3>
          <p className="text-red-600">
            백엔드 서버가 실행되지 않았거나 연결에 문제가 있습니다.
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {draftPosts.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">임시저장된 글이 없습니다</h3>
            <p className="text-gray-600 mb-6">
              새 글을 작성하고 임시저장하여 나중에 계속 작업할 수 있습니다.
            </p>
            <Link
              href="/forum/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              새 글 작성하기
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {draftPosts.map((post: any) => (
              <div key={post.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {post.title || '제목 없음'}
                      </h3>
                      <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                        임시저장
                      </span>
                      {post.is_private && (
                        <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                          비공개
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                      {post.content ? 
                        post.content.replace(/<[^>]*>/g, '').slice(0, 100) + '...' :
                        '내용 없음'
                      }
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>생성: {new Date(post.created_at).toLocaleString('ko-KR')}</span>
                      {post.updated_at && (
                        <span>수정: {new Date(post.updated_at).toLocaleString('ko-KR')}</span>
                      )}
                    </div>
                    {post.tags?.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {post.tags.map((tag: string) => (
                          <span
                            key={tag}
                            className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Link
                      href={`/forum/edit/${post.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      편집
                    </Link>
                    <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {draftPosts.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-500">
          총 {draftPosts.length}개의 임시저장 글이 있습니다.
        </div>
      )}
    </div>
  );
}
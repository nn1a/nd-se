'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getForumPostsApiForumGetOptions } from '../../src/lib/api/@tanstack/react-query.gen';

export default function ForumPage() {
  const { data: posts, isLoading, error } = useQuery(
    getForumPostsApiForumGetOptions({
      query: { skip: 0, limit: 20 }
    })
  );

  if (isLoading) {
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
            <div className="px-6 py-4 bg-gray-50 border-b">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
            <div className="space-y-4 p-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">게시판을 불러올 수 없습니다</h3>
          <p className="text-red-600">
            백엔드 서버가 실행되지 않았거나 연결에 문제가 있습니다.
          </p>
          <p className="text-sm text-red-500 mt-2">
            Error: {(error as any).message}
          </p>
        </div>
      </div>
    );
  }

  const forumPosts = (posts as any) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">게시판</h1>
          <p className="text-xl text-gray-600">Q&A 및 토론</p>
        </div>
        <Link
          href="/forum/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          새 글 작성
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
            <div className="col-span-6">제목</div>
            <div className="col-span-2">작성자</div>
            <div className="col-span-2">작성일</div>
            <div className="col-span-1">답글</div>
            <div className="col-span-1">조회</div>
          </div>
        </div>

        {forumPosts.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-600">게시글이 없습니다.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {forumPosts.map((post: any) => (
              <div key={post.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-6">
                    <div className="flex flex-col">
                      <Link
                        href={`/forum/${post.id}`}
                        className="text-gray-900 hover:text-blue-600 font-medium mb-1"
                      >
                        {post.title}
                      </Link>
                      {post.tags?.length > 0 && (
                        <div className="flex gap-1">
                          {post.tags?.map((tag: string) => (
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
                  </div>
                  <div className="col-span-2 text-sm text-gray-600">
                    {post.author}
                  </div>
                  <div className="col-span-2 text-sm text-gray-600">
                    {new Date(post.date).toLocaleDateString('ko-KR')}
                  </div>
                  <div className="col-span-1 text-sm text-gray-600">
                    {post.replies}
                  </div>
                  <div className="col-span-1 text-sm text-gray-600">
                    {post.views}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {forumPosts.length > 0 && (
        <div className="mt-8 flex justify-center">
          <div className="flex space-x-2">
            <button className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">
              이전
            </button>
            <button className="px-3 py-2 text-sm bg-blue-600 text-white rounded">
              1
            </button>
            <button className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">
              2
            </button>
            <button className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">
              3
            </button>
            <button className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">
              다음
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

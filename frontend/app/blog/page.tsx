'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getBlogPostsApiBlogPostsGetOptions } from '../../src/lib/api/@tanstack/react-query.gen';
import Link from 'next/link';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

export default function BlogPage() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'created_at' | 'views' | 'title'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  const { data: posts, isLoading, error } = useQuery(
    getBlogPostsApiBlogPostsGetOptions({
      query: { 
        skip: 0, 
        limit: 20,
        published: true
      }
    })
  );

  // 태그와 카테고리 데이터 가져오기 (별도 API 호출 필요)
  const { data: tagsData } = useQuery({
    queryKey: ['blog-tags'],
    queryFn: () => fetch('/api/blog/tags').then(res => res.json()),
    staleTime: 5 * 60 * 1000 // 5분
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: () => fetch('/api/blog/categories').then(res => res.json()),
    staleTime: 5 * 60 * 1000 // 5분
  });

  const resetFilters = () => {
    setSelectedTag(null);
    setSelectedCategory(null);
    setSortBy('created_at');
    setSortOrder('desc');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">블로그 포스트를 불러올 수 없습니다</h3>
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

  const blogPosts = (posts as any) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          📝 블로그
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          최신 개발 소식, 튜토리얼, 그리고 팁을 확인해보세요.
        </p>
      </div>

      {blogPosts.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-lg p-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">블로그 포스트가 없습니다</h3>
            <p className="text-gray-600">
              아직 작성된 블로그 포스트가 없습니다.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* 필터 및 정렬 옵션 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">필터 및 정렬</h2>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                {showFilters ? (
                  <ChevronUpIcon className="h-5 w-5 mr-1" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 mr-1" />
                )}
                {showFilters ? '숨기기' : '보기'}
              </button>
            </div>
            
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* 태그 필터 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">태그</label>
                  <select
                    value={selectedTag || ''}
                    onChange={(e) => setSelectedTag(e.target.value || null)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">모든 태그</option>
                    {(tagsData?.tags || []).map((tag: string) => (
                      <option key={tag} value={tag}>
                        #{tag} ({tagsData?.tag_counts?.[tag] || 0})
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* 카테고리 필터 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
                  <select
                    value={selectedCategory || ''}
                    onChange={(e) => setSelectedCategory(e.target.value || null)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">모든 카테고리</option>
                    {(categoriesData?.categories || []).map((category: string) => (
                      <option key={category} value={category}>
                        {category} ({categoriesData?.category_counts?.[category] || 0})
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* 정렬 기준 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">정렬 기준</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="created_at">작성일</option>
                    <option value="views">조회수</option>
                    <option value="title">제목</option>
                  </select>
                </div>
                
                {/* 정렬 순서 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">순서</label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as any)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="desc">내림차순</option>
                    <option value="asc">오름차순</option>
                  </select>
                </div>
              </div>
            )}
            
            {/* 필터 리셋 버튼 */}
            {(selectedTag || selectedCategory || sortBy !== 'created_at' || sortOrder !== 'desc') && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={resetFilters}
                  className="text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  모든 필터 초기화
                </button>
              </div>
            )}
          </div>
          
          {/* 현재 필터 상태 표시 */}
          {(selectedTag || selectedCategory) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-blue-800">필터 적용됨:</span>
                  {selectedTag && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      태그: #{selectedTag}
                    </span>
                  )}
                  {selectedCategory && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      카테고리: {selectedCategory}
                    </span>
                  )}
                </div>
                <span className="text-sm text-blue-600">총 {blogPosts.length}개 게시물</span>
              </div>
            </div>
          )}
          
          {blogPosts.map((post: any) => (
            <article key={post.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <Link
                    href={`/blog/${post.id}`}
                    className="block group"
                  >
                    <h2 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                      {post.title}
                    </h2>
                  </Link>
                  
                  <div className="flex items-center text-sm text-gray-500 space-x-4 mb-3">
                    <span>✏️ {post.author}</span>
                    <span>📅 {new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
                    {post.reading_time && (
                      <span>⏱️ {post.reading_time}분</span>
                    )}
                    {post.views > 0 && (
                      <span>👁️ {post.views.toLocaleString()}</span>
                    )}
                    <span className={`px-2 py-1 rounded text-xs ${
                      post.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {post.published ? '게시됨' : '초안'}
                    </span>
                  </div>

                  <p className="text-gray-600 leading-relaxed mb-4">
                    {post.excerpt || (post.content ? post.content.substring(0, 200) + '...' : '내용이 없습니다.')}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {/* 태그 */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {post.tags.map((tag: string, index: number) => (
                          <button
                            key={`tag-${index}`}
                            onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                              selectedTag === tag
                                ? 'bg-blue-600 text-white'
                                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            }`}
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* 카테고리 */}
                    {post.categories && post.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {post.categories.map((category: string, index: number) => (
                          <button
                            key={`category-${index}`}
                            onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                              selectedCategory === category
                                ? 'bg-purple-600 text-white'
                                : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                            }`}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <Link
                  href={`/blog/${post.id}`}
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                >
                  자세히 보기
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                
                <div className="text-sm text-gray-500">
                  {post.updated_at && new Date(post.updated_at).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </article>
          ))}
          
          {/* 페이지네이션 플레이스홀더 */}
          {blogPosts.length > 0 && (
            <div className="flex justify-center mt-12">
              <div className="flex space-x-2">
                <button className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50" disabled>
                  이전
                </button>
                <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded">
                  1
                </button>
                <button className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
                  다음
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

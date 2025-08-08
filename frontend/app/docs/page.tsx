'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query';
import { listDocumentsApiDocsGetOptions } from '../../src/lib/api/@tanstack/react-query.gen';
import Link from 'next/link';

export default function DocsIndexPage() {
  const router = useRouter()
  const { data: response, isLoading, error } = useQuery(
    listDocumentsApiDocsGetOptions({
      query: { page: 1, limit: 50 }
    })
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
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
          <h3 className="text-lg font-semibold text-red-800 mb-2">문서를 불러올 수 없습니다</h3>
          <p className="text-red-600">
            백엔드 서버가 실행되지 않았거나 연결에 문제가 있습니다.
          </p>
          <p className="text-sm text-red-500 mt-2">
            Error: {error.message}
          </p>
        </div>
      </div>
    );
  }

  const documents = (response as any)?.documents || [];

  // 카테고리별로 문서 그룹화 (slug 기반)
  const documentsByCategory = documents.reduce((acc: any, doc: any) => {
    const slug = doc.slug || '';
    let category = 'other';
    
    if (slug.includes('/')) {
      category = slug.split('/')[0];
    } else if (slug === 'introduction') {
      category = 'introduction';
    }
    
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(doc);
    return acc;
  }, {});

  const categoryLabels: { [key: string]: string } = {
    'introduction': '👋 소개',
    'getting-started': '🚀 시작하기',
    'guides': '📖 가이드',
    'api': '🔌 API 레퍼런스',
    'examples': '💡 예제',
    'tutorials': '🎓 튜토리얼',
    'reference': '📚 참조 문서',
    'other': '📄 기타'
  };

  const categoryDescriptions: { [key: string]: string } = {
    'introduction': '플랫폼 소개 및 개요',
    'getting-started': '처음 시작하는 분들을 위한 기본 가이드',
    'guides': '기능별 상세 가이드와 모범 사례',
    'api': '시스템 API에 대한 상세한 설명서',
    'examples': '실제 사용 예제와 코드 샘플',
    'tutorials': '단계별 학습을 위한 실습 가이드',
    'reference': '기능별 상세 참조 문서',
    'other': '기타 유용한 문서들'
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          📚 문서 시스템
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          ND-SE 플랫폼의 완전한 가이드, API 참조, 튜토리얼을 찾아보세요.
        </p>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-lg p-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">문서가 없습니다</h3>
            <p className="text-gray-600">
              아직 문서가 로드되지 않았습니다. 테스트 데이터를 로드해보세요.
            </p>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
              <p><code>python scripts/load_test_data.py</code> 명령어로 테스트 문서를 로드할 수 있습니다.</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* 통계 정보 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-blue-600">{documents.length}</div>
              <div className="text-sm text-gray-600">총 문서</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-green-600">{Object.keys(documentsByCategory).length}</div>
              <div className="text-sm text-gray-600">카테고리</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-purple-600">
                {documents.filter((doc: any) => doc.tags?.includes('mdx')).length}
              </div>
              <div className="text-sm text-gray-600">인터랙티브</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-orange-600">
                {documents.filter((doc: any) => doc.slug?.includes('api')).length}
              </div>
              <div className="text-sm text-gray-600">API 문서</div>
            </div>
          </div>

          {/* 카테고리별 문서 목록 */}
          <div className="space-y-12">
            {Object.entries(documentsByCategory).map(([category, docs]: [string, any]) => (
              <div key={category}>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {categoryLabels[category] || category}
                  </h2>
                  <p className="text-gray-600">
                    {categoryDescriptions[category] || '이 카테고리의 문서들입니다.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {docs.map((doc: any) => (
                    <Link
                      key={doc.slug}
                      href={`/docs/${doc.slug}`}
                      className="group block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {doc.title}
                        </h3>
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>

                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {doc.content?.substring(0, 100)}...
                      </p>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-4">
                          {doc.created_by && (
                            <span>✏️ {doc.created_by}</span>
                          )}
                          <span>📅 {new Date(doc.created_at).toLocaleDateString('ko-KR')}</span>
                        </div>
                        {doc.views && (
                          <span>👁️ {doc.views.toLocaleString()}</span>
                        )}
                      </div>

                      {doc.tags && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {doc.tags.slice(0, 3).map((tag: string, index: number) => (
                            <span 
                              key={index}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              {tag}
                            </span>
                          ))}
                          {doc.tags.length > 3 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              +{doc.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 빠른 시작 섹션 */}
          <div className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">빠른 시작</h2>
              <p className="text-gray-600 mb-6">
                처음 방문하시나요? 이 문서들부터 시작해보세요.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link 
                  href="/docs/getting-started/installation"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  설치 가이드
                </Link>
                <Link 
                  href="/docs/getting-started/quick-start"
                  className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  빠른 시작
                </Link>
                <Link 
                  href="/docs/api/overview"
                  className="bg-white text-purple-600 border border-purple-600 px-6 py-3 rounded-lg hover:bg-purple-50 transition-colors"
                >
                  API 참조
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

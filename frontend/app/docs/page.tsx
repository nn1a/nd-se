import Link from 'next/link'

async function getDocsList() {
  try {
    const response = await fetch(`http://localhost:8000/api/docs/list`, {
      next: { revalidate: 300 } // 5분마다 재검증
    })
    
    if (!response.ok) {
      return []
    }
    
    const data = await response.json()
    return data.documents || []
  } catch (error) {
    console.error('Failed to fetch docs list:', error)
    return []
  }
}

export default async function DocsIndexPage() {
  const documents = await getDocsList();

  // 카테고리별로 문서 그룹화
  const documentsByCategory = documents.reduce((acc: any, doc: any) => {
    const category = doc.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(doc);
    return acc;
  }, {});

  const categoryLabels: { [key: string]: string } = {
    'getting-started': '시작하기',
    'api': 'API 레퍼런스',
    'tutorials': '튜토리얼',
    'reference': '참조 문서',
    'other': '기타'
  };

  const categoryDescriptions: { [key: string]: string } = {
    'getting-started': '처음 시작하는 분들을 위한 기본 가이드',
    'api': '시스템 API에 대한 상세한 설명서',
    'tutorials': '단계별 학습을 위한 실습 가이드',
    'reference': '기능별 상세 참조 문서',
    'other': '기타 유용한 문서들'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              📚 문서
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl">
              시스템 사용법부터 고급 기능까지, 필요한 모든 정보를 찾아보세요.
            </p>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">전체 문서</p>
                <p className="text-2xl font-semibold text-gray-900">{documents.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">카테고리</p>
                <p className="text-2xl font-semibold text-gray-900">{Object.keys(documentsByCategory).length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">총 조회수</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {documents.reduce((sum: number, doc: any) => sum + (doc.views || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">평균 평점</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {documents.length > 0 
                    ? (documents.reduce((sum: number, doc: any) => sum + (doc.rating || 0), 0) / documents.length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
            </div>
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
                  {categoryDescriptions[category] || '다양한 문서들을 확인해보세요.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {docs.map((doc: any) => (
                  <Link
                    key={doc.id}
                    href={`/docs/${doc.id}`}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {categoryLabels[doc.category] || doc.category}
                        </span>
                        <div className="flex items-center text-sm text-gray-500">
                          <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                          {doc.rating || 0}
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {doc.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {doc.content ? doc.content.substring(0, 120) + '...' : '문서 내용을 확인해보세요.'}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{doc.author}</span>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {(doc.views || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 빠른 시작 섹션 */}
        {documents.length > 0 && (
          <div className="mt-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-8 text-white">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold mb-4">
                🚀 빠른 시작
              </h2>
              <p className="text-indigo-100 mb-6">
                처음 시작하시나요? 가장 인기 있는 문서부터 확인해보세요.
              </p>
              <div className="flex flex-wrap gap-4">
                {documents
                  .sort((a: any, b: any) => (b.views || 0) - (a.views || 0))
                  .slice(0, 3)
                  .map((doc: any) => (
                    <Link
                      key={doc.id}
                      href={`/docs/${doc.id}`}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                      {doc.title}
                    </Link>
                  ))
                }
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

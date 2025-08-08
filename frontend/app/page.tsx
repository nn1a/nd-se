import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          ND-SE 통합 문서 시스템
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          문서, 블로그, 대시보드, 게시판을 통합한 시스템
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mt-12">
          <Link href="/docs" className="group">
            <div className="p-6 border rounded-lg hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600">
                📄 문서
              </h3>
              <p className="text-gray-600">
                다국어 및 버전별 문서 시스템
              </p>
            </div>
          </Link>
          
          <Link href="/blog" className="group">
            <div className="p-6 border rounded-lg hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600">
                📝 블로그
              </h3>
              <p className="text-gray-600">
                태그 및 검색 기능이 있는 블로그
              </p>
            </div>
          </Link>
          
          <Link href="/dashboard" className="group">
            <div className="p-6 border rounded-lg hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600">
                📊 대시보드
              </h3>
              <p className="text-gray-600">
                실시간 데이터 대시보드
              </p>
            </div>
          </Link>
          
          <Link href="/forum" className="group">
            <div className="p-6 border rounded-lg hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600">
                💬 게시판
              </h3>
              <p className="text-gray-600">
                Q&A 및 토론 게시판
              </p>
            </div>
          </Link>

          <Link href="/api-test" className="group">
            <div className="p-6 border rounded-lg hover:shadow-md transition-shadow bg-purple-50">
              <h3 className="text-lg font-semibold mb-2 group-hover:text-purple-600">
                🔧 API 테스트
              </h3>
              <p className="text-gray-600">
                생성된 API 클라이언트 테스트
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

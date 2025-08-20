import Link from 'next/link';
import { Metadata } from 'next';
import { getBlogPosts } from '../../lib/server-api';

export const metadata: Metadata = {
  title: '블로그 | NDASH 문서 시스템',
  description: '최신 개발 소식, 튜토리얼, 그리고 팁을 확인해보세요.',
  openGraph: {
    title: '블로그 | NDASH 문서 시스템',
    description: '최신 개발 소식, 튜토리얼, 그리고 팁을 확인해보세요.',
  },
};

export default async function BlogPage() {
  // SSR에서 블로그 포스트 데이터 가져오기
  const posts = await getBlogPosts({ limit: 20 });

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

      {posts.length === 0 ? (
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
          {posts.map((post) => (
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
                    <span className={`px-2 py-1 rounded text-xs ${
                      post.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {post.published ? '게시됨' : '초안'}
                    </span>
                  </div>

                  {post.excerpt && (
                    <p className="text-gray-600 leading-relaxed mb-4">
                      {post.excerpt}
                    </p>
                  )}

                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
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
          
          {/* 페이지네이션 플레이스홀더 - 나중에 구현 */}
          {posts.length > 0 && (
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

import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { getBlogPost } from '../../../lib/server-api';
import { MDXProvider } from '../../../components/MDXProcessor';

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const post = await getBlogPost(resolvedParams.id);
    
    if (!post) {
      return {
        title: '포스트를 찾을 수 없음 | NDASH',
      };
    }

    return {
      title: `${post.title} | NDASH 블로그`,
      description: post.excerpt || '블로그 포스트',
      openGraph: {
        title: post.title,
        description: post.excerpt || '블로그 포스트',
        type: 'article',
        publishedTime: post.created_at,
        modifiedTime: post.updated_at,
        authors: [post.author],
        tags: post.tags,
      },
    };
  } catch (error) {
    console.error('Error generating metadata for blog post:', error);
    return {
      title: '포스트를 찾을 수 없음 | NDASH',
    };
  }
}

export default async function BlogPostPage({ params }: Props) {
  try {
    const resolvedParams = await params;
    const post = await getBlogPost(resolvedParams.id);
    
    if (!post) {
      notFound();
    }

    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 브레드크럼 */}
        <nav className="mb-8 text-sm">
          <ol className="flex items-center space-x-2 text-gray-500">
            <li>
              <Link href="/" className="hover:text-gray-700">홈</Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/blog" className="hover:text-gray-700">블로그</Link>
            </li>
            <li>/</li>
            <li className="text-gray-900">{post.title}</li>
          </ol>
        </nav>

        {/* 헤더 */}
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>
          
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center space-x-4 text-gray-600">
              <div className="flex items-center space-x-2">
                <span>✏️</span>
                <span>{post.author}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>📅</span>
                <time dateTime={post.created_at}>
                  {new Date(post.created_at).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              </div>
              {post.updated_at && post.updated_at !== post.created_at && (
                <div className="flex items-center space-x-2 text-sm">
                  <span>🔄</span>
                  <span>업데이트:</span>
                  <time dateTime={post.updated_at}>
                    {new Date(post.updated_at).toLocaleDateString('ko-KR')}
                  </time>
                </div>
              )}
            </div>
            
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              post.published 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {post.published ? '게시됨' : '초안'}
            </div>
          </div>

          {/* 태그 */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
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

          {/* 요약 */}
          {post.excerpt && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">요약</h2>
              <p className="text-gray-700 leading-relaxed">{post.excerpt}</p>
            </div>
          )}
        </header>

        {/* 본문 */}
        <article className="prose prose-lg max-w-none mb-12">
          {post.content ? (
            <MDXProvider>
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </MDXProvider>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>컨텐츠가 없습니다.</p>
            </div>
          )}
        </article>

        {/* 푸터 */}
        <footer className="border-t border-gray-200 pt-8">
          <div className="flex items-center justify-between">
            <Link
              href="/blog"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              블로그 목록으로 돌아가기
            </Link>
            
            <div className="text-sm text-gray-500">
              ID: {post.id}
            </div>
          </div>
        </footer>
      </div>
    );
  } catch (error) {
    console.error('Error rendering blog post:', error);
    notFound();
  }
}

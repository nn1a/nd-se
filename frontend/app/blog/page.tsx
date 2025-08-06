import Link from 'next/link'

interface BlogPost {
  id: string
  title: string
  excerpt: string
  date: string
  tags: string[]
  slug: string
}

async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const response = await fetch('http://localhost:8000/api/blog', {
      next: { revalidate: 60 }
    })
    
    if (!response.ok) {
      return []
    }
    
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch blog posts:', error)
    return []
  }
}

export default async function BlogPage() {
  const posts = await getBlogPosts()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">블로그</h1>
        <p className="text-xl text-gray-600">개발 관련 글과 튜토리얼</p>
      </div>

      <div className="max-w-4xl mx-auto">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">아직 게시된 블로그 포스트가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <article key={post.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <time className="text-sm text-gray-500">
                    {new Date(post.date).toLocaleDateString('ko-KR')}
                  </time>
                  <div className="flex gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  <Link href={`/blog/${post.slug}`} className="hover:text-blue-600">
                    {post.title}
                  </Link>
                </h2>
                
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {post.excerpt}
                </p>
                
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                >
                  더 읽기 →
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

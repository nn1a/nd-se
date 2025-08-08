'use client';

import { useDocuments, useDocument } from '@/hooks/useDocs';
import { useBlogPosts } from '@/hooks/useBlog';
import { useForumPosts } from '@/hooks/useForum';
import { useDashboardStats } from '@/hooks/useDashboard';
import { useSearch } from '@/hooks/useSearch';

export function ApiExample() {
  // 문서 목록 조회 예시
  const { data: documents, isLoading: docsLoading, error: docsError } = useDocuments({
    version: 'v1',
    language: 'ko',
    page: 1,
    limit: 10,
  });

  // 특정 문서 조회 예시
  const { data: document } = useDocument('v1', 'ko', 'intro');

  // 블로그 포스트 목록 조회 예시
  const { data: blogPosts } = useBlogPosts({
    page: 1,
    limit: 5,
    published: true,
  });

  // 게시판 포스트 목록 조회 예시
  const { data: forumPosts } = useForumPosts({
    page: 1,
    limit: 5,
    sort: 'latest',
  });

  // 대시보드 통계 조회 예시
  const { data: dashboardStats } = useDashboardStats();

  // 검색 예시
  const { data: searchResults } = useSearch({
    query: 'react',
    type: 'all',
    limit: 10,
  });

  if (docsLoading) {
    return <div>Loading...</div>;
  }

  if (docsError) {
    return <div>Error: {docsError.message}</div>;
  }

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold">API Integration Examples</h1>

      {/* 문서 목록 */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Documents</h2>
        {documents && (
          <div className="space-y-2">
            <p>Total: {documents.total} documents</p>
            {documents.items.map((doc) => (
              <div key={doc.id} className="p-4 border rounded">
                <h3 className="font-medium">{doc.title}</h3>
                <p className="text-sm text-gray-600">
                  {doc.version} / {doc.language} / {doc.slug}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 특정 문서 */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Document Detail</h2>
        {document && (
          <div className="p-4 border rounded">
            <h3 className="font-medium">{document.title}</h3>
            <p className="text-sm text-gray-600 mb-2">
              {document.description}
            </p>
            <div className="text-xs text-gray-500">
              TOC items: {document.toc.length}
            </div>
          </div>
        )}
      </section>

      {/* 블로그 포스트 */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Blog Posts</h2>
        {blogPosts && (
          <div className="space-y-2">
            <p>Total: {blogPosts.total} posts</p>
            {blogPosts.items.map((post) => (
              <div key={post.id} className="p-4 border rounded">
                <h3 className="font-medium">{post.title}</h3>
                <p className="text-sm text-gray-600">
                  By {post.author.username} • {post.tags.join(', ')}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 게시판 포스트 */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Forum Posts</h2>
        {forumPosts && (
          <div className="space-y-2">
            <p>Total: {forumPosts.total} posts</p>
            {forumPosts.items.map((post) => (
              <div key={post.id} className="p-4 border rounded">
                <h3 className="font-medium">{post.title}</h3>
                <p className="text-sm text-gray-600">
                  {post.category} • Views: {post.views} • Replies: {post.reply_count}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 대시보드 통계 */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Dashboard Stats</h2>
        {dashboardStats && (
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 border rounded">
              <h3 className="font-medium">Users</h3>
              <p>Total: {dashboardStats.users.total}</p>
              <p>Active: {dashboardStats.users.active}</p>
            </div>
            <div className="p-4 border rounded">
              <h3 className="font-medium">Content</h3>
              <p>Documents: {dashboardStats.content.documents}</p>
              <p>Blog Posts: {dashboardStats.content.blog_posts}</p>
            </div>
            <div className="p-4 border rounded">
              <h3 className="font-medium">Analytics</h3>
              <p>Page Views: {dashboardStats.analytics.page_views}</p>
              <p>Visitors: {dashboardStats.analytics.unique_visitors}</p>
            </div>
          </div>
        )}
      </section>

      {/* 검색 결과 */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Search Results</h2>
        {searchResults && (
          <div className="space-y-2">
            <p>Found {searchResults.total} results in {searchResults.took}ms</p>
            {searchResults.results.map((result) => (
              <div key={result.id} className="p-4 border rounded">
                <h3 className="font-medium">{result.title}</h3>
                <p className="text-sm text-gray-600">
                  Type: {result.type} • Score: {result.score}
                </p>
                <p className="text-sm mt-2">{result.content.substring(0, 200)}...</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

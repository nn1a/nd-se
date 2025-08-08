'use client';

import { useQuery } from '@tanstack/react-query';
import { 
  getBlogPostsApiBlogPostsGetOptions,
  getForumPostsApiForumGetOptions,
  getDashboardDataApiDashboardGetOptions,
  getUsersApiUsersGetOptions
} from '../src/lib/api/@tanstack/react-query.gen';

export function GeneratedApiExample() {
  // 생성된 options 함수를 useQuery와 함께 사용
  const { data: blogPosts, isLoading: blogLoading, error: blogError } = useQuery(
    getBlogPostsApiBlogPostsGetOptions({
      query: {
        skip: 0,
        limit: 5,
      }
    })
  );

  const { data: forumPosts, isLoading: forumLoading } = useQuery(
    getForumPostsApiForumGetOptions({
      query: {
        skip: 0,
        limit: 5,
      }
    })
  );

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery(
    getDashboardDataApiDashboardGetOptions()
  );

  const { data: users, isLoading: usersLoading } = useQuery(
    getUsersApiUsersGetOptions({
      query: {
        skip: 0,
        limit: 10,
      }
    })
  );

  if (blogLoading || forumLoading || dashboardLoading || usersLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (blogError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <h3 className="font-semibold text-red-800">Error</h3>
        <p className="text-red-600">Failed to load data: {blogError.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-3xl font-bold">Generated API Client Example</h1>
      <p className="text-gray-600">
        이 페이지는 자동 생성된 TanStack Query 옵션을 사용하여 FastAPI 백엔드에서 데이터를 가져옵니다.
      </p>

      {/* 블로그 포스트 */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">📝 Blog Posts</h2>
        {blogPosts && Array.isArray(blogPosts) && blogPosts.length > 0 ? (
          <div className="space-y-3">
            {blogPosts.map((post: any) => (
              <div key={post.id} className="p-4 border rounded-lg">
                <h3 className="font-medium text-lg">{post.title}</h3>
                <p className="text-sm text-gray-600">by {post.author}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Created: {new Date(post.created_at).toLocaleDateString()}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {post.tags?.map((tag: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-gray-50 rounded">
            <p className="text-gray-500">No blog posts found or data format: {JSON.stringify(blogPosts)}</p>
          </div>
        )}
      </section>

      {/* 포럼 포스트 */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">💬 Forum Posts</h2>
        {forumPosts && Array.isArray(forumPosts) && forumPosts.length > 0 ? (
          <div className="space-y-3">
            {forumPosts.map((post: any) => (
              <div key={post.id} className="p-4 border rounded-lg">
                <h3 className="font-medium text-lg">{post.title}</h3>
                <p className="text-sm text-gray-600">by {post.author}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span>👁️ {post.views} views</span>
                  <span>💬 {post.replies} replies</span>
                  <span>📅 {post.date}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {post.tags?.map((tag: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-gray-50 rounded">
            <p className="text-gray-500">No forum posts found or data format: {JSON.stringify(forumPosts)}</p>
          </div>
        )}
      </section>

      {/* 대시보드 데이터 */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">📊 Dashboard Data</h2>
        {dashboardData ? (
          <div className="p-4 bg-gray-50 rounded-lg">
            <pre className="text-sm overflow-x-auto">
              {JSON.stringify(dashboardData, null, 2)}
            </pre>
          </div>
        ) : (
          <p className="text-gray-500">No dashboard data available</p>
        )}
      </section>

      {/* 사용자 목록 */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">👥 Users</h2>
        {users && Array.isArray(users) && users.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.map((user: any) => (
              <div key={user.id} className="p-4 border rounded-lg">
                <h3 className="font-medium">{user.full_name}</h3>
                <p className="text-sm text-gray-600">@{user.username}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-1 text-xs rounded ${
                    user.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                    {user.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-gray-50 rounded">
            <p className="text-gray-500">No users found or data format: {JSON.stringify(users)}</p>
          </div>
        )}
      </section>

      {/* API 상태 정보 */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">🔧 API Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-blue-50 rounded">
            <div className="text-sm text-blue-600">Blog Posts</div>
            <div className="text-lg font-semibold text-blue-800">
              {Array.isArray(blogPosts) ? blogPosts.length : 'N/A'}
            </div>
          </div>
          <div className="p-3 bg-green-50 rounded">
            <div className="text-sm text-green-600">Forum Posts</div>
            <div className="text-lg font-semibold text-green-800">
              {Array.isArray(forumPosts) ? forumPosts.length : 'N/A'}
            </div>
          </div>
          <div className="p-3 bg-purple-50 rounded">
            <div className="text-sm text-purple-600">Users</div>
            <div className="text-lg font-semibold text-purple-800">
              {Array.isArray(users) ? users.length : 'N/A'}
            </div>
          </div>
          <div className="p-3 bg-orange-50 rounded">
            <div className="text-sm text-orange-600">Dashboard</div>
            <div className="text-lg font-semibold text-orange-800">
              {dashboardData ? '✓' : '✗'}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

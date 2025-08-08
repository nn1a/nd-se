'use client';

import { useQuery } from '@tanstack/react-query';
import { 
  getDashboardDataApiDashboardGetOptions,
  getBlogPostsApiBlogPostsGetOptions,
  getUsersApiUsersGetOptions
} from '../src/lib/api/@tanstack/react-query.gen';

export function SimpleApiTest() {
  // 간단한 대시보드 데이터 테스트
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useQuery(
    getDashboardDataApiDashboardGetOptions()
  );

  // 블로그 포스트 테스트
  const { data: blogData, isLoading: blogLoading, error: blogError } = useQuery(
    getBlogPostsApiBlogPostsGetOptions({
      query: { skip: 0, limit: 3 }
    })
  );

  // 사용자 데이터 테스트
  const { data: usersData, isLoading: usersLoading, error: usersError } = useQuery(
    getUsersApiUsersGetOptions({
      query: { skip: 0, limit: 5 }
    })
  );

  if (dashboardLoading || blogLoading || usersLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading API data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Simple API Test</h1>
      
      {/* 에러 표시 */}
      {(dashboardError || blogError || usersError) && (
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <h3 className="font-semibold text-red-800">API Errors:</h3>
          {dashboardError && <p className="text-red-600">Dashboard: {dashboardError.message}</p>}
          {blogError && <p className="text-red-600">Blog: {blogError.message}</p>}
          {usersError && <p className="text-red-600">Users: {usersError.message}</p>}
        </div>
      )}

      {/* 대시보드 데이터 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">📊 Dashboard Data</h2>
        {dashboardData ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(dashboardData).map(([key, value]) => (
              <div key={key} className="p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                <div className="text-lg font-semibold">{typeof value === 'number' ? value.toLocaleString() : String(value)}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No dashboard data available</p>
        )}
      </div>

      {/* 블로그 데이터 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">📝 Blog Posts</h2>
        {blogData && Array.isArray(blogData) ? (
          <div className="space-y-3">
            {blogData.slice(0, 3).map((post: any, index: number) => (
              <div key={post.id || index} className="p-4 border rounded">
                <h3 className="font-medium">{post.title || 'Untitled'}</h3>
                <p className="text-sm text-gray-600">by {post.author || 'Unknown'}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {post.tags && post.tags.map((tag: string, tagIndex: number) => (
                    <span key={tagIndex} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-gray-50 rounded">
            <p className="text-gray-500">Raw data: {JSON.stringify(blogData)}</p>
          </div>
        )}
      </div>

      {/* 사용자 데이터 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">👥 Users</h2>
        {usersData && Array.isArray(usersData) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {usersData.slice(0, 4).map((user: any, index: number) => (
              <div key={user.id || index} className="p-4 border rounded">
                <h3 className="font-medium">{user.full_name || user.username || 'Unknown User'}</h3>
                <p className="text-sm text-gray-600">{user.email || 'No email'}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-1 text-xs rounded ${
                    user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                  {user.role && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                      {user.role}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-gray-50 rounded">
            <p className="text-gray-500">Raw data: {JSON.stringify(usersData)}</p>
          </div>
        )}
      </div>

      {/* API 연결 상태 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">🔗 API Connection Status</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className={`p-3 rounded text-center ${
            dashboardData && !dashboardError ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <div className="font-semibold">Dashboard API</div>
            <div className="text-sm">{dashboardData && !dashboardError ? '✓ Connected' : '✗ Failed'}</div>
          </div>
          <div className={`p-3 rounded text-center ${
            blogData && !blogError ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <div className="font-semibold">Blog API</div>
            <div className="text-sm">{blogData && !blogError ? '✓ Connected' : '✗ Failed'}</div>
          </div>
          <div className={`p-3 rounded text-center ${
            usersData && !usersError ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <div className="font-semibold">Users API</div>
            <div className="text-sm">{usersData && !usersError ? '✓ Connected' : '✗ Failed'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

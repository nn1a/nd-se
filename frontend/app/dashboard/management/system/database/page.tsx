export default function DatabasePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          데이터베이스 관리
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          시스템 데이터베이스 상태와 설정을 관리합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-2">연결 상태</h3>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-green-600">연결됨</span>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-2">데이터베이스 크기</h3>
          <p className="text-2xl font-bold text-blue-600">2.4 GB</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-2">백업 상태</h3>
          <p className="text-sm text-gray-600">마지막 백업: 2시간 전</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold">테이블 목록</h3>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">users</span>
              <span className="text-sm text-gray-500">1,245 rows</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">documents</span>
              <span className="text-sm text-gray-500">3,456 rows</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">blog_posts</span>
              <span className="text-sm text-gray-500">789 rows</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">forum_topics</span>
              <span className="text-sm text-gray-500">234 rows</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

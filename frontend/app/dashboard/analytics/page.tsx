export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          일반 통계
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          전반적인 시스템 사용량과 통계를 확인할 수 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-2">총 방문자 수</h3>
          <p className="text-3xl font-bold text-blue-600">12,345</p>
          <p className="text-sm text-gray-500 mt-1">+12% from last month</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-2">페이지 뷰</h3>
          <p className="text-3xl font-bold text-green-600">45,678</p>
          <p className="text-sm text-gray-500 mt-1">+8% from last month</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-2">활성 사용자</h3>
          <p className="text-3xl font-bold text-purple-600">1,234</p>
          <p className="text-sm text-gray-500 mt-1">+15% from last month</p>
        </div>
      </div>
    </div>
  );
}

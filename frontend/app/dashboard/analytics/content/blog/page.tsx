export default function BlogAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          블로그 통계
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          블로그 포스트별 조회수와 인기도를 분석합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">총 포스트</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">124</p>
          <p className="text-sm text-green-600 mt-1">+12 이번 달</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">총 조회수</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">45,231</p>
          <p className="text-sm text-green-600 mt-1">+8.2% 지난 주</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">평균 댓글</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">12.5</p>
          <p className="text-sm text-red-600 mt-1">-2.1% 지난 주</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">구독자</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">1,892</p>
          <p className="text-sm text-green-600 mt-1">+15% 이번 달</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold">인기 포스트 순위</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">React 18의 새로운 기능들</h4>
                <p className="text-sm text-gray-500">/blog/react-18-features</p>
                <p className="text-xs text-gray-400 mt-1">2024년 1월 15일</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-semibold text-blue-600">3,245 views</span>
                <p className="text-sm text-gray-500">45 comments</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Next.js 14 마이그레이션 가이드</h4>
                <p className="text-sm text-gray-500">/blog/nextjs-14-migration</p>
                <p className="text-xs text-gray-400 mt-1">2024년 1월 10일</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-semibold text-blue-600">2,891 views</span>
                <p className="text-sm text-gray-500">32 comments</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">TypeScript 베스트 프랙티스</h4>
                <p className="text-sm text-gray-500">/blog/typescript-best-practices</p>
                <p className="text-xs text-gray-400 mt-1">2024년 1월 5일</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-semibold text-blue-600">2,567 views</span>
                <p className="text-sm text-gray-500">28 comments</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold">카테고리별 통계</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-semibold text-blue-700 dark:text-blue-300">Frontend</h4>
              <p className="text-2xl font-bold text-blue-600 mt-2">45</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">포스트</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h4 className="font-semibold text-green-700 dark:text-green-300">Backend</h4>
              <p className="text-2xl font-bold text-green-600 mt-2">38</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">포스트</p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <h4 className="font-semibold text-purple-700 dark:text-purple-300">DevOps</h4>
              <p className="text-2xl font-bold text-purple-600 mt-2">29</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">포스트</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

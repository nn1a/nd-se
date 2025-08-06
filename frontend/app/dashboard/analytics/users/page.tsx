export default function UsersAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          사용자 분석
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          사용자 활동 패턴과 통계를 분석합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4">사용자 유형별 분포</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>신규 사용자</span>
              <span className="font-semibold">65%</span>
            </div>
            <div className="flex justify-between">
              <span>재방문 사용자</span>
              <span className="font-semibold">35%</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4">주간 활성 사용자</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>월요일</span>
              <span className="font-semibold">234</span>
            </div>
            <div className="flex justify-between">
              <span>화요일</span>
              <span className="font-semibold">345</span>
            </div>
            <div className="flex justify-between">
              <span>수요일</span>
              <span className="font-semibold">456</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

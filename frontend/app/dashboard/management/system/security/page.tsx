export default function SecurityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          보안 설정
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          시스템 보안 설정을 관리합니다.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold">보안 정책</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">2단계 인증</h4>
                <p className="text-sm text-gray-500">모든 사용자에게 2FA 요구</p>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">활성화</span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">세션 타임아웃</h4>
                <p className="text-sm text-gray-500">30분 비활성 후 자동 로그아웃</p>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">활성화</span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">IP 화이트리스트</h4>
                <p className="text-sm text-gray-500">허용된 IP에서만 접근 가능</p>
              </div>
              <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm">비활성화</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

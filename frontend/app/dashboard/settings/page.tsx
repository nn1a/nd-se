export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          설정
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          시스템 전반적인 설정을 관리합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4">일반 설정</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="site-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                사이트 제목
              </label>
              <input 
                id="site-title"
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue="ND-SE Documentation"
                placeholder="사이트 제목을 입력하세요"
              />
            </div>
            <div>
              <label htmlFor="site-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                사이트 설명
              </label>
              <textarea 
                id="site-description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue="통합 문서화 시스템"
                placeholder="사이트 설명을 입력하세요"
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4">외관 설정</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="theme-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                테마
              </label>
              <select 
                id="theme-select"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>라이트</option>
                <option>다크</option>
                <option>시스템</option>
              </select>
            </div>
            <div>
              <label htmlFor="language-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                기본 언어
              </label>
              <select 
                id="language-select"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>한국어</option>
                <option>English</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          설정 저장
        </button>
      </div>
    </div>
  );
}

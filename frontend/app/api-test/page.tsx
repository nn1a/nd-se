import { GeneratedApiExample } from '../../components/GeneratedApiExample';
import { SimpleApiTest } from '../../components/SimpleApiTest';

export default function ApiTestPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Generated API Client Test</h1>
        <p className="text-gray-600">
          이 페이지는 @hey-api/openapi-ts와 @tanstack/react-query를 사용하여 자동 생성된 API 클라이언트를 테스트합니다.
        </p>
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
          <h3 className="font-semibold text-green-800">✅ 완료된 설정:</h3>
          <ul className="mt-2 text-sm text-green-700 list-disc list-inside">
            <li>FastAPI 백엔드 서버 실행 중 (http://localhost:8000)</li>
            <li>OpenAPI 스키마에서 TypeScript 클라이언트 자동 생성</li>
            <li>TanStack Query options 자동 생성</li>
            <li>Type-safe API 호출</li>
          </ul>
        </div>
      </div>
      
      <div className="space-y-8">
        {/* 간단한 API 테스트 */}
        <div className="bg-gray-50 rounded-lg p-1">
          <SimpleApiTest />
        </div>
        
        {/* 상세한 API 테스트 */}
        <div className="bg-gray-50 rounded-lg p-1">
          <GeneratedApiExample />
        </div>
      </div>
    </div>
  );
}

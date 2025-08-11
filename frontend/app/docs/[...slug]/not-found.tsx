import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Document Not Found</h2>
        <p className="text-gray-600 mb-6">
          The requested document could not be found.
        </p>
        <Link
          href="/docs"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          Back to Documentation
        </Link>
      </div>
    </div>
  )
}
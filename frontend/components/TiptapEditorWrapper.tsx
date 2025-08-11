'use client'

import dynamic from 'next/dynamic'
import React from 'react'

// Tiptap 에디터를 동적으로 로드 (SSR 방지)
const TiptapEditor = dynamic(() => import('./TiptapEditor'), {
  ssr: false,
  loading: () => (
    <div className="border border-gray-300 rounded-lg">
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
        <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
        <div className="animate-pulse bg-gray-200 h-8 w-16 rounded ml-2"></div>
        <div className="animate-pulse bg-gray-200 h-8 w-16 rounded ml-1"></div>
      </div>
      <div 
        className="flex items-center justify-center text-gray-500 bg-gray-50 rounded-b-lg"
        style={{ minHeight: '300px' }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <div>에디터 로딩 중...</div>
        </div>
      </div>
    </div>
  )
})

interface TiptapEditorWrapperProps {
  initialContent?: string
  onChange?: (content: string) => void
  onSave?: (content: string, isDraft: boolean) => void
  placeholder?: string
  className?: string
  showPreview?: boolean
  autosave?: boolean
  autosaveInterval?: number
  height?: number | string
}

const TiptapEditorWrapper: React.FC<TiptapEditorWrapperProps> = (props) => {
  return <TiptapEditor {...props} />
}

export default TiptapEditorWrapper
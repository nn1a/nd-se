'use client'

import React, { useState, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
// Table extensions temporarily removed due to import issues
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Placeholder from '@tiptap/extension-placeholder'
import { common, createLowlight } from 'lowlight'
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  // Table as TableIcon, // 임시 제거
  Undo,
  Redo,
  Save,
  Eye,
  FileText,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight
} from 'lucide-react'

const lowlight = createLowlight(common)

interface TiptapEditorProps {
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

const TiptapEditor: React.FC<TiptapEditorProps> = ({
  initialContent = '',
  onChange,
  onSave,
  placeholder = '내용을 입력하세요...',
  className = '',
  showPreview = true,
  autosave = false,
  autosaveInterval = 30000,
  height = 300
}) => {
  const [content, setContent] = useState(initialContent)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Tiptap 에디터 설정
  const editor = useEditor({
    immediatelyRender: false, // SSR 하이드레이션 문제 해결
    extensions: [
      StarterKit.configure({
        codeBlock: false, // lowlight를 위해 기본 코드블록 비활성화
      }),
      Placeholder.configure({
        placeholder: placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      // Table extensions temporarily removed
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto',
        },
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      setContent(html)
      onChange?.(html)
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto focus:outline-none min-h-[200px] p-4',
        style: `min-height: ${typeof height === 'number' ? `${height - 100}px` : 'calc(100% - 100px)'}`
      },
    },
  })

  // 저장 핸들러
  const handleSave = useCallback(async (isDraft: boolean = false) => {
    if (!onSave) return
    
    setIsSaving(true)
    try {
      await onSave(content, isDraft)
      setLastSaved(new Date())
    } catch (error) {
      console.error('저장 실패:', error)
    } finally {
      setIsSaving(false)
    }
  }, [onSave, content])

  // 자동저장 효과
  useEffect(() => {
    if (!autosave || !onSave) return

    const interval = setInterval(() => {
      if (content.trim() && content !== initialContent && content !== '<p></p>') {
        handleSave(true)
      }
    }, autosaveInterval)

    return () => clearInterval(interval)
  }, [content, initialContent, autosave, autosaveInterval, handleSave, onSave])

  // 툴바 버튼 핸들러들
  const toggleBold = () => editor?.chain().focus().toggleBold().run()
  const toggleItalic = () => editor?.chain().focus().toggleItalic().run()
  const toggleUnderline = () => editor?.chain().focus().toggleUnderline().run()
  const toggleBulletList = () => editor?.chain().focus().toggleBulletList().run()
  const toggleOrderedList = () => editor?.chain().focus().toggleOrderedList().run()
  const toggleBlockquote = () => editor?.chain().focus().toggleBlockquote().run()
  const toggleCodeBlock = () => editor?.chain().focus().toggleCodeBlock().run()
  const undo = () => editor?.chain().focus().undo().run()
  const redo = () => editor?.chain().focus().redo().run()

  // 헤더 설정
  const setHeading = (level: 1 | 2 | 3 | 4 | 5 | 6) => {
    editor?.chain().focus().toggleHeading({ level }).run()
  }

  // 정렬 설정
  const setTextAlign = (alignment: 'left' | 'center' | 'right' | 'justify') => {
    editor?.chain().focus().setTextAlign(alignment).run()
  }

  // 링크 삽입
  const insertLink = () => {
    const url = window.prompt('링크 URL을 입력하세요:')
    if (url) {
      editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
  }

  // 이미지 삽입
  const insertImage = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload/image', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          body: formData
        })

        if (response.ok) {
          const result = await response.json()
          editor?.chain().focus().setImage({ src: result.url }).run()
        } else {
          // 폴백: 데이터 URL로 이미지 삽입
          const reader = new FileReader()
          reader.onload = (e) => {
            const src = e.target?.result as string
            editor?.chain().focus().setImage({ src }).run()
          }
          reader.readAsDataURL(file)
        }
      } catch (error) {
        console.error('이미지 업로드 실패:', error)
      }
    }

    input.click()
  }

  // 테이블 기능 임시 비활성화

  // 프리뷰 토글
  const togglePreview = () => {
    setIsPreviewMode(!isPreviewMode)
  }

  // 툴바 버튼 컴포넌트
  const ToolbarButton: React.FC<{
    onClick: () => void
    icon: React.ReactNode
    title: string
    active?: boolean
    disabled?: boolean
  }> = ({ onClick, icon, title, active = false, disabled = false }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`p-2 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        active ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
      }`}
    >
      {icon}
    </button>
  )

  // 에디터가 로드되지 않은 경우
  if (!editor) {
    return (
      <div className={`border border-gray-300 rounded-lg ${className}`}>
        <div 
          className="flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg"
          style={{ height: typeof height === 'number' ? `${height}px` : height }}
        >
          에디터 로딩 중...
        </div>
      </div>
    )
  }

  return (
    <div className={`border border-gray-300 rounded-lg ${className}`}>
      {/* 툴바 */}
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 flex-wrap">
        {/* 헤더 드롭다운 */}
        <select
          onChange={(e) => {
            const value = e.target.value
            if (value === 'p') {
              editor.chain().focus().setParagraph().run()
            } else {
              const level = parseInt(value) as 1 | 2 | 3 | 4 | 5 | 6
              setHeading(level)
            }
          }}
          className="text-sm border border-gray-300 rounded px-2 py-1 mr-2"
          value={
            editor.isActive('heading', { level: 1 }) ? '1' :
            editor.isActive('heading', { level: 2 }) ? '2' :
            editor.isActive('heading', { level: 3 }) ? '3' :
            editor.isActive('heading', { level: 4 }) ? '4' :
            editor.isActive('heading', { level: 5 }) ? '5' :
            editor.isActive('heading', { level: 6 }) ? '6' : 'p'
          }
        >
          <option value="p">본문</option>
          <option value="1">제목 1</option>
          <option value="2">제목 2</option>
          <option value="3">제목 3</option>
          <option value="4">제목 4</option>
          <option value="5">제목 5</option>
          <option value="6">제목 6</option>
        </select>

        <div className="h-6 w-px bg-gray-300 mx-1" />

        {/* 텍스트 포맷팅 */}
        <ToolbarButton
          onClick={toggleBold}
          icon={<Bold size={16} />}
          title="굵게 (Ctrl+B)"
          active={editor.isActive('bold')}
        />
        <ToolbarButton
          onClick={toggleItalic}
          icon={<Italic size={16} />}
          title="기울임 (Ctrl+I)"
          active={editor.isActive('italic')}
        />
        <ToolbarButton
          onClick={toggleUnderline}
          icon={<Underline size={16} />}
          title="밑줄"
          active={editor.isActive('underline')}
        />

        <div className="h-6 w-px bg-gray-300 mx-1" />

        {/* 정렬 */}
        <ToolbarButton
          onClick={() => setTextAlign('left')}
          icon={<AlignLeft size={16} />}
          title="왼쪽 정렬"
          active={editor.isActive({ textAlign: 'left' })}
        />
        <ToolbarButton
          onClick={() => setTextAlign('center')}
          icon={<AlignCenter size={16} />}
          title="가운데 정렬"
          active={editor.isActive({ textAlign: 'center' })}
        />
        <ToolbarButton
          onClick={() => setTextAlign('right')}
          icon={<AlignRight size={16} />}
          title="오른쪽 정렬"
          active={editor.isActive({ textAlign: 'right' })}
        />

        <div className="h-6 w-px bg-gray-300 mx-1" />

        {/* 목록 */}
        <ToolbarButton
          onClick={toggleBulletList}
          icon={<List size={16} />}
          title="글머리 기호"
          active={editor.isActive('bulletList')}
        />
        <ToolbarButton
          onClick={toggleOrderedList}
          icon={<ListOrdered size={16} />}
          title="번호 목록"
          active={editor.isActive('orderedList')}
        />
        <ToolbarButton
          onClick={toggleBlockquote}
          icon={<Quote size={16} />}
          title="인용구"
          active={editor.isActive('blockquote')}
        />
        <ToolbarButton
          onClick={toggleCodeBlock}
          icon={<Code size={16} />}
          title="코드 블록"
          active={editor.isActive('codeBlock')}
        />

        <div className="h-6 w-px bg-gray-300 mx-1" />

        {/* 미디어 */}
        <ToolbarButton
          onClick={insertLink}
          icon={<LinkIcon size={16} />}
          title="링크 삽입"
        />
        <ToolbarButton
          onClick={insertImage}
          icon={<ImageIcon size={16} />}
          title="이미지 삽입"
        />
        {/* 테이블 버튼 임시 비활성화 */}

        <div className="h-6 w-px bg-gray-300 mx-1" />

        {/* 실행취소/다시실행 */}
        <ToolbarButton
          onClick={undo}
          icon={<Undo size={16} />}
          title="실행 취소 (Ctrl+Z)"
          disabled={!editor.can().undo()}
        />
        <ToolbarButton
          onClick={redo}
          icon={<Redo size={16} />}
          title="다시 실행 (Ctrl+Y)"
          disabled={!editor.can().redo()}
        />

        {/* 저장 및 프리뷰 */}
        <div className="flex items-center gap-1 ml-auto">
          {lastSaved && (
            <span className="text-xs text-gray-500 mr-2">
              마지막 저장: {lastSaved.toLocaleTimeString()}
            </span>
          )}
          
          {onSave && (
            <>
              <ToolbarButton
                onClick={() => handleSave(true)}
                icon={<FileText size={16} />}
                title="임시저장"
                disabled={isSaving}
              />
              <ToolbarButton
                onClick={() => handleSave(false)}
                icon={isSaving ? <div className="animate-spin">⟳</div> : <Save size={16} />}
                title="저장"
                disabled={isSaving}
              />
            </>
          )}
          
          {showPreview && (
            <ToolbarButton
              onClick={togglePreview}
              icon={<Eye size={16} />}
              title="미리보기"
              active={isPreviewMode}
            />
          )}
        </div>
      </div>

      {/* 에디터 영역 */}
      <div className="relative">
        {!isPreviewMode ? (
          <div 
            style={{ 
              minHeight: typeof height === 'number' ? `${height}px` : height,
              maxHeight: typeof height === 'number' ? `${height * 2}px` : 'none',
              overflowY: 'auto'
            }}
          >
            <EditorContent editor={editor} />
          </div>
        ) : (
          <div 
            className="p-4 prose max-w-none bg-gray-50 overflow-auto"
            style={{ minHeight: typeof height === 'number' ? `${height}px` : height }}
          >
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        )}
      </div>
    </div>
  )
}

export default TiptapEditor
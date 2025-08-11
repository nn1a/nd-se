'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Link, 
  Image, 
  Paperclip,
  Undo,
  Redo,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Quote,
  Code,
  Save,
  Eye,
  FileText
} from 'lucide-react'

interface RichTextEditorProps {
  initialContent?: string
  onChange?: (content: string) => void
  onSave?: (content: string, isDraft: boolean) => void
  placeholder?: string
  className?: string
  showPreview?: boolean
  autosave?: boolean
  autosaveInterval?: number
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  initialContent = '',
  onChange,
  onSave,
  placeholder = '내용을 입력하세요...',
  className = '',
  showPreview = true,
  autosave = false,
  autosaveInterval = 30000 // 30초
}) => {
  const [content, setContent] = useState(initialContent)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

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
      if (content.trim() && content !== initialContent) {
        handleSave(true) // 임시저장으로 처리
      }
    }, autosaveInterval)

    return () => clearInterval(interval)
  }, [content, initialContent, autosave, autosaveInterval, handleSave])

  // 내용 변경 핸들러
  const handleContentChange = useCallback(() => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML
      setContent(newContent)
      onChange?.(newContent)
    }
  }, [onChange])

  // 포맷팅 명령 실행
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    handleContentChange()
  }

  // 링크 삽입
  const insertLink = () => {
    const url = prompt('링크 URL을 입력하세요:')
    if (url) {
      execCommand('createLink', url)
    }
  }

  // 이미지 삽입
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        
        // API 호출하여 이미지 업로드
        const response = await fetch('/api/upload/image', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          body: formData
        })
        
        if (response.ok) {
          const result = await response.json()
          execCommand('insertImage', result.url)
        } else {
          console.error('이미지 업로드 실패')
          // 실패시 기존 방식으로 폴백
          const reader = new FileReader()
          reader.onload = (e) => {
            const imageUrl = e.target?.result as string
            execCommand('insertImage', imageUrl)
          }
          reader.readAsDataURL(file)
        }
      } catch (error) {
        console.error('이미지 업로드 오류:', error)
        // 오류시 기존 방식으로 폴백
        const reader = new FileReader()
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string
          execCommand('insertImage', imageUrl)
        }
        reader.readAsDataURL(file)
      }
    }
  }

  // 파일 첨부
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        
        // API 호출하여 파일 업로드
        const response = await fetch('/api/upload/file', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          body: formData
        })
        
        if (response.ok) {
          const result = await response.json()
          const fileLink = `<a href="${result.url}" download="${result.original_filename}">[첨부파일: ${result.original_filename}]</a>`
          document.execCommand('insertHTML', false, fileLink)
        } else {
          console.error('파일 업로드 실패')
          const fileLink = `[첨부파일: ${file.name}]`
          document.execCommand('insertHTML', false, fileLink)
        }
      } catch (error) {
        console.error('파일 업로드 오류:', error)
        const fileLink = `[첨부파일: ${file.name}]`
        document.execCommand('insertHTML', false, fileLink)
      }
      
      handleContentChange()
    }
  }

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
  }> = ({ onClick, icon, title, active = false }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded hover:bg-gray-100 transition-colors ${
        active ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
      }`}
    >
      {icon}
    </button>
  )

  return (
    <div className={`border border-gray-300 rounded-lg ${className}`}>
      {/* 툴바 */}
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 flex-wrap">
        {/* 텍스트 포맷팅 */}
        <div className="flex items-center gap-1 pr-2 border-r border-gray-200">
          <ToolbarButton
            onClick={() => execCommand('bold')}
            icon={<Bold size={16} />}
            title="굵게 (Ctrl+B)"
          />
          <ToolbarButton
            onClick={() => execCommand('italic')}
            icon={<Italic size={16} />}
            title="기울임 (Ctrl+I)"
          />
          <ToolbarButton
            onClick={() => execCommand('underline')}
            icon={<Underline size={16} />}
            title="밑줄 (Ctrl+U)"
          />
        </div>

        {/* 정렬 */}
        <div className="flex items-center gap-1 pr-2 border-r border-gray-200">
          <ToolbarButton
            onClick={() => execCommand('justifyLeft')}
            icon={<AlignLeft size={16} />}
            title="왼쪽 정렬"
          />
          <ToolbarButton
            onClick={() => execCommand('justifyCenter')}
            icon={<AlignCenter size={16} />}
            title="가운데 정렬"
          />
          <ToolbarButton
            onClick={() => execCommand('justifyRight')}
            icon={<AlignRight size={16} />}
            title="오른쪽 정렬"
          />
        </div>

        {/* 목록 */}
        <div className="flex items-center gap-1 pr-2 border-r border-gray-200">
          <ToolbarButton
            onClick={() => execCommand('insertUnorderedList')}
            icon={<List size={16} />}
            title="글머리 기호"
          />
          <ToolbarButton
            onClick={() => execCommand('insertOrderedList')}
            icon={<ListOrdered size={16} />}
            title="번호 목록"
          />
          <ToolbarButton
            onClick={() => execCommand('indent')}
            icon={<Quote size={16} />}
            title="들여쓰기"
          />
        </div>

        {/* 링크 및 미디어 */}
        <div className="flex items-center gap-1 pr-2 border-r border-gray-200">
          <ToolbarButton
            onClick={insertLink}
            icon={<Link size={16} />}
            title="링크 삽입"
          />
          <ToolbarButton
            onClick={() => imageInputRef.current?.click()}
            icon={<Image size={16} />}
            title="이미지 삽입"
          />
          <ToolbarButton
            onClick={() => fileInputRef.current?.click()}
            icon={<Paperclip size={16} />}
            title="파일 첨부"
          />
        </div>

        {/* 기타 */}
        <div className="flex items-center gap-1 pr-2 border-r border-gray-200">
          <ToolbarButton
            onClick={() => execCommand('undo')}
            icon={<Undo size={16} />}
            title="실행 취소 (Ctrl+Z)"
          />
          <ToolbarButton
            onClick={() => execCommand('redo')}
            icon={<Redo size={16} />}
            title="다시 실행 (Ctrl+Y)"
          />
          <ToolbarButton
            onClick={() => execCommand('formatBlock', 'pre')}
            icon={<Code size={16} />}
            title="코드 블록"
          />
        </div>

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
              />
              <ToolbarButton
                onClick={() => handleSave(false)}
                icon={isSaving ? <div className="animate-spin">⟳</div> : <Save size={16} />}
                title="저장"
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
            ref={editorRef}
            contentEditable
            className="min-h-[300px] p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset prose max-w-none"
            dir="ltr"
            dangerouslySetInnerHTML={{ __html: content }}
            onInput={handleContentChange}
            onPaste={handleContentChange}
            onKeyDown={(e) => {
              // 키보드 단축키 처리
              if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                  case 'b':
                    e.preventDefault()
                    execCommand('bold')
                    break
                  case 'i':
                    e.preventDefault()
                    execCommand('italic')
                    break
                  case 'u':
                    e.preventDefault()
                    execCommand('underline')
                    break
                  case 's':
                    e.preventDefault()
                    handleSave()
                    break
                }
              }
            }}
            style={{ minHeight: '300px', direction: 'ltr', textAlign: 'left' }}
          />
        ) : (
          <div className="min-h-[300px] p-4 prose max-w-none bg-gray-50">
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        )}

        {/* placeholder 표시 */}
        {!content.trim() && !isPreviewMode && (
          <div className="absolute top-4 left-4 text-gray-400 pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>

      {/* 숨겨진 파일 입력 */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  )
}

export default RichTextEditor
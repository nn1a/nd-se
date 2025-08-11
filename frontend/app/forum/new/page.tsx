'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TiptapEditorWrapper from '../../../components/TiptapEditorWrapper';
import { useAuth } from '../../../hooks/useAuth';

export default function NewForumPostPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
    is_private: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (isDraft: boolean = false) => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const postData = {
        title: formData.title,
        content: formData.content,
        category: formData.category || undefined,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        is_draft: isDraft,
        is_private: formData.is_private
      };

      const response = await fetch('/api/forum/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(postData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (isDraft) {
        alert('임시저장되었습니다.');
        router.push('/forum/drafts');
      } else {
        alert('게시글이 작성되었습니다.');
        router.push('/forum');
      }
    } catch (error) {
      console.error('게시글 작성 실패:', error);
      alert(`게시글 작성에 실패했습니다: ${(error as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContentChange = (content: string) => {
    setFormData(prev => ({ ...prev, content }));
  };

  const handleSave = async (content: string, isDraft: boolean) => {
    setFormData(prev => ({ ...prev, content }));
    await handleSubmit(isDraft);
  };

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">로그인이 필요합니다</h3>
          <p className="text-yellow-600 mb-4">
            게시글을 작성하려면 로그인해주세요.
          </p>
          <Link
            href="/auth/login"
            className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
          >
            로그인하러 가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">새 게시글 작성</h1>
          <Link
            href="/forum"
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← 게시판으로 돌아가기
          </Link>
        </div>
      </div>

      <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSubmit(false); }}>
        {/* 제목 입력 */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            제목 *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="게시글 제목을 입력하세요"
            maxLength={200}
          />
        </div>

        {/* 카테고리 선택 */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            카테고리
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">카테고리 선택</option>
            <option value="질문">질문</option>
            <option value="토론">토론</option>
            <option value="팁">팁</option>
            <option value="공지">공지</option>
            <option value="자유">자유</option>
          </select>
        </div>

        {/* 태그 입력 */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
            태그
          </label>
          <input
            type="text"
            id="tags"
            value={formData.tags}
            onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="태그를 쉼표로 구분하여 입력하세요 (예: React, JavaScript, Next.js)"
          />
          <p className="text-sm text-gray-500 mt-1">
            쉼표(,)로 구분하여 여러 태그를 입력할 수 있습니다.
          </p>
        </div>

        {/* 비공개 설정 */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_private"
            checked={formData.is_private}
            onChange={(e) => setFormData(prev => ({ ...prev, is_private: e.target.checked }))}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="is_private" className="ml-2 block text-sm text-gray-700">
            비공개 게시글 (본인만 볼 수 있습니다)
          </label>
        </div>

        {/* 내용 입력 - 리치 텍스트 에디터 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            내용 *
          </label>
          <TiptapEditorWrapper
            initialContent={formData.content}
            onChange={handleContentChange}
            onSave={handleSave}
            placeholder="게시글 내용을 입력하세요. 이미지 업로드와 파일 첨부가 가능합니다."
            className=""
            showPreview={true}
            autosave={true}
            autosaveInterval={30000}
            height={400}
          />
        </div>

        {/* 버튼 */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <div className="space-x-3">
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? '저장 중...' : '임시저장'}
            </button>
          </div>
          
          <div className="space-x-3">
            <Link
              href="/forum"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !formData.title.trim() || !formData.content.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? '작성 중...' : '게시글 작성'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
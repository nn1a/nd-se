'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getForumPostApiForumPostIdGetOptions, getForumRepliesApiForumPostIdRepliesGetOptions } from '../../../src/lib/api/@tanstack/react-query.gen';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, Eye, ThumbsUp, ThumbsDown, Calendar, User, Tag } from 'lucide-react';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: string;
  created_at: string;
  views?: number;
  replies_count?: number;
  likes?: number;
  dislikes?: number;
  tags?: string[];
}

interface ForumReply {
  id: string;
  content: string;
  author: string;
  created_at: string;
}

export default function ForumPostPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: post, isLoading: isPostLoading, error: postError } = useQuery(
    getForumPostApiForumPostIdGetOptions({
      path: { post_id: id }
    })
  ) as { data: ForumPost | undefined, isLoading: boolean, error: any };

  const { data: replies, isLoading: isRepliesLoading, error: repliesError } = useQuery(
    getForumRepliesApiForumPostIdRepliesGetOptions({
      path: { post_id: id }
    })
  ) as { data: ForumReply[] | undefined, isLoading: boolean, error: any };

  if (isPostLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-10 w-10 bg-gray-200 rounded"></div>
            <div className="h-6 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (postError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">게시물을 불러올 수 없습니다</h3>
          <p className="text-red-600 mb-4">
            요청한 게시물을 찾을 수 없습니다.
          </p>
          <button
            onClick={() => router.back()}
            className="text-red-600 hover:text-red-800 underline"
          >
            이전 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">게시물을 찾을 수 없습니다</h2>
          <Link
            href="/forum"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            포럼으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 뒤로 가기 버튼 */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>뒤로 가기</span>
        </button>
        <div className="h-6 w-px bg-gray-300"></div>
        <Link
          href="/forum"
          className="text-blue-600 hover:text-blue-800"
        >
          포럼 홈
        </Link>
      </div>

      {/* 메인 게시물 */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {/* 게시물 헤더 */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{post.title}</h1>
          
          {/* 메타 정보 */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <User size={16} />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              <span>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye size={16} />
              <span>{post.views || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare size={16} />
              <span>{post.replies_count || 0}</span>
            </div>
            {post.likes !== undefined && (
              <div className="flex items-center gap-1">
                <ThumbsUp size={16} />
                <span>{post.likes}</span>
              </div>
            )}
          </div>

          {/* 태그 */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex items-center gap-2 mt-3">
              <Tag size={16} className="text-gray-500" />
              <div className="flex gap-1">
                {post.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="inline-block bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 게시물 내용 */}
        <div className="px-6 py-6">
          <div className="prose prose-lg max-w-none">
            <div 
              className="whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }}
            />
          </div>
        </div>

        {/* 게시물 하단 액션 */}
        <div className="px-6 py-4 bg-gray-50 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                <ThumbsUp size={16} />
                <span>좋아요 ({post.likes || 0})</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                <ThumbsDown size={16} />
                <span>싫어요 ({post.dislikes || 0})</span>
              </button>
            </div>
            <Link
              href={`/forum/edit/${id}`}
              className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
            >
              수정
            </Link>
          </div>
        </div>
      </div>

      {/* 댓글 섹션 */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          댓글 {replies?.length || 0}개
        </h2>

        {isRepliesLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border p-4">
                <div className="animate-pulse">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : replies && replies.length > 0 ? (
          <div className="space-y-4">
            {replies.map((reply: any) => (
              <div key={reply.id} className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User size={16} className="text-gray-500" />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">{reply.author}</span>
                    <span>•</span>
                    <span>{new Date(reply.created_at).toLocaleDateString('ko-KR')}</span>
                  </div>
                </div>
                <div className="prose prose-sm max-w-none">
                  <div 
                    className="whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: reply.content.replace(/\n/g, '<br />') }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <MessageSquare size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">아직 댓글이 없습니다.</p>
            <p className="text-sm text-gray-500">첫 번째 댓글을 작성해보세요!</p>
          </div>
        )}
      </div>

      {/* 댓글 작성 폼 (추후 구현) */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">댓글 작성</h3>
        <div className="text-gray-500 text-center py-8">
          댓글 작성 기능은 추후 구현 예정입니다.
        </div>
      </div>
    </div>
  );
}

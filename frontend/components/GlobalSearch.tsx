'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useQuery } from '@tanstack/react-query'
import { apiRequest } from '@/lib/api-client'
import FlexSearch from 'flexsearch'

interface SearchResult {
  id: string
  type: 'docs' | 'blog' | 'forum'
  title: string
  content: string
  url: string
  excerpt?: string
  tags?: string[]
  category?: string
  author?: string
  created_at?: string
  match_score?: number
}

interface SearchData {
  docs: any[]
  blog: any[]
  forum: any[]
}

// FlexSearch 인덱스 설정
const createSearchIndex = () => {
  return new FlexSearch.Index({
    preset: 'match',
    tokenize: 'reverse',
    resolution: 9,
    cache: true
  })
}

const GlobalSearch: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // 검색 데이터 가져오기
  const { data: searchData, isLoading } = useQuery({
    queryKey: ['search-data'],
    queryFn: async (): Promise<SearchData> => {
      const [docs, blog, forum] = await Promise.all([
        apiRequest('/api/docs?limit=100'),
        apiRequest('/api/blog/posts?limit=100'),
        apiRequest('/api/forum?limit=100')
      ])
      
      return {
        docs: docs.documents || [],
        blog: blog || [],
        forum: forum.posts || []
      }
    },
    staleTime: 10 * 60 * 1000, // 10분간 캐시
    gcTime: 30 * 60 * 1000, // 30분간 보관
  })

  // FlexSearch 인덱스 생성 및 데이터 인덱싱
  const searchIndex = useMemo(() => {
    if (!searchData) return null
    
    const index = createSearchIndex()
    const searchItems: SearchResult[] = []
    
    // 문서 인덱싱
    searchData.docs.forEach((doc, idx) => {
      const searchableContent = `${doc.title} ${doc.content || ''} ${(doc.tags || []).join(' ')}`
      const item: SearchResult = {
        id: `docs-${idx}`,
        type: 'docs',
        title: doc.title,
        content: doc.content || '',
        url: `/docs/${doc.version || 'v1'}/${doc.language || 'ko'}/${doc.slug}`,
        excerpt: doc.metadata?.description || doc.excerpt,
        tags: doc.tags,
        category: doc.metadata?.category,
        created_at: doc.created_at
      }
      
      index.add(idx, searchableContent)
      searchItems[idx] = item
    })
    
    // 블로그 인덱싱
    const blogStartIndex = searchData.docs.length
    searchData.blog.forEach((post, idx) => {
      const searchableContent = `${post.title} ${post.content || ''} ${(post.tags || []).join(' ')}`
      const item: SearchResult = {
        id: `blog-${idx}`,
        type: 'blog',
        title: post.title,
        content: post.content || '',
        url: `/blog/${post.slug || post.id}`,
        excerpt: post.excerpt,
        tags: post.tags,
        author: post.author,
        created_at: post.created_at
      }
      
      const globalIndex = blogStartIndex + idx
      index.add(globalIndex, searchableContent)
      searchItems[globalIndex] = item
    })
    
    // 포럼 인덱싱
    const forumStartIndex = blogStartIndex + searchData.blog.length
    searchData.forum.forEach((post, idx) => {
      const searchableContent = `${post.title} ${post.content || ''} ${(post.tags || []).join(' ')}`
      const item: SearchResult = {
        id: `forum-${idx}`,
        type: 'forum',
        title: post.title,
        content: post.content || '',
        url: `/forum/${post.id}`,
        excerpt: post.excerpt,
        tags: post.tags,
        author: post.author,
        created_at: post.created_at
      }
      
      const globalIndex = forumStartIndex + idx
      index.add(globalIndex, searchableContent)
      searchItems[globalIndex] = item
    })
    
    return { index, items: searchItems }
  }, [searchData])

  // 검색 실행
  useEffect(() => {
    if (!searchIndex || !query.trim()) {
      setResults([])
      return
    }
    
    const searchResults = searchIndex.index.search(query, { limit: 10 }) as number[]
    const items = searchResults.map(idx => searchIndex.items[idx as number]).filter(Boolean)
    setResults(items)
    setSelectedIndex(-1)
  }, [query, searchIndex])

  // 키보드 이벤트 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/') {
        e.preventDefault()
        setIsOpen(true)
        setTimeout(() => inputRef.current?.focus(), 0)
      } else if (e.key === 'Escape') {
        setIsOpen(false)
        setQuery('')
        setResults([])
        setSelectedIndex(-1)
      } else if (isOpen && results.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, -1))
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
          e.preventDefault()
          const selectedResult = results[selectedIndex]
          if (selectedResult) {
            window.location.href = selectedResult.url
            setIsOpen(false)
          }
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex])

  // 외부 클릭 처리
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'docs': return '📄 문서'
      case 'blog': return '📝 블로그'
      case 'forum': return '💬 포럼'
      default: return type
    }
  }

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>')
  }

  return (
    <div className="relative" ref={searchRef}>
      {/* 검색 트리거 버튼 */}
      <button
        onClick={() => {
          setIsOpen(true)
          setTimeout(() => inputRef.current?.focus(), 0)
        }}
        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
      >
        <MagnifyingGlassIcon className="h-4 w-4" />
        <span>검색...</span>
        <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-xs font-mono bg-gray-200 text-gray-600 rounded border">
          /
        </kbd>
      </button>

      {/* 검색 모달 */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-start justify-center p-4 pt-16">
            <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
              {/* 검색 입력 */}
              <div className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 mr-3" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="검색어를 입력하세요..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none"
                />
                <button
                  onClick={() => {
                    setIsOpen(false)
                    setQuery('')
                    setResults([])
                  }}
                  className="ml-3 p-1 text-gray-400 hover:text-gray-600 rounded-md"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>

              {/* 검색 결과 */}
              <div className="max-h-96 overflow-y-auto">
                {isLoading && (
                  <div className="px-4 py-8 text-center text-gray-500">
                    <div className="animate-pulse">검색 데이터를 불러오는 중...</div>
                  </div>
                )}
                
                {!isLoading && query.trim() && results.length === 0 && (
                  <div className="px-4 py-8 text-center text-gray-500">
                    검색 결과가 없습니다.
                  </div>
                )}
                
                {!isLoading && results.length > 0 && (
                  <div className="py-2">
                    {results.map((result, index) => (
                      <Link
                        key={result.id}
                        href={result.url}
                        onClick={() => setIsOpen(false)}
                        className={`block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                          index === selectedIndex ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-xs text-gray-500">
                                {getTypeLabel(result.type)}
                              </span>
                              {result.tags && result.tags.length > 0 && (
                                <div className="flex space-x-1">
                                  {result.tags.slice(0, 2).map((tag, idx) => (
                                    <span
                                      key={idx}
                                      className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                                    >
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <h3 
                              className="text-sm font-medium text-gray-900 dark:text-white mb-1"
                              dangerouslySetInnerHTML={{
                                __html: highlightMatch(result.title, query)
                              }}
                            />
                            {result.excerpt && (
                              <p 
                                className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2"
                                dangerouslySetInnerHTML={{
                                  __html: highlightMatch(result.excerpt.substring(0, 120) + '...', query)
                                }}
                              />
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                
                {!isLoading && !query.trim() && (
                  <div className="px-4 py-8 text-center text-gray-500">
                    <p className="text-sm mb-2">검색어를 입력해주세요</p>
                    <p className="text-xs text-gray-400">
                      문서, 블로그, 포럼에서 통합 검색됩니다
                    </p>
                  </div>
                )}
              </div>

              {/* 단축키 안내 */}
              <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center justify-between">
                  <span>↑↓로 선택, Enter로 이동, Esc로 닫기</span>
                  <span>/ 키로 검색 열기</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GlobalSearch
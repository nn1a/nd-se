'use client'

import Link from 'next/link'
import { useState } from 'react'
import GlobalSearch from './GlobalSearch'
import { useAuth } from '../hooks/useAuth'

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, isLoading, logout } = useAuth()

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
            NDASH
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link href="/docs" className="nav-link">
              문서
            </Link>
            <Link href="/blog" className="nav-link">
              블로그
            </Link>
            <Link href="/dashboard" className="nav-link">
              대시보드
            </Link>
            <Link href="/forum" className="nav-link">
              게시판
            </Link>
            <GlobalSearch />
            <div className="flex items-center space-x-4">
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
              ) : user ? (
                <>
                  <span className="text-sm text-gray-600 font-medium">
                    안녕하세요, {user.username}님
                  </span>
                  <Link 
                    href="/forum/drafts"
                    className="btn btn-ghost text-sm"
                  >
                    내 글
                  </Link>
                  <button
                    onClick={logout}
                    className="text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-md transition-colors"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="btn btn-ghost"
                  >
                    로그인
                  </Link>
                  <Link
                    href="/auth/register"
                    className="btn btn-primary"
                  >
                    회원가입
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-gray-900"
            >
              <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                {isOpen ? (
                  <path d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z" />
                ) : (
                  <path d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link href="/docs" className="block px-3 py-2 text-gray-700 hover:text-gray-900">
                문서
              </Link>
              <Link href="/blog" className="block px-3 py-2 text-gray-700 hover:text-gray-900">
                블로그
              </Link>
              <Link href="/dashboard" className="block px-3 py-2 text-gray-700 hover:text-gray-900">
                대시보드
              </Link>
              <Link href="/forum" className="block px-3 py-2 text-gray-700 hover:text-gray-900">
                게시판
              </Link>
              <div className="px-3 py-2 space-y-2">
                {isLoading ? (
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                  </div>
                ) : user ? (
                  <>
                    <div className="text-sm text-gray-600 mb-2">
                      안녕하세요, {user.username}님
                    </div>
                    <Link 
                      href="/forum/drafts"
                      className="block text-gray-700 hover:text-gray-900"
                      onClick={() => setIsOpen(false)}
                    >
                      내 글
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                      className="block text-red-600 hover:text-red-800"
                    >
                      로그아웃
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block text-gray-700 hover:text-gray-900"
                      onClick={() => setIsOpen(false)}
                    >
                      로그인
                    </Link>
                    <Link
                      href="/auth/register"
                      className="block bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 w-fit"
                      onClick={() => setIsOpen(false)}
                    >
                      회원가입
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

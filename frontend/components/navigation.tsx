'use client'

import Link from 'next/link'
import { useState } from 'react'

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-white shadow-sm border-b fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-gray-900">
            ND-SE
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/docs" className="text-gray-700 hover:text-gray-900">
              문서
            </Link>
            <Link href="/blog" className="text-gray-700 hover:text-gray-900">
              블로그
            </Link>
            <Link href="/dashboard" className="text-gray-700 hover:text-gray-900">
              대시보드
            </Link>
            <Link href="/forum" className="text-gray-700 hover:text-gray-900">
              게시판
            </Link>
            <div className="flex items-center space-x-4">
              <button className="text-gray-700 hover:text-gray-900">
                로그인
              </button>
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
              <div className="px-3 py-2">
                <button className="text-gray-700 hover:text-gray-900">
                  로그인
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

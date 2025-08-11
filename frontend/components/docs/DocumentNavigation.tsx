'use client'

import React, { useState } from 'react'
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

interface NavigationItem {
  slug: string
  title: string
  children?: NavigationItem[]
}

interface DocumentNavigationProps {
  navigation: NavigationItem[]
  currentSlug: string
}

export default function DocumentNavigation({ navigation, currentSlug }: DocumentNavigationProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const toggleExpanded = (slug: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(slug)) {
      newExpanded.delete(slug)
    } else {
      newExpanded.add(slug)
    }
    setExpandedItems(newExpanded)
  }

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const isExpanded = expandedItems.has(item.slug)
    const isActive = currentSlug === item.slug
    const hasChildren = item.children && item.children.length > 0

    return (
      <div key={item.slug} className={`ml-${level * 4}`}>
        <div
          className={`flex items-center py-2 px-3 rounded-md cursor-pointer hover:bg-gray-100 ${
            isActive ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' : 'text-gray-700'
          }`}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.slug)
            } else {
              window.location.href = `/docs/${item.slug}`
            }
          }}
        >
          {hasChildren && (
            <span className="mr-2">
              {isExpanded ? (
                <ChevronDownIcon className="h-4 w-4" />
              ) : (
                <ChevronRightIcon className="h-4 w-4" />
              )}
            </span>
          )}
          <span className="text-sm font-medium">{item.title}</span>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="ml-4">
            {item.children!.map((child: NavigationItem) => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <nav className="w-64 bg-white border-r border-gray-200 fixed left-0 top-16 bottom-0 overflow-y-auto z-40">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Documentation</h2>
        <div className="space-y-1">
          {navigation.map((item: NavigationItem) => renderNavigationItem(item))}
        </div>
      </div>
    </nav>
  )
}
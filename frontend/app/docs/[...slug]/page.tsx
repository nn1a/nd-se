'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { useQuery } from '@tanstack/react-query'
import { getDocumentApiDocsSlugGetOptions, getNavigationApiDocsNavigationGetOptions } from '../../../src/lib/api/@tanstack/react-query.gen'
import MDXRenderer from '../../../components/MDXRenderer'


interface TocItem {
  id: string
  title: string
  level: number
}

function DocumentNavigation({ currentSlug }: { currentSlug: string }) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const { data: navigationData, isLoading } = useQuery(
    getNavigationApiDocsNavigationGetOptions()
  )

  const toggleExpanded = (slug: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(slug)) {
      newExpanded.delete(slug)
    } else {
      newExpanded.add(slug)
    }
    setExpandedItems(newExpanded)
  }

  const renderNavigationItem = (item: any, level = 0) => {
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
            {item.children!.map((child: any) => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <nav className="w-64 bg-white border-r border-gray-200 fixed left-0 top-16 bottom-0 overflow-y-auto z-40">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Documentation</h2>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="w-64 bg-white border-r border-gray-200 fixed left-0 top-16 bottom-0 overflow-y-auto z-40">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Documentation</h2>
        <div className="space-y-1">
          {((navigationData as any)?.navigation || []).map((item: any) => renderNavigationItem(item))}
        </div>
      </div>
    </nav>
  )
}

function TableOfContents({ content, activeId }: { content: string; activeId: string }) {
  const [tocItems, setTocItems] = useState<TocItem[]>([])

  useEffect(() => {
    const generateTocItems = async () => {
      const { remark } = await import('remark')
      const remarkGfm = await import('remark-gfm')
      
      try {
        const tree = remark()
          .use(remarkGfm.default)
          .parse(content)
        
        const items: TocItem[] = []
        
        const visit = (node: any) => {
          if (node.type === 'heading' && node.depth <= 4) {
            const title = node.children
              .filter((child: any) => child.type === 'text')
              .map((child: any) => child.value)
              .join('')
            
            if (title) {
              const id = title.toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/(^-|-$)/g, '')
              
              items.push({
                id,
                title,
                level: node.depth
              })
            }
          }
          
          if (node.children) {
            node.children.forEach(visit)
          }
        }
        
        visit(tree)
        setTocItems(items)
      } catch (error) {
        console.error('Error generating TOC:', error)
        // Fallback to regex parsing
        const headingRegex = /^(#{1,4})\s+(.+)$/gm
        const items: TocItem[] = []
        let match

        while ((match = headingRegex.exec(content)) !== null) {
          const level = match[1].length
          const title = match[2].trim()
          const id = title.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/(^-|-$)/g, '')
          
          items.push({ id, title, level })
        }
        setTocItems(items)
      }
    }

    if (content) {
      generateTocItems()
    }
  }, [content])

  return (
    <div className="w-64 bg-white border-l border-gray-200 fixed right-0 top-16 bottom-0 overflow-y-auto z-40">
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">On this page</h3>
        <div className="space-y-2">
          {tocItems.map((item, index) => (
            <a
              key={index}
              href={`#${item.id}`}
              className={`block text-sm py-1 px-2 rounded transition-colors ${
                activeId === item.id
                  ? 'text-blue-700 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              } ${item.level === 1 ? 'ml-0' : item.level === 2 ? 'ml-3' : item.level === 3 ? 'ml-6' : 'ml-9'}`}
            >
              {item.title}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

function MarkdownRenderer({ content, setActiveId }: { content: string; setActiveId: (id: string) => void }) {
  useEffect(() => {
    if (!content) return

    const contentElement = document.getElementById('markdown-content')
    if (!contentElement) return

    // Set up intersection observer for TOC after content renders
    const setupObserver = () => {
      const headings = contentElement.querySelectorAll('h1, h2, h3, h4, h5, h6')
      
      // Generate proper IDs for headings and add anchor links
      headings.forEach((heading) => {
        const headingElement = heading as HTMLElement
        const id = heading.textContent?.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/(^-|-$)/g, '') || ''
        heading.id = id
        
        // Add anchor link
        if (!heading.querySelector('.anchor-link')) {
          const anchor = document.createElement('a')
          anchor.href = `#${id}`
          anchor.className = 'anchor-link'
          anchor.innerHTML = '#'
          anchor.style.cssText = `
            float: left;
            margin-left: -1.5rem;
            padding-right: 0.5rem;
            text-decoration: none;
            opacity: 0;
            transition: opacity 0.2s ease;
            color: #3b82f6;
          `
          
          headingElement.style.position = 'relative'
          heading.prepend(anchor)
          
          headingElement.addEventListener('mouseenter', () => {
            anchor.style.opacity = '1'
          })
          headingElement.addEventListener('mouseleave', () => {
            anchor.style.opacity = '0'
          })
        }
      })

      // Set up intersection observer for TOC
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveId(entry.target.id)
            }
          })
        },
        { rootMargin: '-10% 0% -80% 0%' }
      )

      // Observe all headings
      headings.forEach((heading) => {
        observer.observe(heading)
      })

      return () => {
        observer.disconnect()
      }
    }

    // Wait for MDX content to render, then setup observer
    const timeout = setTimeout(setupObserver, 100)
    
    return () => {
      clearTimeout(timeout)
    }
  }, [content, setActiveId])

  return (
    <div className="ml-64 mr-64 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-8">
        <div id="markdown-content" className="docusaurus-docs docusaurus-prose prose-headings:scroll-mt-20">
          <MDXRenderer content={content} />
        </div>
      </div>
    </div>
  )
}

export default function DocumentPage() {
  const params = useParams()
  const slug = Array.isArray(params?.slug) ? params.slug.join('/') : params?.slug || ''
  const [activeId, setActiveId] = useState('')
  
  const { data: doc, isLoading, error } = useQuery(
    getDocumentApiDocsSlugGetOptions({
      path: { slug }
    })
  )

  if (isLoading) {
    return (
      <div className="h-screen bg-gray-50 flex overflow-hidden">
        <DocumentNavigation currentSlug={slug} />
        <div className="ml-64 mr-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading document...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !doc) {
    return (
      <div className="h-screen bg-gray-50 flex overflow-hidden">
        <DocumentNavigation currentSlug={slug} />
        <div className="ml-64 mr-64 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Document Not Found</h1>
            <p className="text-gray-600 mb-4">
              {error instanceof Error ? error.message : 'The requested document could not be found.'}
            </p>
            <a
              href="/docs"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Back to Documentation
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <DocumentNavigation currentSlug={slug} />
      <MarkdownRenderer content={(doc as any)?.content || ''} setActiveId={setActiveId} />
      <TableOfContents content={(doc as any)?.content || ''} activeId={activeId} />
    </div>
  )
}

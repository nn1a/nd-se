'use client'

import React, { useState, useEffect } from 'react'

interface TocItem {
  id: string
  title: string
  level: number
}

interface TableOfContentsProps {
  content: string
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState('')

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

  useEffect(() => {
    if (!content) return

    const contentElement = document.getElementById('markdown-content')
    if (!contentElement) return

    const setupObserver = () => {
      const headings = contentElement.querySelectorAll('h1, h2, h3, h4, h5, h6')
      
      headings.forEach((heading) => {
        const headingElement = heading as HTMLElement
        const id = heading.textContent?.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/(^-|-$)/g, '') || ''
        heading.id = id
        
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

      headings.forEach((heading) => {
        observer.observe(heading)
      })

      return () => {
        observer.disconnect()
      }
    }

    const timeout = setTimeout(setupObserver, 100)
    
    return () => {
      clearTimeout(timeout)
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
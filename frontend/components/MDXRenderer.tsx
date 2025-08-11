'use client'

import React, { useEffect, useState } from 'react'
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import remarkFrontmatter from 'remark-frontmatter'
import rehypeSlug from 'rehype-slug'
import rehypePrismPlus from 'rehype-prism-plus'
import { components } from './MDXComponents'

interface MDXRendererProps {
  content: string
  className?: string
}

export default function MDXRenderer({ content, className = '' }: MDXRendererProps) {
  const [mdxSource, setMdxSource] = useState<MDXRemoteSerializeResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const processMDX = async () => {
      try {
        setLoading(true)
        setError(null)

        // Process admonitions first (convert to MDX components)
        let processedContent = content
        
        // Convert admonition syntax to Alert components
        processedContent = processedContent.replace(
          /:::(note|tip|info|caution|danger)(?:\s+(.+))?\n([\s\S]*?):::/g,
          (match, type, title, content) => {
            const alertType = type === 'caution' ? 'warning' : 
                            type === 'danger' ? 'error' : 
                            type === 'note' ? 'info' : type
            const alertTitle = title || (type.charAt(0).toUpperCase() + type.slice(1))
            return `<Alert type="${alertType}" title="${alertTitle}">

${content.trim()}

</Alert>`
          }
        )

        // Try with GFM first
        let mdxSource
        try {
          const remarkGfm = (await import('remark-gfm')).default
          mdxSource = await serialize(processedContent, {
            mdxOptions: {
              remarkPlugins: [
                [remarkGfm, { singleTilde: false }],
                remarkFrontmatter as any
              ],
              rehypePlugins: [
                rehypeSlug as any,
                [rehypePrismPlus as any, {
                  ignoreMissing: true,
                  showLineNumbers: true
                }]
              ],
              development: process.env.NODE_ENV === 'development',
              format: 'mdx'
            },
            parseFrontmatter: false,
          })
        } catch (gfmError) {
          console.warn('Failed to use remark-gfm, falling back without GFM:', gfmError)
          // Fallback without GFM
          mdxSource = await serialize(processedContent, {
            mdxOptions: {
              remarkPlugins: [remarkFrontmatter],
              rehypePlugins: [
                rehypeSlug as any,
                [rehypePrismPlus as any, {
                  ignoreMissing: true,
                  showLineNumbers: true
                }]
              ],
              development: process.env.NODE_ENV === 'development',
              format: 'mdx'
            },
            parseFrontmatter: false,
          })
        }

        setMdxSource(mdxSource)
      } catch (err) {
        console.error('Error processing MDX:', err)
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (content) {
      processMDX()
    }
  }, [content])

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-32 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center mb-2">
          <span className="text-red-500 mr-2">🚨</span>
          <h3 className="text-red-800 font-semibold">MDX Rendering Error</h3>
        </div>
        <p className="text-red-700 text-sm">{error}</p>
        <details className="mt-2">
          <summary className="text-red-600 text-xs cursor-pointer">Show raw content</summary>
          <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-x-auto whitespace-pre-wrap">
            {content}
          </pre>
        </details>
      </div>
    )
  }

  if (!mdxSource) {
    return <div className={className}>No content to display</div>
  }

  return (
    <div className={`mdx-content ${className}`}>
      <MDXRemote {...mdxSource} components={components} />
    </div>
  )
}
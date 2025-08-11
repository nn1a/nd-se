'use client'

import React, { useState } from 'react'
import { CheckIcon, ClipboardIcon } from '@heroicons/react/24/outline'

interface CodeBlockProps {
  children: React.ReactNode
  className?: string
  language?: string
  showLineNumbers?: boolean
}

export default function CodeBlock({ children, className, language, showLineNumbers = false }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  
  const getTextContent = (node: any): string => {
    if (typeof node === 'string') return node
    if (typeof node === 'number') return String(node)
    if (Array.isArray(node)) return node.map(getTextContent).join('')
    if (node?.props?.children) return getTextContent(node.props.children)
    return ''
  }

  const handleCopy = async () => {
    const textContent = getTextContent(children)
    try {
      await navigator.clipboard.writeText(textContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  const detectedLanguage = language || className?.replace(/language-/, '') || 'text'

  return (
    <div className="code-block relative mb-6 group">
      <div className="flex items-center justify-between bg-gray-800 px-4 py-2 rounded-t-lg border-b border-gray-700">
        <span className="text-xs font-medium text-gray-300 uppercase tracking-wide">
          {detectedLanguage}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-gray-300 hover:text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
          title="Copy code"
        >
          {copied ? (
            <>
              <CheckIcon className="h-3 w-3" />
              Copied!
            </>
          ) : (
            <>
              <ClipboardIcon className="h-3 w-3" />
              Copy
            </>
          )}
        </button>
      </div>
      <pre 
        className={`bg-gray-900 text-gray-100 p-4 rounded-b-lg overflow-x-auto text-sm font-mono leading-6 custom-scrollbar ${className || ''}`}
      >
        {showLineNumbers ? (
          <code className="block">
            {getTextContent(children).split('\n').map((line, index) => (
              <span key={index} className="table-row">
                <span className="table-cell text-gray-500 text-right pr-4 select-none">
                  {index + 1}
                </span>
                <span className="table-cell">{line}</span>
              </span>
            ))}
          </code>
        ) : (
          <code className={className || 'font-mono text-sm'}>
            {children}
          </code>
        )}
      </pre>
    </div>
  )
}
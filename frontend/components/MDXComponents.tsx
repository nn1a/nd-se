import React from 'react'

// Custom MDX components
export const MDXComponents = {
  // Headings with custom styling
  h1: (props: any) => (
    <h1 className="text-4xl font-bold mb-6 pb-3 border-b border-gray-200 text-gray-900" {...props} />
  ),
  h2: (props: any) => (
    <h2 className="text-3xl font-semibold mb-4 mt-8 pb-2 border-b border-gray-200 text-gray-900" {...props} />
  ),
  h3: (props: any) => (
    <h3 className="text-2xl font-semibold mb-3 mt-6 text-gray-900" {...props} />
  ),
  h4: (props: any) => (
    <h4 className="text-xl font-semibold mb-2 mt-4 text-gray-900" {...props} />
  ),
  h5: (props: any) => (
    <h5 className="text-lg font-semibold mb-2 mt-4 text-gray-900" {...props} />
  ),
  h6: (props: any) => (
    <h6 className="text-base font-semibold mb-2 mt-4 text-gray-700" {...props} />
  ),

  // Paragraphs
  p: (props: any) => (
    <p className="mb-4 leading-7 text-gray-700" {...props} />
  ),

  // Links
  a: (props: any) => (
    <a 
      className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
      {...props} 
    />
  ),

  // Lists
  ul: (props: any) => (
    <ul className="mb-4 pl-6 space-y-2 list-disc" {...props} />
  ),
  ol: (props: any) => (
    <ol className="mb-4 pl-6 space-y-2 list-decimal" {...props} />
  ),
  li: (props: any) => (
    <li className="leading-6 text-gray-700" {...props} />
  ),

  // Code blocks
  pre: (props: any) => (
    <pre className="bg-gray-100 border border-gray-200 rounded-lg p-4 mb-4 overflow-x-auto text-sm" {...props} />
  ),
  code: (props: any) => {
    // Inline code
    if (!props.className) {
      return (
        <code className="bg-gray-100 border border-gray-200 rounded px-2 py-1 text-sm font-mono text-gray-800" {...props} />
      )
    }
    // Block code
    return <code className="font-mono text-sm" {...props} />
  },

  // Blockquotes
  blockquote: (props: any) => (
    <blockquote className="border-l-4 border-blue-500 bg-blue-50 p-4 mb-4 italic rounded-r-lg" {...props} />
  ),

  // Tables
  table: (props: any) => (
    <div className="mb-4 overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden" {...props} />
    </div>
  ),
  th: (props: any) => (
    <th className="bg-gray-100 border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900" {...props} />
  ),
  td: (props: any) => (
    <td className="border border-gray-300 px-4 py-2 text-gray-700" {...props} />
  ),
  tr: (props: any) => (
    <tr className="even:bg-gray-50" {...props} />
  ),

  // Images
  img: (props: any) => (
    <img className="max-w-full h-auto rounded-lg shadow-md mb-4" {...props} />
  ),

  // Horizontal rule
  hr: (props: any) => (
    <hr className="my-8 border-t border-gray-300" {...props} />
  ),
}

// Custom interactive components for MDX
export const Alert = ({ 
  type = 'info', 
  title, 
  children 
}: { 
  type?: 'info' | 'warning' | 'error' | 'success'
  title?: string
  children: React.ReactNode 
}) => {
  const baseClasses = "border border-l-4 p-4 mb-6 rounded-r-lg shadow-sm"
  
  const styles = {
    info: 'bg-blue-50 border-blue-200 border-l-blue-500 text-blue-900',
    warning: 'bg-yellow-50 border-yellow-200 border-l-yellow-500 text-yellow-900',
    error: 'bg-red-50 border-red-200 border-l-red-500 text-red-900',
    success: 'bg-green-50 border-green-200 border-l-green-500 text-green-900',
  }

  const icons = {
    info: '💡',
    warning: '⚠️',
    error: '🚨',
    success: '✅',
  }

  return (
    <div className={`${baseClasses} ${styles[type]}`}>
      {title && (
        <div className="font-semibold mb-3 flex items-center gap-2 text-lg">
          <span className="text-xl">{icons[type]}</span>
          {title}
        </div>
      )}
      <div className="prose prose-sm max-w-none [&>*:last-child]:mb-0">
        {children}
      </div>
    </div>
  )
}

export const CodeBlock = ({ 
  language, 
  title, 
  children 
}: { 
  language?: string
  title?: string
  children: React.ReactNode 
}) => {
  return (
    <div className="mb-6 rounded-lg overflow-hidden border border-gray-300 shadow-sm">
      {title && (
        <div className="bg-gray-100 border-b border-gray-300 px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-mono font-semibold text-gray-800">{title}</span>
          {language && (
            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-md font-mono">
              {language}
            </span>
          )}
        </div>
      )}
      <pre className={`bg-gray-900 text-gray-100 p-4 overflow-x-auto text-sm m-0 font-mono leading-relaxed ${title ? '' : 'rounded-lg'}`}>
        <code className={language ? `language-${language}` : ''}>{children}</code>
      </pre>
    </div>
  )
}

export const Tabs = ({ 
  children, 
  defaultTab = 0 
}: { 
  children: React.ReactElement[]
  defaultTab?: number 
}) => {
  const [activeTab, setActiveTab] = React.useState(defaultTab)

  return (
    <div className="mb-6 rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <div className="flex bg-gray-50 border-b border-gray-200">
        {children.map((child, index) => (
          <button
            key={index}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
              activeTab === index
                ? 'text-blue-600 border-blue-600 bg-white'
                : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab(index)}
          >
            {child.props.label}
          </button>
        ))}
      </div>
      <div className="p-6 bg-white">
        <div className="prose prose-sm max-w-none [&>*:last-child]:mb-0">
          {children[activeTab]}
        </div>
      </div>
    </div>
  )
}

export const Tab = ({ 
  label, 
  children 
}: { 
  label: string
  children: React.ReactNode 
}) => {
  return <div>{children}</div>
}

export const Card = ({ 
  title, 
  children, 
  className = '' 
}: { 
  title?: string
  children: React.ReactNode
  className?: string 
}) => {
  return (
    <div className={`card mb-6 ${className}`}>
      {title && (
        <div className="card-header">
          <h3 className="card-title text-xl">{title}</h3>
        </div>
      )}
      <div className={title ? "card-content" : "card-content pt-6"}>
        <div className="prose prose-sm max-w-none [&>*:last-child]:mb-0">
          {children}
        </div>
      </div>
    </div>
  )
}

export const Badge = ({ 
  children, 
  variant = 'default' 
}: { 
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800 border-gray-300',
    success: 'bg-green-100 text-green-800 border-green-300',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    error: 'bg-red-100 text-red-800 border-red-300',
    info: 'bg-blue-100 text-blue-800 border-blue-300',
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${variants[variant]} shadow-sm`}>
      {children}
    </span>
  )
}

// Export all components for MDX
export const components = {
  ...MDXComponents,
  Alert,
  CodeBlock,
  Tabs,
  Tab,
  Card,
  Badge,
}

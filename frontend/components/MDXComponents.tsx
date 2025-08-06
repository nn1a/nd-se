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
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800',
  }

  const icons = {
    info: '💡',
    warning: '⚠️',
    error: '🚨',
    success: '✅',
  }

  return (
    <div className={`border-l-4 p-4 mb-4 rounded-r-lg ${styles[type]}`}>
      {title && (
        <div className="font-semibold mb-2 flex items-center gap-2">
          <span>{icons[type]}</span>
          {title}
        </div>
      )}
      <div>{children}</div>
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
    <div className="mb-4">
      {title && (
        <div className="bg-gray-200 px-4 py-2 text-sm font-mono font-semibold text-gray-700 border border-gray-300 rounded-t-lg">
          {title} {language && <span className="text-gray-500">({language})</span>}
        </div>
      )}
      <pre className={`bg-gray-900 text-gray-100 p-4 overflow-x-auto text-sm ${title ? 'rounded-b-lg' : 'rounded-lg'} border border-gray-300`}>
        <code>{children}</code>
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
    <div className="mb-4">
      <div className="flex border-b border-gray-200">
        {children.map((child, index) => (
          <button
            key={index}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === index
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
            onClick={() => setActiveTab(index)}
          >
            {child.props.label}
          </button>
        ))}
      </div>
      <div className="p-4 border border-t-0 border-gray-200 rounded-b-lg">
        {children[activeTab]}
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
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-4 ${className}`}>
      {title && <h3 className="text-lg font-semibold mb-3 text-gray-900">{title}</h3>}
      <div>{children}</div>
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
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
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

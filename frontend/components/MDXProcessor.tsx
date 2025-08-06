import React from 'react'
import { components } from './MDXComponents'

interface MDXProviderProps {
  children: React.ReactNode
}

export const MDXProvider: React.FC<MDXProviderProps> = ({ children }) => {
  return (
    <div className="mdx-content">
      {children}
    </div>
  )
}

// Simple MDX component renderer for our use case
export const renderMDXComponent = (componentName: string, props: any, children?: React.ReactNode) => {
  const Component = (components as any)[componentName]
  if (Component) {
    return React.createElement(Component, props, children)
  }
  return null
}

// Parse and render simple MDX-style components
export const parseMDXComponents = (htmlContent: string): string => {
  let processedContent = htmlContent
  
  // Apply default styling to all pre/code blocks that don't already have styling
  processedContent = processedContent.replace(
    /<pre>(?!.*class=)(<code[^>]*>)/g, 
    '<pre class="bg-gray-900 text-gray-100 p-4 overflow-x-auto text-sm rounded-lg border border-gray-300">$1'
  )
  
  // Handle Tabs components - process these first before other components
  processedContent = processedContent.replace(/<Tabs(?:\s+defaultTab=\{(\d+)\})?>([\s\S]*?)<\/Tabs>/g, 
    (match: string, defaultTab: string, tabsContent: string) => {
      let tabIndex = 0
      let tabButtons = ''
      let tabPanels = ''
      
      tabsContent.replace(/<Tab\s+label="([^"]*)">([\s\S]*?)<\/Tab>/g, 
        (tabMatch: string, label: string, content: string) => {
          const isActive = parseInt(defaultTab || '0') === tabIndex
          
          tabButtons += `<button class="tab-button px-4 py-2 text-sm font-medium border-b-2 ${
            isActive
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }" data-tab-index="${tabIndex}">${label}</button>`
          
          // Clean up the content - remark may have already processed it
          let cleanContent = content.trim()
          
          // Apply default styling to pre/code blocks in tabs
          cleanContent = cleanContent.replace(
            /<pre>(?!.*class=)(<code[^>]*>)/g, 
            '<pre class="bg-gray-900 text-gray-100 p-4 overflow-x-auto text-sm rounded-lg border border-gray-300">$1'
          )
          
          tabPanels += `<div class="tab-panel${isActive ? ' active' : ''}" data-tab-index="${tabIndex}"${isActive ? '' : ' style="display:none"'}>${cleanContent}</div>`
          
          tabIndex++
          return ''
        }
      )
      
      return `<div class="mdx-component tabs-container bg-white border border-gray-200 rounded-lg mb-4" data-component="Tabs">
        <div class="tab-nav flex border-b border-gray-200">${tabButtons}</div>
        <div class="tab-content p-4">${tabPanels}</div>
      </div>`
    }
  )
  
  // Handle other components
  processedContent = processedContent
    .replace(/<Alert\s+type="(\w+)"(?:\s+title="([^"]*)")?>([\s\S]*?)<\/Alert>/g, 
      (match: string, type: string, title: string, children: string) => {
        const titleAttr = title ? ` data-title="${title}"` : ''
        return `<div class="mdx-component" data-component="Alert" data-type="${type}"${titleAttr}>${children}</div>`
      })
    .replace(/<Card(?:\s+title="([^"]*)")?(?:\s+className="([^"]*)")?>([\s\S]*?)<\/Card>/g,
      (match: string, title: string, className: string, children: string) => {
        const titleAttr = title ? ` data-title="${title}"` : ''
        const classAttr = className ? ` data-classname="${className}"` : ''
        return `<div class="mdx-component" data-component="Card"${titleAttr}${classAttr}>${children}</div>`
      })
    .replace(/<Badge\s+variant="(\w+)">(.*?)<\/Badge>/g,
      (match: string, variant: string, children: string) => {
        return `<span class="mdx-component" data-component="Badge" data-variant="${variant}">${children}</span>`
      })
    .replace(/<CodeBlock(?:\s+title="([^"]*)")?(?:\s+language="([^"]*)")?>[\s]*\{`([\s\S]*?)`\}[\s]*<\/CodeBlock>/g,
      (match: string, title: string, language: string, code: string) => {
        const titleAttr = title ? ` data-title="${title}"` : ''
        const langAttr = language ? ` data-language="${language}"` : ''
        const cleanCode = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        return `<div class="mdx-component" data-component="CodeBlock"${titleAttr}${langAttr}><pre class="bg-gray-900 text-gray-100 p-4 overflow-x-auto text-sm rounded-lg border border-gray-300"><code>${cleanCode}</code></pre></div>`
      })
  
  return processedContent
}

// Process MDX components after HTML rendering
export const processMDXComponents = (container: HTMLElement) => {
  const mdxComponents = container.querySelectorAll('.mdx-component')
  
  mdxComponents.forEach(element => {
    const componentType = element.getAttribute('data-component')
    
    switch (componentType) {
      case 'Alert':
        const type = element.getAttribute('data-type') || 'info'
        const title = element.getAttribute('data-title')
        
        const alertClasses = {
          info: 'bg-blue-50 border-blue-200 text-blue-800',
          warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          error: 'bg-red-50 border-red-200 text-red-800',
          success: 'bg-green-50 border-green-200 text-green-800'
        }
        
        const alertIcons = {
          info: '💡',
          warning: '⚠️',
          error: '🚨',
          success: '✅'
        }
        
        element.className = `border-l-4 p-4 mb-4 rounded-r-lg ${alertClasses[type as keyof typeof alertClasses]}`
        
        if (title) {
          const titleDiv = document.createElement('div')
          titleDiv.className = 'font-semibold mb-2 flex items-center gap-2'
          titleDiv.innerHTML = `<span>${alertIcons[type as keyof typeof alertIcons]}</span>${title}`
          element.insertBefore(titleDiv, element.firstChild)
        }
        break
        
      case 'Card':
        const cardTitle = element.getAttribute('data-title')
        const cardClassName = element.getAttribute('data-classname') || ''
        
        element.className = `bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-4 ${cardClassName}`
        
        if (cardTitle) {
          const titleElement = document.createElement('h3')
          titleElement.className = 'text-lg font-semibold mb-3 text-gray-900'
          titleElement.textContent = cardTitle
          element.insertBefore(titleElement, element.firstChild)
        }
        break
        
      case 'Badge':
        const variant = element.getAttribute('data-variant') || 'default'
        
        const badgeVariants = {
          default: 'bg-gray-100 text-gray-800',
          success: 'bg-green-100 text-green-800',
          warning: 'bg-yellow-100 text-yellow-800',
          error: 'bg-red-100 text-red-800',
          info: 'bg-blue-100 text-blue-800'
        }
        
        element.className = `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeVariants[variant as keyof typeof badgeVariants]}`
        break
        
      case 'CodeBlock':
        const codeTitle = element.getAttribute('data-title')
        const language = element.getAttribute('data-language')
        
        element.className = 'code-block-container mb-4'
        
        if (codeTitle) {
          const titleBar = document.createElement('div')
          titleBar.className = 'bg-gray-200 px-4 py-2 text-sm font-mono font-semibold text-gray-700 border border-gray-300 rounded-t-lg'
          titleBar.innerHTML = `${codeTitle} ${language ? `<span class="text-gray-500">(${language})</span>` : ''}`
          
          const pre = element.querySelector('pre')
          if (pre) {
            pre.className = 'bg-gray-900 text-gray-100 p-4 overflow-x-auto text-sm rounded-b-lg border border-gray-300 border-t-0'
            element.insertBefore(titleBar, pre)
          }
        } else {
          const pre = element.querySelector('pre')
          if (pre) {
            pre.className = 'bg-gray-900 text-gray-100 p-4 overflow-x-auto text-sm rounded-lg border border-gray-300'
          }
        }
        break
        
      case 'Tabs':
        // Tabs are already processed in HTML, just add event listeners
        const tabButtons = element.querySelectorAll('.tab-button')
        const tabPanels = element.querySelectorAll('.tab-panel')
        
        tabButtons.forEach((button) => {
          button.addEventListener('click', () => {
            const tabIndex = button.getAttribute('data-tab-index')
            
            // Update button states
            tabButtons.forEach((btn, i) => {
              btn.className = `tab-button px-4 py-2 text-sm font-medium border-b-2 ${
                i.toString() === tabIndex
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`
            })
            
            // Show/hide panels
            tabPanels.forEach((panel, i) => {
              const panelElement = panel as HTMLElement
              if (i.toString() === tabIndex) {
                panelElement.style.display = 'block'
              } else {
                panelElement.style.display = 'none'
              }
            })
          })
        })
        break
    }
  })
}

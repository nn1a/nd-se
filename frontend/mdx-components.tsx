import type { MDXComponents } from 'mdx/types'
import { components as CustomMDXComponents } from './components/MDXComponents'

// This file is required by Next.js for MDX support
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...CustomMDXComponents,
    ...components,
  }
}
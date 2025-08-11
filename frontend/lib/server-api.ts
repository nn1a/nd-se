import { notFound } from 'next/navigation'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface Document {
  _id: string
  slug: string
  title: string
  content: string
  version?: string
  language?: string
  category?: string
  created_at: string
  updated_at: string
  views: number
  metadata?: any
}

interface NavigationItem {
  slug: string
  title: string
  children?: NavigationItem[]
}

interface NavigationResponse {
  navigation: NavigationItem[]
}

export async function getDocument(slug: string): Promise<Document> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/docs/${slug}`, {
      next: { 
        revalidate: 60,
        tags: [`document:${slug}`, 'documents']
      }
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        notFound()
      }
      throw new Error(`Failed to fetch document: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching document:', error)
    throw error
  }
}

export async function getNavigation(): Promise<NavigationResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/docs/navigation`, {
      next: { 
        revalidate: 300,
        tags: ['navigation', 'documents']
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch navigation: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching navigation:', error)
    return { navigation: [] }
  }
}
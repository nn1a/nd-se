import React from 'react'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { getDocument, getNavigation } from '../../../lib/server-api'
import DocumentNavigation from '../../../components/docs/DocumentNavigation'
import TableOfContents from '../../../components/docs/TableOfContents'
import MDXRenderer from '../../../components/MDXRenderer'

interface DocumentPageProps {
  params: Promise<{ slug: string[] }>
}

export async function generateMetadata({ params }: DocumentPageProps): Promise<Metadata> {
  try {
    const resolvedParams = await params
    const slug = resolvedParams.slug.join('/')
    const doc = await getDocument(slug)
    
    return {
      title: doc.title,
      description: doc.content.substring(0, 160).replace(/[#*]/g, '').trim(),
      openGraph: {
        title: doc.title,
        description: doc.content.substring(0, 160).replace(/[#*]/g, '').trim(),
        type: 'article',
      },
    }
  } catch (error) {
    return {
      title: 'Document Not Found',
      description: 'The requested document could not be found.',
    }
  }
}

export default async function DocumentPage({ params }: DocumentPageProps) {
  const resolvedParams = await params
  const slug = resolvedParams.slug.join('/')
  
  try {
    const [doc, navigationData] = await Promise.all([
      getDocument(slug),
      getNavigation()
    ])

    return (
      <div className="h-screen bg-gray-50 flex overflow-hidden">
        <DocumentNavigation 
          navigation={navigationData.navigation} 
          currentSlug={slug} 
        />
        
        <div className="ml-64 mr-64 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-8">
            <article>
              <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {doc.title}
                </h1>
                {doc.metadata?.description && (
                  <p className="text-gray-600 text-lg">
                    {doc.metadata.description}
                  </p>
                )}
              </header>
              
              <div id="markdown-content" className="docusaurus-docs docusaurus-prose prose-headings:scroll-mt-20">
                <MDXRenderer content={doc.content} />
              </div>
            </article>
          </div>
        </div>
        
        <TableOfContents content={doc.content} />
      </div>
    )
  } catch (error) {
    notFound()
  }
}

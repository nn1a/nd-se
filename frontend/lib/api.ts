const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  created_at: string;
  updated_at: string;
  tags: string[];
  published: boolean;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    };

    // Add authentication header if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // Blog API
  async getBlogPosts() {
    return this.request<BlogPost[]>('/blog/posts');
  }

  async getBlogPost(slug: string) {
    return this.request<BlogPost>(`/blog/posts/${slug}`);
  }

  // Forum API
  async getForumTopics() {
    return this.request<{ topics: any[] }>('/forum/');
  }

  async getForumTopic(id: string) {
    return this.request<any>(`/forum/${id}`);
  }

  // User API
  async getUsers() {
    return this.request<any[]>('/users/');
  }

  async getUser(userId: string) {
    return this.request<any>(`/users/${userId}`);
  }

  // Analytics API
  async getAnalytics() {
    return this.request<any>('/analytics/');
  }

  async getContentAnalytics() {
    return this.request<any>('/analytics/content');
  }

  async getUserAnalytics() {
    return this.request<any>('/analytics/users');
  }

  // Documents API
  async getDocuments(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.category) searchParams.set('category', params.category);
    if (params?.search) searchParams.set('search', params.search);
    
    const queryString = searchParams.toString();
    const endpoint = `/api/docs${queryString ? `?${queryString}` : ''}`;
    
    return this.request<{
      documents: Array<{
        _id: string;
        slug: string;
        title: string;
        metadata: {
          category: string;
          tags: string[];
          author: string;
          lastUpdated: string;
          readingTime: number;
        };
        navigation: {
          parent: string | null;
          order: number;
          children?: string[];
        };
        created_at: string;
        updated_at: string;
      }>;
      total: number;
      page: number;
      pages: number;
      has_next: boolean;
      has_prev: boolean;
    }>(endpoint);
  }

  async getDocument(slug: string) {
    return this.request<{
      _id: string;
      slug: string;
      title: string;
      content: string;
      metadata: {
        title: string;
        description?: string;
        category: string;
        tags: string[];
        author: string;
        lastUpdated: string;
        readingTime: number;
      };
      navigation: {
        parent: string | null;
        order: number;
        children?: string[];
      };
      created_at: string;
      updated_at: string;
      views?: number;
      last_viewed?: string;
    }>(`/api/docs/${slug}`);
  }

  async getDocumentNavigation() {
    return this.request<{
      navigation: Array<{
        _id: string;
        slug: string;
        title: string;
        type: string;
        order: number;
        children?: Array<{
          slug: string;
          title: string;
          order: number;
        }>;
      }>;
    }>('/api/docs/navigation');
  }

  async createDocument(documentData: {
    title: string;
    slug: string;
    content: string;
    metadata: {
      category: string;
      tags: string[];
      description?: string;
    };
  }) {
    return this.request<any>('/api/docs', {
      method: 'POST',
      body: JSON.stringify(documentData),
    });
  }

  async updateDocument(slug: string, documentData: Partial<{
    title: string;
    content: string;
    metadata: {
      category: string;
      tags: string[];
      description?: string;
    };
  }>) {
    return this.request<any>(`/api/docs/${slug}`, {
      method: 'PUT',
      body: JSON.stringify(documentData),
    });
  }

  async deleteDocument(slug: string) {
    return this.request<{ message: string }>(`/api/docs/${slug}`, {
      method: 'DELETE',
    });
  }

  async getDocumentsByCategory(category: string, params?: {
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    
    const queryString = searchParams.toString();
    const endpoint = `/api/docs/category/${category}${queryString ? `?${queryString}` : ''}`;
    
    return this.request<any>(endpoint);
  }

  async searchDocuments(query: string, params?: {
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    
    const queryString = searchParams.toString();
    const endpoint = `/api/docs/search/${encodeURIComponent(query)}${queryString ? `?${queryString}` : ''}`;
    
    return this.request<any>(endpoint);
  }
}

export const apiClient = new ApiClient();

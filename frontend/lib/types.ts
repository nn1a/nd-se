// 공통 타입 정의
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

// 페이징 관련 타입
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
  has_prev: boolean;
}

// 인증 관련 타입
export interface User extends BaseEntity {
  email: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  is_active: boolean;
  role: 'user' | 'admin' | 'moderator';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

// 문서 관련 타입
export interface DocumentMeta extends BaseEntity {
  title: string;
  slug: string;
  version: string;
  language: string;
  description?: string;
  tags?: string[];
  author?: string;
  last_modified: string;
}

export interface DocumentContent {
  content: string;
  toc: TableOfContent[];
}

export interface TableOfContent {
  id: string;
  title: string;
  level: number;
  anchor: string;
  children?: TableOfContent[];
}

export interface Document extends DocumentMeta {
  content: string;
  toc: TableOfContent[];
}

// 블로그 관련 타입
export interface BlogPost extends BaseEntity {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author: User;
  tags: string[];
  category?: string;
  published_at?: string;
  is_published: boolean;
  featured_image?: string;
  reading_time?: number;
}

export interface BlogPostCreate {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  tags: string[];
  category?: string;
  is_published: boolean;
  featured_image?: string;
}

// 게시판 관련 타입
export interface ForumPost extends BaseEntity {
  title: string;
  content: string;
  author: User;
  category: string;
  tags?: string[];
  views: number;
  likes: number;
  is_pinned: boolean;
  is_locked: boolean;
  reply_count: number;
}

export interface ForumPostCreate {
  title: string;
  content: string;
  category: string;
  tags?: string[];
}

export interface ForumReply extends BaseEntity {
  content: string;
  author: User;
  post_id: string;
  parent_id?: string;
  likes: number;
}

export interface ForumReplyCreate {
  content: string;
  post_id: string;
  parent_id?: string;
}

// 대시보드 관련 타입
export interface DashboardStats {
  users: {
    total: number;
    active: number;
    new_today: number;
  };
  content: {
    documents: number;
    blog_posts: number;
    forum_posts: number;
  };
  analytics: {
    page_views: number;
    unique_visitors: number;
    bounce_rate: number;
  };
}

// 검색 관련 타입
export interface SearchParams {
  query: string;
  type?: 'all' | 'docs' | 'blog' | 'forum';
  language?: string;
  version?: string;
  tags?: string[];
  limit?: number;
}

export interface SearchResult {
  id: string;
  type: 'document' | 'blog' | 'forum';
  title: string;
  content: string;
  url: string;
  highlights: string[];
  score: number;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  took: number;
  suggestions?: string[];
}

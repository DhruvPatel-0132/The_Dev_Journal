export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'creator' | 'visitor';
  avatar?: string;
}

export interface Profile {
  user: User;
  bio?: string;
  socialLinks?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    website?: string;
  };
}

export interface Article {
  _id: string;
  title: string;
  seoSlug: string;
  bannerImage?: {
    url?: string;
    publicId?: string;
  };
  content: string;
  summary: string;
  category: string;
  tags: string[];
  seoKeywords: string[];
  author: User;
  readTime: number;
  viewCount: number;
  likeCount: number;
  dislikeCount: number;
  userAction?: 'liked' | 'disliked' | 'none';
  isFeatured: boolean;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalViews: number;
  totalLikes: number;
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  articles: T[];
  pagination: Pagination;
}

export interface Category {
  name: string;
  count: number;
}

export interface Tag {
  name: string;
  count: number;
}

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export interface User {
  uid: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'user' | 'banned';
  avatar?: string;
  bio?: string;
  createdAt: number;
  updatedAt: number;
  lastLogin?: number;
  isFrozen: boolean;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: {
    uid: string;
    name: string;
    avatar?: string;
  };
  featured_image?: string;
  status: 'draft' | 'published' | 'archived';
  views: number;
  createdAt: number;
  updatedAt: number;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
}

export interface Comment {
  id: string;
  content: string;
  author: {
    uid: string;
    name: string;
    isAnonymous: boolean;
    anonName?: string;
    avatar?: string;
  };
  articleId?: string;
  projectId?: string;
  createdAt: number;
  updatedAt: number;
  likes: number;
  dislikes: number;
  isReported: boolean;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  author: {
    uid: string;
    name: string;
    avatar?: string;
  };
  tags: string[];
  images: string[];
  links: Array<{
    title: string;
    url: string;
  }>;
  likes: number;
  dislikes: number;
  views: number;
  createdAt: number;
  updatedAt: number;
  isPopular: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  timestamp: number;
}

export interface DeviceFingerprint {
  userAgent: string;
  platform: string;
  language: string;
  timezone: string;
  screenResolution: string;
}

export interface AdminSession {
  userId: string;
  ipAddress: string;
  deviceFingerprint: DeviceFingerprint;
  token: string;
  expiresAt: number;
  createdAt: number;
}

export interface JWTPayload {
  uid: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

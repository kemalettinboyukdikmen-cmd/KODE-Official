import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle responses
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  register(email: string, password: string, confirmPassword: string, name: string) {
    return this.client.post('/auth/register', { email, password, confirmPassword, name });
  }

  login(email: string, password: string) {
    return this.client.post('/auth/login', { email, password });
  }

  logout() {
    return this.client.post('/auth/logout');
  }

  getCurrentUser() {
    return this.client.get('/auth/me');
  }

  updateProfile(data: any) {
    return this.client.post('/auth/profile', data);
  }

  changePassword(currentPassword: string, newPassword: string, confirmPassword: string) {
    return this.client.post('/auth/change-password', {
      currentPassword,
      newPassword,
      confirmPassword,
    });
  }

  refreshToken() {
    return this.client.post('/auth/refresh-token');
  }

  // News endpoints
  getArticles(limit: number = 20, offset: number = 0, tag?: string) {
    return this.client.get('/news/articles', {
      params: { limit, offset, tag },
    });
  }

  getArticle(slug: string) {
    return this.client.get(`/news/articles/${slug}`);
  }

  createArticle(data: any) {
    return this.client.post('/news/articles', data);
  }

  updateArticle(id: string, data: any) {
    return this.client.put(`/news/articles/${id}`, data);
  }

  publishArticle(id: string) {
    return this.client.post(`/news/articles/${id}/publish`);
  }

  deleteArticle(id: string) {
    return this.client.delete(`/news/articles/${id}`);
  }

  searchArticles(query: string) {
    return this.client.get('/news/search', { params: { q: query } });
  }

  // Forum endpoints
  getProjects(limit: number = 20, offset: number = 0, sortBy: string = 'recent', tag?: string) {
    return this.client.get('/forum/projects', {
      params: { limit, offset, sortBy, tag },
    });
  }

  getProject(id: string) {
    return this.client.get(`/forum/projects/${id}`);
  }

  createProject(data: any) {
    return this.client.post('/forum/projects', data);
  }

  updateProject(id: string, data: any) {
    return this.client.put(`/forum/projects/${id}`, data);
  }

  likeProject(id: string) {
    return this.client.post(`/forum/projects/${id}/like`);
  }

  dislikeProject(id: string) {
    return this.client.post(`/forum/projects/${id}/dislike`);
  }

  getPopularProjects(limit: number = 10) {
    return this.client.get('/forum/projects/popular', { params: { limit } });
  }

  deleteProject(id: string) {
    return this.client.delete(`/forum/projects/${id}`);
  }

  searchProjects(query: string) {
    return this.client.get('/forum/search', { params: { q: query } });
  }

  // Comments endpoints
  getArticleComments(articleId: string) {
    return this.client.get(`/comments/articles/${articleId}`);
  }

  getProjectComments(projectId: string) {
    return this.client.get(`/comments/projects/${projectId}`);
  }

  createComment(data: any) {
    return this.client.post('/comments', data);
  }

  updateComment(id: string, data: any) {
    return this.client.put(`/comments/${id}`, data);
  }

  deleteComment(id: string) {
    return this.client.delete(`/comments/${id}`);
  }

  reportComment(id: string) {
    return this.client.post(`/comments/${id}/report`);
  }

  likeComment(id: string) {
    return this.client.post(`/comments/${id}/like`);
  }

  dislikeComment(id: string) {
    return this.client.post(`/comments/${id}/dislike`);
  }

  getReportedComments() {
    return this.client.get('/comments/reported');
  }

  // Admin endpoints
  getUsers(limit: number = 50, offset: number = 0) {
    return this.client.get('/admin/users', { params: { limit, offset } });
  }

  searchUsers(query: string) {
    return this.client.get('/admin/users/search', { params: { q: query } });
  }

  createUser(email: string, password: string, name: string, role: string) {
    return this.client.post('/admin/users', { email, password, name, role });
  }

  changeUserRole(userId: string, role: string) {
    return this.client.put(`/admin/users/${userId}/role`, { role });
  }

  freezeUser(userId: string, reason: string) {
    return this.client.post(`/admin/users/${userId}/freeze`, { reason });
  }

  unfreezeUser(userId: string) {
    return this.client.post(`/admin/users/${userId}/unfreeze`);
  }

  deleteUser(userId: string) {
    return this.client.delete(`/admin/users/${userId}`);
  }

  getUserLogs(userId: string) {
    return this.client.get(`/admin/logs/user/${userId}`);
  }

  getActionLogs(action: string) {
    return this.client.get('/admin/logs/action', { params: { action } });
  }

  getRecentLogs(hours: number = 24) {
    return this.client.get('/admin/logs/recent', { params: { hours } });
  }
}

export const apiClient = new APIClient();

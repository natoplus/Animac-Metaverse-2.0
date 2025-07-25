import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API endpoints
export const apiEndpoints = {
  // Health check
  health: () => api.get('/api/health'),
  
  // Articles
  getArticles: (params = {}) => api.get('/api/articles', { params }),
  getArticle: (id) => api.get(`/api/articles/${id}`),
  createArticle: (data) => api.post('/api/articles', data),
  
  // Categories and stats
  getCategoryStats: () => api.get('/api/categories/stats'),
  getFeaturedContent: () => api.get('/api/featured-content'),
};

export default api;
// src/utils/api.js

import axios from 'axios';

// Base URL from .env or fallback
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'https://animac-metaverse.onrender.com/';

// Create Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptors for logging responses (only in development)
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] ${response.config.method.toUpperCase()} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API functions
export const fetchArticles = async (params = {}) => {
  const res = await api.get('/api/articles', { params });
  return res.data;
};

export const fetchArticleById = async (id) => {
  const res = await api.get(`/api/articles/${id}`);
  return res.data;
};

export const createArticle = async (data) => {
  const res = await api.post('/api/articles', data);
  return res.data;
};

export const fetchCategoryStats = async () => {
  const res = await api.get('/api/categories/stats');
  return res.data;
};

export const fetchFeaturedContent = async () => {
  const res = await api.get('/api/featured-content');
  return res.data;
};

export const healthCheck = async () => {
  const res = await api.get('/api/health');
  return res.data;
};

// Unified export for compatibility
export const apiEndpoints = {
  getArticles: fetchArticles,
  getArticle: fetchArticleById,
  getArticleById: fetchArticleById,
  createArticle,
  getFeaturedContent: fetchFeaturedContent,
  getCategoryStats: fetchCategoryStats,
  healthCheck,
};

export default apiEndpoints;

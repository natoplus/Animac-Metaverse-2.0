// src/utils/api.js

import axios from 'axios';

// Base URL from .env or fallback to deployed backend
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'https://animac-metaverse.onrender.com';

// Create Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Logs responses in dev mode
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] ${response.config.method.toUpperCase()} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    console.error('[❌ API ERROR]', error?.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ---------- API FUNCTIONS ----------

export const fetchArticles = async (params = {}) => {
  try {
    console.log('🌐 Fetching articles with params:', params);
    const res = await api.get('/api/articles', { params });
    console.log('✅ Fetched articles:', res.data);
    return res.data || [];
  } catch (err) {
    console.error('❌ Error fetching articles:', err.message);
    return [];
  }
};

export const fetchArticleById = async (id) => {
  try {
    const res = await api.get(`/api/articles/${id}`);
    console.log('✅ Fetched article:', res.data);
    return res.data || null;
  } catch (err) {
    console.error(`❌ Error fetching article [${id}]:`, err.message);
    return null;
  }
};

export const createArticle = async (data) => {
  try {
    const res = await api.post('/api/articles', data);
    console.log('✅ Created article:', res.data);
    return res.data;
  } catch (err) {
    console.error('❌ Error creating article:', err.message);
    return null;
  }
};

export const fetchCategoryStats = async () => {
  try {
    const res = await api.get('/api/categories/stats');
    console.log('✅ Category stats:', res.data);
    return res.data || [];
  } catch (err) {
    console.error('❌ Error fetching category stats:', err.message);
    return [];
  }
};

export const fetchFeaturedContent = async () => {
  try {
    const res = await api.get('/api/featured-content');
    console.log('✅ Fetched featured content:', res.data);
    return res.data || null;
  } catch (err) {
    console.error('❌ Error fetching featured content:', err.message);
    return null;
  }
};

export const healthCheck = async () => {
  try {
    const res = await api.get('/api/health');
    console.log('✅ Health check:', res.data);
    return res.data;
  } catch (err) {
    console.error('❌ Health check failed:', err.message);
    return null;
  }
};

// ---------- EXPORTS ----------

export const apiEndpoints = {
  getArticles: fetchArticles,
  getArticle: fetchArticleById,
  getArticleById: fetchArticleById,
  createArticle,
  getFeaturedContent: fetchFeaturedContent,
  getCategoryStats: fetchCategoryStats,
  healthCheck,
};

export const updateArticle = async (id, data) => {
  const res = await api.patch(`/api/articles/${id}`, data);
  return res.data;
};

export const deleteArticle = async (id) => {
  const res = await api.delete(`/api/articles/${id}`);
  return res.data;
};


export default apiEndpoints;

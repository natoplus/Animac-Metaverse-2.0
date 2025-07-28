import axios from 'axios';

// Base URL
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'https://animac-metaverse.onrender.com';

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Attach Auth token if needed in future
// api.interceptors.request.use(async (config) => {
//   const token = await getAuthTokenSomehow();
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// Logging interceptor (dev only)
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[✅ API] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    console.error('[❌ API ERROR]', error?.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ---------- CRUD FUNCTIONS ----------

// ✅ Fetch all articles
export const fetchArticles = async (params = {}) => {
  try {
    const res = await api.get('/api/articles', { params });
    return res.data || [];
  } catch (err) {
    console.error('❌ Error fetching articles:', err.message);
    return [];
  }
};

// ✅ Fetch article by ID
export const fetchArticleById = async (id) => {
  try {
    const res = await api.get(`/api/articles/${id}`);
    return res.data || null;
  } catch (err) {
    console.error(`❌ Error fetching article [${id}]:`, err.message);
    return null;
  }
};

// ✅ Create a new article
export const createArticle = async (data) => {
  try {
    const res = await api.post('/api/articles', data);
    return res.data;
  } catch (err) {
    console.error('❌ Error creating article:', err.message);
    return null;
  }
};

// ✅ Update article by ID
export const updateArticle = async (id, data) => {
  try {
    const res = await api.patch(`/api/articles/${id}`, data);
    return res.data;
  } catch (err) {
    console.error(`❌ Error updating article [${id}]:`, err.message);
    return null;
  }
};

// ✅ Delete article by ID
export const deleteArticle = async (id) => {
  try {
    const res = await api.delete(`/api/articles/${id}`);
    return res.data;
  } catch (err) {
    console.error(`❌ Error deleting article [${id}]:`, err.message);
    return null;
  }
};

// ✅ Fetch category stats
export const fetchCategoryStats = async () => {
  try {
    const res = await api.get('/api/categories/stats');
    return res.data || [];
  } catch (err) {
    console.error('❌ Error fetching category stats:', err.message);
    return [];
  }
};

// ✅ Fetch featured content
export const fetchFeaturedContent = async () => {
  try {
    const res = await api.get('/api/featured-content');
    return res.data || null;
  } catch (err) {
    console.error('❌ Error fetching featured content:', err.message);
    return null;
  }
};

// ✅ Health check
export const healthCheck = async () => {
  try {
    const res = await api.get('/api/health');
    return res.data;
  } catch (err) {
    console.error('❌ Health check failed:', err.message);
    return null;
  }
};

// Optional named export object (e.g., for quick import elsewhere)
export const apiEndpoints = {
  getArticles: fetchArticles,
  getArticleById: fetchArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  getFeaturedContent: fetchFeaturedContent,
  getCategoryStats: fetchCategoryStats,
  healthCheck,
};

export default apiEndpoints;

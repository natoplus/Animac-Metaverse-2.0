import axios from 'axios';

// ---------- Base Config ----------
const API_BASE_URL =
  process.env.REACT_APP_BACKEND_URL || 'https://animac-metaverse.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ---------- Dev Logging ----------
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[✅ API] ${response.config.method?.toUpperCase()} ${response.config.url}`,
        response.data
      );
    }
    return response;
  },
  (error) => {
    console.error(
      '[❌ API ERROR]',
      error?.response?.data || error.message
    );
    return Promise.reject(error);
  }
);

// ---------- Article Endpoints ----------

/**
 * Fetch articles with optional filters:
 * @param {object} params - { category, limit, is_published }
 * @returns {array}
 */
export const fetchArticles = async (params = {}) => {
  try {
    const res = await api.get('/api/articles', { params });
    return res.data || [];
  } catch (err) {
    console.error('❌ Error fetching articles:', err.message);
    return [];
  }
};

/**
 * Fetch all drafts or published articles
 * @param {boolean} draftsOnly
 */
export const fetchDrafts = async (draftsOnly = true) => {
  return fetchArticles({ is_published: !draftsOnly ? true : false });
};

export const getArticle = async (id) => {
  try {
    const res = await api.get(`/api/articles/by-id/${id}`);
    return res.data || null;
  } catch (err) {
    console.error(`❌ Error fetching article [${id}]:`, err.message);
    return null;
  }
};

export const getArticleBySlug = async (slug) => {
  try {
    const res = await api.get(`/api/articles/${slug}`);
    return res.data || null;
  } catch (err) {
    console.error(`❌ Error fetching article [slug: ${slug}]:`, err.message);
    return null;
  }
};

export const createArticle = async (data) => {
  try {
    const res = await api.post('/api/articles', data);
    return res.data;
  } catch (err) {
    console.error('❌ Error creating article:', err.message);
    return null;
  }
};

export const updateArticle = async (id, data) => {
  try {
    const res = await api.patch(`/api/articles/${id}`, data);
    return res.data;
  } catch (err) {
    console.error(`❌ Error updating article [${id}]:`, err.message);
    return null;
  }
};

export const deleteArticle = async (id) => {
  try {
    const res = await api.delete(`/api/articles/${id}`);
    return res.data;
  } catch (err) {
    console.error(`❌ Error deleting article [${id}]:`, err.message);
    return null;
  }
};

export const fetchCategoryStats = async () => {
  try {
    const res = await api.get('/api/categories/stats');
    return res.data || [];
  } catch (err) {
    console.error('❌ Error fetching category stats:', err.message);
    return [];
  }
};

export const fetchFeaturedContent = async () => {
  try {
    const res = await api.get('/api/featured-content');
    return res.data || null;
  } catch (err) {
    console.error('❌ Error fetching featured content:', err.message);
    return null;
  }
};

export const healthCheck = async () => {
  try {
    const res = await api.get('/api/health');
    return res.data;
  } catch (err) {
    console.error('❌ Health check failed:', err.message);
    return null;
  }
};

// ---------- Comment Endpoints ----------
export const fetchComments = async (articleId) => {
  try {
    const res = await api.get('/api/comments', { params: { article_id: articleId } });
    return res.data || [];
  } catch (err) {
    console.error(`❌ Error fetching comments for article [${articleId}]:`, err.message);
    return [];
  }
};

export const postComment = async ({ article_id, name, message }) => {
  try {
    const res = await api.post('/api/comments', { article_id, name, message });
    return res.data;
  } catch (err) {
    console.error('❌ Error posting comment:', err.message);
    return null;
  }
};

// ---------- Export Group ----------
export const apiEndpoints = {
  // Articles
  getArticles: fetchArticles,
  getDrafts: fetchDrafts,
  getArticle,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
  getFeaturedContent: fetchFeaturedContent,
  getCategoryStats: fetchCategoryStats,
  healthCheck,

  // Comments
  getComments: fetchComments,
  postComment,
};

export default apiEndpoints;

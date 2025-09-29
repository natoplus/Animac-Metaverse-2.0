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
export const fetchArticles = async (params = {}) => {
  try {
    console.log('🔍 Fetching articles with params:', params);
    const res = await api.get('/api/articles', { params });
    console.log('✅ Articles response:', res.data);
    return res.data || [];
  } catch (err) {
    console.error('❌ Error fetching articles:', err.response?.data || err.message);
    console.error('❌ Full error:', err);
    return [];
  }
};

export const fetchDrafts = async () => {
  try {
    const res = await api.get('/api/articles', { params: { is_published: false } });
    return res.data || [];
  } catch (err) {
    console.error('❌ Error fetching drafts:', err.message);
    return [];
  }
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
    return res.data || null;
  } catch (err) {
    console.error('❌ Error creating article:', err.message);
    return null;
  }
};

export const updateArticle = async (id, data) => {
  try {

    console.log(`🔄 Using PUT method for article update [${id}]`);
    const res = await api.put(`/api/articles/${id}`, data);
    return res.data || null;
  } catch (err) {
    console.error(`❌ Error updating article [${id}]:`, err.message);
    console.error(`❌ Full PUT error:`, err?.response?.data || err);
    
    // Fallback to PATCH if PUT fails
    console.log(`🔄 Falling back to PATCH method for article update [${id}]`);
    try {
      const patchRes = await api.patch(`/api/articles/${id}`, data);
      return patchRes.data || null;
    } catch (patchErr) {
      console.error(`❌ PATCH fallback also failed [${id}]:`, patchErr.message);
      return null;
    }
  }
};

export const deleteArticle = async (id) => {
  try {
    const res = await api.delete(`/api/articles/${id}`);
    return res.data || null;
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
    console.log('🔍 Fetching featured content...');
    const res = await api.get('/api/featured-content');
    console.log('✅ Featured content response:', res.data);
    return res.data || null;
  } catch (err) {
    console.error('❌ Error fetching featured content:', err.response?.data || err.message);
    console.error('❌ Full error:', err);
    return null;
  }
};

export const healthCheck = async () => {
  try {
    const res = await api.get('/api/health');
    return res.data || null;
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
    return res.data || null;
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

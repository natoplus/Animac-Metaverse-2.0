// src/utils/api.js

import axios from 'axios';

// ---------- Base Config ----------
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'https://animac-metaverse.onrender.com';

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
      console.log(`[✅ API] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    console.error('[❌ API ERROR]', error?.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ---------- Helper ----------
const handleApiError = (err, context = 'API') => {
  console.error(`❌ ${context} error:`, err?.response?.data?.message || err.message);
  return null;
};

// ---------- Article Endpoints ----------
export const fetchArticles = async (params = {}) => {
  try {
    const res = await api.get('/api/articles', { params });
    return res.data || [];
  } catch (err) {
    return handleApiError(err, 'Fetching articles');
  }
};

export const getArticle = async (id) => {
  if (!id) return null;
  try {
    const res = await api.get(`/api/articles/by-id/${id}`);
    return res.data || null;
  } catch (err) {
    return handleApiError(err, `Fetching article ID: ${id}`);
  }
};

export const getArticleBySlug = async (slug) => {
  if (!slug) return null;
  try {
    const res = await api.get(`/api/articles/${slug}`);
    return res.data || null;
  } catch (err) {
    return handleApiError(err, `Fetching article slug: ${slug}`);
  }
};

export const createArticle = async (data) => {
  try {
    const res = await api.post('/api/articles', data);
    return res.data;
  } catch (err) {
    return handleApiError(err, 'Creating article');
  }
};

export const updateArticle = async (id, data) => {
  if (!id) return null;
  try {
    const res = await api.patch(`/api/articles/${id}`, data);
    return res.data;
  } catch (err) {
    return handleApiError(err, `Updating article ID: ${id}`);
  }
};

export const deleteArticle = async (id) => {
  if (!id) return null;
  try {
    const res = await api.delete(`/api/articles/${id}`);
    return res.data;
  } catch (err) {
    return handleApiError(err, `Deleting article ID: ${id}`);
  }
};

export const fetchCategoryStats = async () => {
  try {
    const res = await api.get('/api/categories/stats');
    return res.data || [];
  } catch (err) {
    return handleApiError(err, 'Fetching category stats');
  }
};

export const fetchFeaturedContent = async () => {
  try {
    const res = await api.get('/api/featured-content');
    return res.data || null;
  } catch (err) {
    return handleApiError(err, 'Fetching featured content');
  }
};

export const healthCheck = async () => {
  try {
    const res = await api.get('/api/health');
    return res.data;
  } catch (err) {
    return handleApiError(err, 'Health check');
  }
};

// ---------- Article Like/Bookmark Toggles ----------
export const toggleLikeArticle = async (articleId, sessionId) => {
  try {
    const res = await api.post(`/api/articles/${articleId}/like`, { session_id: sessionId });
    return res.data;
  } catch (err) {
    return handleApiError(err, `Liking/unliking article ID: ${articleId}`);
  }
};

export const toggleBookmarkArticle = async (articleId, sessionId) => {
  try {
    const res = await api.post(`/api/articles/${articleId}/bookmark`, { session_id: sessionId });
    return res.data;
  } catch (err) {
    return handleApiError(err, `Bookmarking/unbookmarking article ID: ${articleId}`);
  }
};

// ---------- Comment Endpoints ----------
export const fetchComments = async (articleId) => {
  if (!articleId) return [];
  try {
    const res = await api.get('/api/comments', {
      params: { article_id: articleId },
    });
    return res.data || [];
  } catch (err) {
    return handleApiError(err, `Fetching comments for article ID: ${articleId}`);
  }
};

export const postComment = async ({ article_id, name, message, parent_id = null }) => {
  try {
    const res = await api.post('/api/comments', {
      article_id,
      name,
      message,
      ...(parent_id && { parent_id }),
    });
    return res.data;
  } catch (err) {
    return handleApiError(err, 'Posting comment');
  }
};

export const likeComment = async (commentId, sessionId) => {
  try {
    const res = await api.post(`/api/comments/${commentId}/like`, { session_id: sessionId });
    return res.data;
  } catch (err) {
    return handleApiError(err, `Liking comment ID: ${commentId}`);
  }
};

export const unlikeComment = async (commentId, sessionId) => {
  try {
    const res = await api.post(`/api/comments/${commentId}/unlike`, { session_id: sessionId });
    return res.data;
  } catch (err) {
    return handleApiError(err, `Unliking comment ID: ${commentId}`);
  }
};

export const toggleLikeComment = async (commentId, sessionId, isLiked) => {
  return isLiked
    ? await unlikeComment(commentId, sessionId)
    : await likeComment(commentId, sessionId);
};

// ---------- Export Group ----------
export const apiEndpoints = {
  // Articles
  getArticles: fetchArticles,
  getArticle,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
  getFeaturedContent: fetchFeaturedContent,
  getCategoryStats: fetchCategoryStats,
  toggleLikeArticle,
  toggleBookmarkArticle,
  healthCheck,

  // Comments
  getComments: fetchComments,
  postComment,
  likeComment,
  unlikeComment,
  toggleLikeComment,
};

export default apiEndpoints;

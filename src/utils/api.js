// src/utils/api.js

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'https://animac-metaverse.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Interceptors ──────────────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[✅ API ${response.config.method?.toUpperCase()}] ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    console.error(`[❌ API ERROR] ${error?.config?.url || 'Unknown URL'}:`, error?.response?.data || error.message);
    return Promise.reject(error);
  }
);

const handleApiError = (err, context = 'API') => {
  const message = err?.response?.data?.message || err.message || 'Unknown error';
  console.error(`❌ ${context} failed:`, message);
  return null;
};

const safeGet = async (path, context, params = {}) => {
  try {
    const res = await api.get(path, { params });
    return res.data ?? [];
  } catch (err) {
    return handleApiError(err, context);
  }
};

const safePost = async (path, data, context) => {
  try {
    const res = await api.post(path, data);
    return res.data;
  } catch (err) {
    return handleApiError(err, context);
  }
};

const safePatch = async (path, data, context) => {
  try {
    const res = await api.patch(path, data);
    return res.data;
  } catch (err) {
    return handleApiError(err, context);
  }
};

const safeDelete = async (path, context) => {
  try {
    const res = await api.delete(path);
    return res.data;
  } catch (err) {
    return handleApiError(err, context);
  }
};

// ─── Articles ──────────────────────────────────────────────────────────────────

export const fetchArticles = (params = {}) => safeGet('/api/articles', 'Fetching articles', params);

export const getArticle = (id) => id ? safeGet(`/api/articles/by-id/${id}`, `Get article by ID: ${id}`) : null;

export const getArticleBySlug = (slug) => slug ? safeGet(`/api/articles/${slug}`, `Get article by slug: ${slug}`) : null;

export const createArticle = (data) => safePost('/api/articles', data, 'Creating article');

export const updateArticle = (id, data) => id ? safePatch(`/api/articles/${id}`, data, `Updating article ID: ${id}`) : null;

export const deleteArticle = (id) => id ? safeDelete(`/api/articles/${id}`, `Deleting article ID: ${id}`) : null;

export const fetchCategoryStats = () => safeGet('/api/categories/stats', 'Fetching category stats');

export const fetchFeaturedContent = () => safeGet('/api/featured-content', 'Fetching featured content');

export const healthCheck = () => safeGet('/api/health', 'Health check');

// ─── Article Actions ───────────────────────────────────────────────────────────

export const toggleLikeArticle = (articleId, sessionId) =>
  (articleId && sessionId) ? safePost(`/api/articles/${articleId}/like`, { session_id: sessionId }, `Like article ID: ${articleId}`) : null;

export const toggleBookmarkArticle = (articleId, sessionId) =>
  (articleId && sessionId) ? safePost(`/api/articles/${articleId}/bookmark`, { session_id: sessionId }, `Bookmark article ID: ${articleId}`) : null;

// ─── Comments ──────────────────────────────────────────────────────────────────

export const fetchComments = (articleId) =>
  articleId ? safeGet('/api/comments', `Fetch comments for article ID: ${articleId}`, { article_id: articleId }) : [];

export const postComment = ({ article_id, name, message, parent_id = null }) =>
  safePost('/api/comments', { article_id, name, message, ...(parent_id && { parent_id }) }, 'Posting comment');

export const likeComment = (commentId, sessionId) =>
  (commentId && sessionId) ? safePost(`/api/comments/${commentId}/like`, { session_id: sessionId }, `Like comment ID: ${commentId}`) : null;

export const unlikeComment = (commentId, sessionId) =>
  (commentId && sessionId) ? safePost(`/api/comments/${commentId}/unlike`, { session_id: sessionId }, `Unlike comment ID: ${commentId}`) : null;

export const toggleLikeComment = (commentId, sessionId, isLiked) =>
  isLiked ? unlikeComment(commentId, sessionId) : likeComment(commentId, sessionId);

// ─── Watch Tower ───────────────────────────────────────────────────────────────

export const fetchWatchTowerContent = () => safeGet('/api/watch-tower', 'Fetching Watch Tower content');

export const createWatchTowerEntry = (data) => safePost('/api/watch-tower', data, 'Creating Watch Tower entry');

export const deleteWatchTowerEntry = (id) => id ? safeDelete(`/api/watch-tower/${id}`, `Deleting Watch Tower entry ID: ${id}`) : null;

// ─── Grouped Export ────────────────────────────────────────────────────────────

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

  // Watch Tower
  getWatchTower: fetchWatchTowerContent,
  createWatchTower: createWatchTowerEntry,
  deleteWatchTower: deleteWatchTowerEntry,
};

export default apiEndpoints;

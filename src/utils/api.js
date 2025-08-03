// src/utils/api.js

import axios from 'axios';

const API_BASE_URL =
  process.env.REACT_APP_BACKEND_URL || 'https://animac-metaverse.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 70000,
});

// ─── Interceptors ──────────────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[✅ ${response.config.method?.toUpperCase()}] ${response.config.url}`,
        response.data
      );
    }
    return response;
  },
  (error) => {
    console.error(
      `[❌ ERROR] ${error?.config?.url || 'Unknown URL'}:`,
      error?.response?.data || error.message
    );
    return Promise.reject(error);
  }
);

// ─── Helpers ───────────────────────────────────────────────────────────────────
const handleApiError = (err, context = 'API') => {
  const message =
    err?.response?.data?.message ||
    err?.response?.data?.detail ||
    err.message ||
    'Unknown error';
  console.error(`❌ ${context} failed:`, message);
};

const safeRequest = async (method, path, context, data = {}, params = {}) => {
  try {
    const res = await api.request({ method, url: path, data, params });
    return res.data ?? [];
  } catch (err) {
    handleApiError(err, context);
    return { error: true, message: err?.response?.data?.message || err.message || 'Request failed' };
  }
};

// ─── Article APIs ──────────────────────────────────────────────────────────────
export const fetchArticles = (params = {}) =>
  safeRequest('get', '/articles', 'Fetching articles', {}, params);

export const getArticle = (id) =>
  safeRequest('get', `/articles/by-id/${id}`, `Get article by ID: ${id}`);

export const getArticleBySlug = (slug) =>
  safeRequest('get', `/articles/${slug}`, `Get article by slug: ${slug}`);

export const createArticle = (data) =>
  safeRequest('post', '/admin/articles', 'Creating article', data);

export const updateArticle = (id, data) =>
  safeRequest('patch', `/admin/articles/${id}`, `Updating article ID: ${id}`, data);

export const deleteArticle = (id) =>
  safeRequest('delete', `/admin/articles/${id}`, `Deleting article ID: ${id}`);

export const publishArticle = (id) =>
  safeRequest('patch', `/admin/articles/${id}/publish`, `Publishing article ID: ${id}`);

export const unpublishArticle = (id) =>
  safeRequest('patch', `/admin/articles/${id}/unpublish`, `Unpublishing article ID: ${id}`);

// ─── Category APIs ─────────────────────────────────────────────────────────────
export const fetchCategoryStats = () =>
  safeRequest('get', '/categories/stats', 'Fetching category stats');

// ─── Featured / Home Content ───────────────────────────────────────────────────
export const getFeaturedContent = () =>
  safeRequest('get', '/articles/featured', 'Fetching featured content');

// ─── Health ────────────────────────────────────────────────────────────────────
export const healthCheck = () =>
  safeRequest('get', '/health', 'Health check');

// ─── Article Actions ───────────────────────────────────────────────────────────
export const toggleLikeArticle = (articleId, sessionId) =>
  safeRequest('post', `/articles/${articleId}/like`, `Toggle like article ID: ${articleId}`, {
    session_id: sessionId,
  });

export const toggleBookmarkArticle = (articleId, sessionId) =>
  safeRequest(
    'post',
    `/articles/${articleId}/bookmark`,
    `Toggle bookmark article ID: ${articleId}`,
    { session_id: sessionId }
  );

// ─── Comments ──────────────────────────────────────────────────────────────────
export const fetchComments = (articleId) =>
  safeRequest('get', '/comments', `Fetch comments for article ID: ${articleId}`, {}, {
    article_id: articleId,
  });

export const postComment = ({ article_id, name, message, parent_id = null }) =>
  safeRequest('post', '/comments', 'Posting comment', {
    article_id,
    name,
    message,
    ...(parent_id && { parent_id }),
  });

export const likeComment = (commentId, sessionId) =>
  safeRequest('post', `/comments/${commentId}/like`, `Like comment ID: ${commentId}`, {
    session_id: sessionId,
  });

export const unlikeComment = (commentId, sessionId) =>
  safeRequest('post', `/comments/${commentId}/unlike`, `Unlike comment ID: ${commentId}`, {
    session_id: sessionId,
  });

export const toggleLikeComment = (commentId, sessionId, isLiked) =>
  isLiked ? unlikeComment(commentId, sessionId) : likeComment(commentId, sessionId);

// ─── Watch Tower ───────────────────────────────────────────────────────────────
export const fetchWatchTowerContent = () =>
  safeRequest('get', '/watch-tower', 'Fetching Watch Tower content');

export const createWatchTowerEntry = (data) =>
  safeRequest('post', '/watch-tower', 'Creating Watch Tower entry', data);

export const deleteWatchTowerEntry = (id) =>
  safeRequest('delete', `/watch-tower/${id}`, `Deleting Watch Tower entry ID: ${id}`);

// ─── Optional: Export All ──────────────────────────────────────────────────────
export const apiEndpoints = {
  fetchArticles,
  getArticle,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
  publishArticle,
  unpublishArticle,
  fetchCategoryStats,
  getFeaturedContent,
  toggleLikeArticle,
  toggleBookmarkArticle,
  healthCheck,
  fetchComments,
  postComment,
  likeComment,
  unlikeComment,
  toggleLikeComment,
  fetchWatchTowerContent,
  createWatchTowerEntry,
  deleteWatchTowerEntry,
};

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'https://animac-metaverse.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// ─── Interceptors ──────────────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[✅ ${response.config.method?.toUpperCase()}] ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    console.error(`[❌ ERROR] ${error?.config?.url || 'Unknown URL'}:`, error?.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ─── Helpers ───────────────────────────────────────────────────────────────────
const handleApiError = (err, context = 'API') => {
  const message = err?.response?.data?.message || err.message || 'Unknown error';
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

// ─── API Functions ─────────────────────────────────────────────────────────────
const fetchArticles = (params = {}) =>
  safeRequest('get', '/api/articles', 'Fetching articles', {}, params);

const getArticle = (id) =>
  id ? safeRequest('get', `/api/articles/by-id/${id}`, `Get article by ID: ${id}`) : null;

const getArticleBySlug = (slug) =>
  slug ? safeRequest('get', `/api/articles/${slug}`, `Get article by slug: ${slug}`) : null;

const createArticle = (data) =>
  safeRequest('post', '/api/articles', 'Creating article', data);

const updateArticle = (id, data) =>
  id ? safeRequest('patch', `/api/articles/${id}`, `Updating article ID: ${id}`, data) : null;

const deleteArticle = (id) =>
  id ? safeRequest('delete', `/api/articles/${id}`, `Deleting article ID: ${id}`) : null;

const fetchCategoryStats = () =>
  safeRequest('get', '/api/categories/stats', 'Fetching category stats');

const fetchFeaturedContent = () =>
  safeRequest('get', '/api/featured-content', 'Fetching featured content');

const healthCheck = () =>
  safeRequest('get', '/api/health', 'Health check');

const toggleLikeArticle = (articleId, sessionId) =>
  articleId && sessionId
    ? safeRequest('post', `/api/articles/${articleId}/like`, `Toggle like article ID: ${articleId}`, { session_id: sessionId })
    : null;

const toggleBookmarkArticle = (articleId, sessionId) =>
  articleId && sessionId
    ? safeRequest('post', `/api/articles/${articleId}/bookmark`, `Toggle bookmark article ID: ${articleId}`, { session_id: sessionId })
    : null;

// ─── Comments ──────────────────────────────────────────────────────────────────
const fetchComments = (articleId) =>
  articleId ? safeRequest('get', '/api/comments', `Fetch comments for article ID: ${articleId}`, {}, { article_id: articleId }) : [];

const postComment = ({ article_id, name, message, parent_id = null }) =>
  safeRequest('post', '/api/comments', 'Posting comment', {
    article_id,
    name,
    message,
    ...(parent_id && { parent_id }),
  });

const likeComment = (commentId, sessionId) =>
  commentId && sessionId
    ? safeRequest('post', `/api/comments/${commentId}/like`, `Like comment ID: ${commentId}`, { session_id: sessionId })
    : null;

const unlikeComment = (commentId, sessionId) =>
  commentId && sessionId
    ? safeRequest('post', `/api/comments/${commentId}/unlike`, `Unlike comment ID: ${commentId}`, { session_id: sessionId })
    : null;

const toggleLikeComment = (commentId, sessionId, isLiked) =>
  isLiked ? unlikeComment(commentId, sessionId) : likeComment(commentId, sessionId);

// ─── Watch Tower ───────────────────────────────────────────────────────────────
const fetchWatchTowerContent = () =>
  safeRequest('get', '/api/watch-tower', 'Fetching Watch Tower content');

const createWatchTowerEntry = (data) =>
  safeRequest('post', '/api/watch-tower', 'Creating Watch Tower entry', data);

const deleteWatchTowerEntry = (id) =>
  id ? safeRequest('delete', `/api/watch-tower/${id}`, `Deleting Watch Tower entry ID: ${id}`) : null;

// ─── Named Export ──────────────────────────────────────────────────────────────
export const apiEndpoints = {
  fetchArticles,
  getArticle,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
  fetchCategoryStats,
  fetchFeaturedContent,
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

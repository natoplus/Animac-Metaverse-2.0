// services/ArticleService.js
import axios from 'axios';

export const API_URL = 'https://animac-metaverse.onrender.com/api';

// Helper function to DRY up axios POST calls
const postToEndpoint = (endpoint, data) => {
  return axios.post(`${API_URL}${endpoint}`, data);
};

export const likeArticle = (articleId, sessionId) =>
  postToEndpoint(`/articles/${articleId}/like`, { session_id: sessionId });

export const unlikeArticle = (articleId, sessionId) =>
  postToEndpoint(`/articles/${articleId}/unlike`, { session_id: sessionId });

export const bookmarkArticle = (articleId, sessionId) =>
  postToEndpoint(`/articles/${articleId}/bookmark`, { session_id: sessionId });

export const unbookmarkArticle = (articleId, sessionId) =>
  postToEndpoint(`/articles/${articleId}/unbookmark`, { session_id: sessionId });

// ✅ Toggle like logic with error handling
export const toggleArticleLike = async (articleId, sessionId, liked) => {
  try {
    return liked
      ? await unlikeArticle(articleId, sessionId)
      : await likeArticle(articleId, sessionId);
  } catch (err) {
    console.error('Error toggling like:', err.message);
    throw err;
  }
};

// ✅ Toggle bookmark logic with error handling
export const toggleBookmark = async (articleId, sessionId, bookmarked) => {
  try {
    return bookmarked
      ? await unbookmarkArticle(articleId, sessionId)
      : await bookmarkArticle(articleId, sessionId);
  } catch (err) {
    console.error('Error toggling bookmark:', err.message);
    throw err;
  }
};

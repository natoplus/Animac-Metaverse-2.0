// services/articleService.js
import axios from 'axios';

// 🌐 Backend API URL
export const API_URL = 'https://animac-metaverse.onrender.com/api';

// 🔁 Reusable POST helper
const postToEndpoint = async (endpoint, data) => {
  try {
    const response = await axios.post(`${API_URL}${endpoint}`, data);
    return response.data;
  } catch (error) {
    console.error(`❌ Error calling ${endpoint}:`, error.message);
    throw error;
  }
};

// 👍 Like Article
export const likeArticle = async (articleId, sessionId) => {
  return await postToEndpoint(`/articles/${articleId}/like`, {
    session_id: sessionId,
  });
};

// 👎 Unlike Article
export const unlikeArticle = async (articleId, sessionId) => {
  return await postToEndpoint(`/articles/${articleId}/unlike`, {
    session_id: sessionId,
  });
};

// 🔖 Bookmark Article
export const bookmarkArticle = async (articleId, sessionId) => {
  return await postToEndpoint(`/articles/${articleId}/bookmark`, {
    session_id: sessionId,
  });
};

// ❌ Remove Bookmark
export const unbookmarkArticle = async (articleId, sessionId) => {
  return await postToEndpoint(`/articles/${articleId}/unbookmark`, {
    session_id: sessionId,
  });
};

// ✅ Toggle Like (checks `liked` state)
export const toggleLikeArticle = async (articleId, sessionId, liked) => {
  try {
    if (liked) {
      return await unlikeArticle(articleId, sessionId);
    } else {
      return await likeArticle(articleId, sessionId);
    }
  } catch (error) {
    console.error('❌ Error toggling like:', error.message);
    throw error;
  }
};

// ✅ Toggle Bookmark (checks `bookmarked` state)
export const toggleBookmarkArticle = async (articleId, sessionId, bookmarked) => {
  try {
    if (bookmarked) {
      return await unbookmarkArticle(articleId, sessionId);
    } else {
      return await bookmarkArticle(articleId, sessionId);
    }
  } catch (error) {
    console.error('❌ Error toggling bookmark:', error.message);
    throw error;
  }
};

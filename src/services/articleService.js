// services/articleService.js
import axios from 'axios';

// 🌐 Backend API URL
export const API_URL = 'https://animac-metaverse.onrender.com/api';

// 🔁 Reusable POST helper with session header
const postWithSession = async (endpoint, sessionId) => {
  try {
    const response = await axios.post(`${API_URL}${endpoint}`, {}, {
      headers: {
        'x-session-id': sessionId,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`❌ Error calling ${endpoint}:`, error?.response?.data || error.message);
    throw error;
  }
};

// 🔎 GET helper with session header
const getWithSession = async (endpoint, sessionId) => {
  try {
    const response = await axios.get(`${API_URL}${endpoint}`, {
      headers: {
        'x-session-id': sessionId,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`❌ Error calling ${endpoint}:`, error?.response?.data || error.message);
    throw error;
  }
};

// 👍 Like Article
export const likeArticle = async (articleId, sessionId) => {
  return await postWithSession(`/interactions/articles/${articleId}/like`, sessionId);
};

// 👎 Unlike Article
export const unlikeArticle = async (articleId, sessionId) => {
  return await postWithSession(`/interactions/articles/${articleId}/unlike`, sessionId);
};

// 🔖 Bookmark Article
export const bookmarkArticle = async (articleId, sessionId) => {
  return await postWithSession(`/interactions/articles/${articleId}/bookmark`, sessionId);
};

// ❌ Remove Bookmark
export const unbookmarkArticle = async (articleId, sessionId) => {
  return await postWithSession(`/interactions/articles/${articleId}/unbookmark`, sessionId);
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

// 📤 Share Article (count once per session)
export const shareArticle = async (articleId, sessionId) => {
  return await postWithSession(`/interactions/articles/${articleId}/share`, sessionId);
};

// 📊 Get current session status for article
export const getArticleStatus = async (articleId, sessionId) => {
  return await getWithSession(`/interactions/articles/${articleId}/status`, sessionId);
};

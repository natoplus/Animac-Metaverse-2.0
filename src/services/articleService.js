// src/services/articleService.js
import axios from 'axios';

const API_URL = 'https://animac-metaverse.onrender.com/api';

// Like/Unlike Article
export const likeArticle = async (articleId, sessionId) => {
  return axios.post(`${API_URL}/articles/${articleId}/like`, { session_id: sessionId });
};

export const unlikeArticle = async (articleId, sessionId) => {
  return axios.post(`${API_URL}/articles/${articleId}/unlike`, { session_id: sessionId });
};

// Bookmark/Unbookmark Article
export const bookmarkArticle = async (articleId, sessionId) => {
  return axios.post(`${API_URL}/articles/${articleId}/bookmark`, { session_id: sessionId });
};

export const unbookmarkArticle = async (articleId, sessionId) => {
  return axios.post(`${API_URL}/articles/${articleId}/unbookmark`, { session_id: sessionId });
};

// Get like/bookmark status (optional helper if backend supports it)
export const fetchArticleStatus = async (articleId, sessionId) => {
  return axios.get(`${API_URL}/articles/${articleId}/status`, {
    params: { session_id: sessionId }
  });
};

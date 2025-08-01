import axios from 'axios';

const API_URL = 'https://animac-metaverse.onrender.com/api';

export const likeArticle = (articleId, sessionId) =>
  axios.post(`${API_URL}/articles/${articleId}/like`, {
    session_id: sessionId,
  });

export const unlikeArticle = (articleId, sessionId) =>
  axios.post(`${API_URL}/articles/${articleId}/unlike`, {
    session_id: sessionId,
  });

export const bookmarkArticle = (articleId, sessionId) =>
  axios.post(`${API_URL}/articles/${articleId}/bookmark`, {
    session_id: sessionId,
  });

export const unbookmarkArticle = (articleId, sessionId) =>
  axios.post(`${API_URL}/articles/${articleId}/unbookmark`, {
    session_id: sessionId,
  });

// ✅ Toggle like logic
export const toggleArticleLike = async (articleId, sessionId, liked) => {
  if (liked) {
    return unlikeArticle(articleId, sessionId);
  } else {
    return likeArticle(articleId, sessionId);
  }
};

// ✅ Toggle bookmark logic
export const toggleBookmark = async (articleId, sessionId, bookmarked) => {
  if (bookmarked) {
    return unbookmarkArticle(articleId, sessionId);
  } else {
    return bookmarkArticle(articleId, sessionId);
  }
};

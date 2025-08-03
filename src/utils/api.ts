// src/utils/api.ts

// ---------- Config ----------
const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const DEBUG_MODE = process.env.NODE_ENV === "development";

if (!API_BASE) {
  throw new Error("❌ Environment variable NEXT_PUBLIC_API_URL is not defined.");
}

// ---------- Types ----------
export type Article = {
  id: string;
  title: string;
  content?: string | null;
  author?: string;
  category?: string;
  tags?: string[];
  excerpt?: string;
  featured_image?: string;
  is_published?: boolean;
  region?: string;
  created_at?: string;
};

export type Comment = {
  id: string;
  article_id: string;
  name: string;
  message: string;
  created_at: string;
  parent_id?: string | null;
  replies?: Comment[];
  score?: number;
};

// ---------- Helper: Unified Fetch ----------
async function fetchFromAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const fullUrl = `${API_BASE}${endpoint}`;
  const res = await fetch(fullUrl, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (DEBUG_MODE) {
    console.log(`[API] ${options.method || "GET"} ${fullUrl}`, options.body || "");
  }

  if (!res.ok) {
    const errorText = await res.text();
    if (DEBUG_MODE) {
      console.error(`❌ API Error: ${res.status} ${res.statusText}`, errorText);
    }
    throw new Error(`API error at ${endpoint}: ${res.status} ${errorText}`);
  }

  return res.json();
}

// ---------- Articles ----------
export async function fetchArticles(
  category?: string,
  region?: string,
  tag?: string,
  page = 1,
  limit = 10,
  search?: string
): Promise<Article[]> {
  const params = new URLSearchParams();
  if (category) params.append("category", category);
  if (region) params.append("region", region);
  if (tag) params.append("tag", tag);
  if (search) params.append("search", search);
  params.append("page", String(page));
  params.append("limit", String(limit));

  return fetchFromAPI<Article[]>(`/api/articles?${params}`);
}

export async function fetchArticleById(id: string): Promise<Article> {
  return fetchFromAPI<Article>(`/api/articles/by-id/${id}`);
}

export async function createArticle(article: Partial<Article>, token?: string): Promise<Article> {
  return fetchFromAPI<Article>("/api/articles", {
    method: "POST",
    body: JSON.stringify(article),
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
}

export async function updateArticle(id: string, article: Partial<Article>, token?: string): Promise<Article> {
  return fetchFromAPI<Article>(`/api/articles/${id}`, {
    method: "PUT",
    body: JSON.stringify(article),
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
}

export async function deleteArticle(id: string, token?: string): Promise<{ success: boolean }> {
  return fetchFromAPI<{ success: boolean }>(`/api/articles/${id}`, {
    method: "DELETE",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
}

export async function fetchFeaturedContent(): Promise<any> {
  return fetchFromAPI("/api/featured-content");
}

export async function healthCheck(): Promise<{ status: string }> {
  return fetchFromAPI<{ status: string }>("/api/health");
}

// ---------- Comments ----------
export async function fetchComments(articleId: string): Promise<Comment[]> {
  return fetchFromAPI<Comment[]>(`/api/comments?article_id=${articleId}`);
}

export async function postComment(data: {
  article_id: string;
  name: string;
  message: string;
  parent_id?: string;
}): Promise<Comment> {
  return fetchFromAPI<Comment>("/api/comments", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function fetchCommentThread(commentId: string): Promise<Comment[]> {
  return fetchFromAPI<Comment[]>(`/api/comments/thread/${commentId}`);
}

// ---------- Votes ----------
export async function upvoteComment(commentId: string, session_id: string): Promise<{ success: boolean }> {
  return fetchFromAPI<{ success: boolean }>(`/api/comments/${commentId}/upvote`, {
    method: "POST",
    headers: { "X-Session-ID": session_id },
  });
}

export async function downvoteComment(commentId: string, session_id: string): Promise<{ success: boolean }> {
  return fetchFromAPI<{ success: boolean }>(`/api/comments/${commentId}/downvote`, {
    method: "POST",
    headers: { "X-Session-ID": session_id },
  });
}

export async function unvoteComment(commentId: string, session_id: string): Promise<{ success: boolean }> {
  return fetchFromAPI<{ success: boolean }>(`/api/comments/${commentId}/unvote`, {
    method: "POST",
    headers: { "X-Session-ID": session_id },
  });
}

export async function toggleVoteComment(
  commentId: string,
  session_id: string,
  direction: "up" | "down",
  currentState: "up" | "down" | null
): Promise<{ success: boolean }> {
  if (currentState === direction) {
    return unvoteComment(commentId, session_id);
  } else if (direction === "up") {
    return upvoteComment(commentId, session_id);
  } else {
    return downvoteComment(commentId, session_id);
  }
}

// ---------- Bookmarks ----------
export async function bookmarkArticle(articleId: string, session_id: string): Promise<{ success: boolean }> {
  return fetchFromAPI<{ success: boolean }>(`/api/articles/${articleId}/bookmark`, {
    method: "POST",
    body: JSON.stringify({ session_id }),
  });
}

export async function unbookmarkArticle(articleId: string, session_id: string): Promise<{ success: boolean }> {
  return fetchFromAPI<{ success: boolean }>(`/api/articles/${articleId}/unbookmark`, {
    method: "POST",
    body: JSON.stringify({ session_id }),
  });
}

export async function toggleBookmarkArticle(
  articleId: string,
  session_id: string,
  isBookmarked: boolean
): Promise<{ success: boolean }> {
  return isBookmarked
    ? unbookmarkArticle(articleId, session_id)
    : bookmarkArticle(articleId, session_id);
}

export async function bookmarkComment(commentId: string, session_id: string): Promise<{ success: boolean }> {
  return fetchFromAPI<{ success: boolean }>(`/api/comments/${commentId}/bookmark`, {
    method: "POST",
    headers: { "X-Session-ID": session_id },
  });
}

export async function unbookmarkComment(commentId: string, session_id: string): Promise<{ success: boolean }> {
  return fetchFromAPI<{ success: boolean }>(`/api/comments/${commentId}/unbookmark`, {
    method: "POST",
    headers: { "X-Session-ID": session_id },
  });
}

export async function toggleBookmarkComment(
  commentId: string,
  session_id: string,
  isBookmarked: boolean
): Promise<{ success: boolean }> {
  return isBookmarked
    ? unbookmarkComment(commentId, session_id)
    : bookmarkComment(commentId, session_id);
}

// ---------- Exports ----------
export const apiEndpoints = {
  getArticles: fetchArticles,
  getArticleById: fetchArticleById,
  getFeaturedContent: fetchFeaturedContent,
  createArticle,
  updateArticle,
  deleteArticle,
  bookmarkArticle,
  unbookmarkArticle,
  toggleBookmarkArticle,
  healthCheck,
  getComments: fetchComments,
  postComment,
  fetchCommentThread,
  upvoteComment,
  downvoteComment,
  unvoteComment,
  toggleVoteComment,
  bookmarkComment,
  unbookmarkComment,
  toggleBookmarkComment,
};

// ✅ Add missing named exports
export {
  fetchArticles as getArticles,
  fetchArticleById as getArticle,
  fetchFeaturedContent as getFeaturedContent,
};

export const api = {
  ...apiEndpoints,
  endpoints: apiEndpoints,
};
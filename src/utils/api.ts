// src/utils/api.ts

// ---------- Config ----------
const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const DEBUG_MODE = process.env.NODE_ENV === "development";

if (!API_BASE) {
  throw new Error("Environment variable NEXT_PUBLIC_API_URL is not defined.");
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

export type FeaturedContent = {
  east: Article;
  west: Article;
};

// ---------- Helper: Unified Fetch ----------
async function fetchFromAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const fullUrl = `${API_BASE}${endpoint}`;
  const res = await fetch(fullUrl, {
    headers: {
      'Content-Type': 'application/json',
      // Optional token if needed:
      // 'Authorization': `Bearer ${token}`
    },
    ...options,
  });

  if (DEBUG_MODE) {
    console.log(`[API] ${options?.method || 'GET'} ${fullUrl}`, options?.body || '');
  }

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API error at ${endpoint}: ${res.status} ${errorText}`);
  }

  return res.json();
}

// ---------- CRUD Operations ----------

// Fetch multiple articles with filters
export async function fetchArticles(
  category?: string,
  region?: string,
  tag?: string,
  page: number = 1,
  limit: number = 10
): Promise<Article[]> {
  const params = new URLSearchParams();

  if (category) params.append("category", category);
  if (region) params.append("region", region);
  if (tag) params.append("tag", tag);
  params.append("page", String(page));
  params.append("limit", String(limit));

  const query = params.toString();
  return fetchFromAPI<Article[]>(`/api/articles?${query}`);
}

// Fetch single article by ID
export async function fetchArticleById(id: string): Promise<Article> {
  return fetchFromAPI<Article>(`/api/articles/${id}`);
}

// Create new article
export async function createArticle(article: Partial<Article>): Promise<Article> {
  return fetchFromAPI<Article>("/api/articles", {
    method: "POST",
    body: JSON.stringify(article),
  });
}

// Update existing article
export async function updateArticle(id: string, article: Partial<Article>): Promise<Article> {
  return fetchFromAPI<Article>(`/api/articles/${id}`, {
    method: "PATCH",
    body: JSON.stringify(article),
  });
}

// Delete article
export async function deleteArticle(id: string): Promise<{ success: boolean }> {
  return fetchFromAPI<{ success: boolean }>(`/api/articles/${id}`, {
    method: "DELETE",
  });
}

// Fetch featured east/west articles
export async function fetchFeaturedContent(): Promise<FeaturedContent> {
  return fetchFromAPI<FeaturedContent>("/api/featured-content");
}

// Health check
export async function healthCheck(): Promise<{ status: string }> {
  return fetchFromAPI<{ status: string }>("/api/health");
}

// ---------- Consolidated API Endpoints ----------
export const apiEndpoints = {
  getArticles: async (params: Record<string, any>) => {
    const { category, region, tag, page = 1, limit = 10, featured } = params;
    const searchParams = new URLSearchParams();

    if (category) searchParams.append("category", category);
    if (region) searchParams.append("region", region);
    if (tag) searchParams.append("tag", tag);
    if (featured !== undefined) searchParams.append("featured", String(featured));
    searchParams.append("page", page.toString());
    searchParams.append("limit", limit.toString());

    const query = searchParams.toString();
    return fetchFromAPI<Article[]>(`/api/articles?${query}`);
  },

  getArticle: fetchArticleById,
  getArticleById: fetchArticleById,
  getFeaturedContent: fetchFeaturedContent,
  createArticle,
  updateArticle,
  deleteArticle,
  healthCheck,
};

// Optional global API object (for external usage)
export const api = {
  fetchArticles,
  fetchArticleById,
  fetchFeaturedContent,
  createArticle,
  updateArticle,
  deleteArticle,
  healthCheck,
  endpoints: apiEndpoints,
};

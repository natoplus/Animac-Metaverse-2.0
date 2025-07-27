// utils/api.ts

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
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
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API error at ${endpoint}: ${res.status} ${errorText}`);
  }

  return res.json();
}

// ---------- Fetch Articles ----------
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
  params.append("page", page.toString());
  params.append("limit", limit.toString());

  const query = params.toString();
  return fetchFromAPI<Article[]>(`/api/articles?${query}`);
}

// ---------- Fetch Single Article ----------
export async function fetchArticleById(id: string): Promise<Article> {
  return fetchFromAPI<Article>(`/api/articles/${id}`);
}

// ---------- Fetch Featured Content ----------
export async function fetchFeaturedContent(): Promise<FeaturedContent> {
  return fetchFromAPI<FeaturedContent>(`/api/featured-content`);
}

// ---------- Create Article (Optional) ----------
export async function createArticle(article: Partial<Article>): Promise<Article> {
  return fetchFromAPI<Article>("/api/articles", {
    method: "POST",
    body: JSON.stringify(article),
  });
}

// ---------- Health Check ----------
export async function healthCheck(): Promise<{ status: string }> {
  return fetchFromAPI<{ status: string }>(`/api/health`);
}

export const apiEndpoints = {
  getArticles: async (params: Record<string, any>) => {
    const { category, region, tag, page = 1, limit = 10, featured } = params;
    const searchParams = new URLSearchParams();

    if (category) searchParams.append('category', category);
    if (region) searchParams.append('region', region);
    if (tag) searchParams.append('tag', tag);
    if (featured !== undefined) searchParams.append('featured', String(featured));
    searchParams.append('page', page.toString());
    searchParams.append('limit', limit.toString());

    const query = searchParams.toString();
    return await fetchFromAPI<Article[]>(`/api/articles?${query}`);
  },

  getFeaturedContent: fetchFeaturedContent,
  getArticleById: fetchArticleById,
  createArticle: createArticle,
};

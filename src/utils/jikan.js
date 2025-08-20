// utils/jikan.js

const JIKAN_BASE = "https://api.jikan.moe/v4";

// Simple in-memory cache (avoids hammering Jikan -> 429 errors)
const cache = new Map();

async function jikanFetch(endpoint) {
  const key = endpoint;
  const cached = cache.get(key);

  if (cached && cached.expiry > Date.now()) {
    return cached.data;
  }

  const res = await fetch(`${JIKAN_BASE}/${endpoint}`);
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText} for ${endpoint}`);
  }

  const data = await res.json();

  // Cache for 5 minutes
  cache.set(key, {
    data,
    expiry: Date.now() + 1000 * 60 * 5,
  });

  return data;
}

// Map Jikan anime -> unified format
function mapJikanAnime(a) {
  const title = a.title_english || a.title || "Untitled";
  const youtubeId = a.trailer?.youtube_id;
  const trailerUrl = youtubeId
    ? `https://www.youtube.com/watch?v=${youtubeId}`
    : a.trailer?.url || null;

  return {
    id: `east-jikan-${a.mal_id}`,
    title,
    year: a.year || a.aired?.prop?.from?.year || "—",
    rating: typeof a.score === "number" ? +a.score.toFixed(1) : 0,
    poster:
      a.images?.jpg?.large_image_url ||
      a.images?.jpg?.image_url ||
      sample(PLACEHOLDER.posters),
    backdrop:
      a.trailer?.images?.maximum_image_url ||
      sample(PLACEHOLDER.backdrops),
    type: "anime",
    region: "east",
    synopsis: a.synopsis || "",
    trailerUrl,
    _meta: { source: "jikan", malId: a.mal_id },
  };
}

// Fetchers
export async function fetchJikanTrending() {
  const json = await jikanFetch("top/anime?limit=20");
  return (json?.data || []).map(mapJikanAnime);
}

export async function fetchJikanUpcoming() {
  const json = await jikanFetch("seasons/upcoming?limit=24");
  return (json?.data || []).map(mapJikanAnime);
}

export async function fetchJikanTop() {
  const json = await jikanFetch("top/anime?limit=24");
  return (json?.data || []).map(mapJikanAnime);
}

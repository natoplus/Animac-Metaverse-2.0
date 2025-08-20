// -----------------------------------------------------------------------------
// Centralized API fetchers with retries
// -----------------------------------------------------------------------------

const TMDB_KEY = process.env.REACT_APP_TMDB_KEY;
const TRAKT_KEY = process.env.REACT_APP_TRAKT_KEY;

if (!TMDB_KEY) console.warn("[WatchTower] Missing REACT_APP_TMDB_KEY");
if (!TRAKT_KEY) console.warn("[WatchTower] Missing REACT_APP_TRAKT_KEY");

// Retry helper (exponential backoff)
async function fetchWithRetry(url, options, retries = 3, delay = 500) {
  try {
    const res = await fetch(url, options);

    if (!res.ok) {
      if ((res.status === 429 || res.status >= 500) && retries > 0) {
        console.warn(`[ProxyFetch] Retry ${3 - retries + 1} for ${url}`);
        await new Promise((r) => setTimeout(r, delay));
        return fetchWithRetry(url, options, retries - 1, delay * 2);
      }

      const text = await res.text();
      throw new Error(`ProxyFetch ${res.status} ${res.statusText}: ${text}`);
    }

    return res.json();
  } catch (err) {
    if (retries > 0) {
      console.warn(`[ProxyFetch] Network error, retrying... (${3 - retries + 1})`);
      await new Promise((r) => setTimeout(r, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }
    console.error("[WatchTower] Fetch error:", err);
    throw err;
  }
}

// Generic proxy fetch (used for TMDB/Trakt only)
async function proxyFetch(path, { method = "GET", headers = {}, body, query } = {}) {
  const url = new URL(`/api${path}`, window.location.origin);

  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, v);
    });
  }

  const options = {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  };

  return fetchWithRetry(url.toString(), options);
}

// ---------------- TMDB via Proxy ----------------
export function fetchTMDB(endpoint, query = {}) {
  return proxyFetch(`/tmdb${endpoint}`, {
    query: { api_key: TMDB_KEY, language: "en-US", ...query },
  });
}

// ---------------- Trakt via Proxy ----------------
export function fetchTrakt(endpoint, query = {}) {
  return proxyFetch(`/trakt${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      "trakt-api-key": TRAKT_KEY,
      "trakt-api-version": "2",
    },
    query,
  });
}

// ---------------- AniList (Direct API) ----------------
export async function fetchAniList(query, variables = {}) {
  return fetchWithRetry("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables }),
  });
}

// ---------------- Jikan (Direct API) ----------------
export async function fetchJikan(endpoint, query = {}) {
  const url = new URL(`https://api.jikan.moe/v4${endpoint}`);
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, v);
  });

  return fetchWithRetry(url.toString(), { method: "GET" });
}

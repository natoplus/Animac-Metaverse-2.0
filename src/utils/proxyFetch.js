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
  const queryString = new URLSearchParams({
    language: "en-US",
    ...query
  }).toString();
  
  const fullPath = queryString ? `${endpoint}?${queryString}` : endpoint;
  return proxyFetch(`/api/proxy/tmdb/${fullPath}`, {});
}

// ---------------- Trakt via Proxy ----------------
export function fetchTrakt(endpoint, query = {}) {
  const queryString = Object.entries(query)
    .filter(([k, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');
  
  const fullPath = queryString ? `${endpoint}?${queryString}` : endpoint;
  return proxyFetch(`/api/proxy/trakt/${fullPath}`, {});
}

// ---------------- AniList (Via Proxy) ----------------
export async function fetchAniList(query, variables = {}) {
  const params = new URLSearchParams({
    query: query,
    variables: JSON.stringify(variables)
  });
  
  return fetchWithRetry(`/api/proxy/anilist?${params}`, {
    method: "GET",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
  });
}

// ---------------- Jikan (Via Proxy) ----------------
export async function fetchJikan(endpoint, query = {}) {
  const queryString = Object.entries(query)
    .filter(([k, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');
  
  const fullPath = queryString ? `${endpoint}?${queryString}` : endpoint;
  
  return fetchWithRetry(`/api/proxy/jikan/${fullPath}`, { method: "GET" });
}

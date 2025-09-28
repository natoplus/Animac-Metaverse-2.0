// API Proxy utilities to avoid CORS issues
// These functions call our backend proxy endpoints instead of external APIs directly

const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://animac-metaverse.onrender.com';

// AniList GraphQL proxy
export async function anilistQuery(query, variables = {}) {
  const params = new URLSearchParams({
    query: query,
    variables: JSON.stringify(variables)
  });
  
  const response = await fetch(`${API_URL}/api/proxy/anilist?${params}`);
  if (!response.ok) {
    throw new Error(`AniList proxy error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  if (data.errors) {
    throw new Error('AniList GraphQL error: ' + JSON.stringify(data.errors));
  }
  return data.data;
}

// Jikan API proxy
export async function jikanRequest(path) {
  const response = await fetch(`${API_URL}/api/proxy/jikan/${path}`);
  if (!response.ok) {
    throw new Error(`Jikan proxy error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

// TMDB API proxy
export async function tmdbRequest(path) {
  const response = await fetch(`${API_URL}/api/proxy/tmdb/${path}`);
  if (!response.ok) {
    throw new Error(`TMDB proxy error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

// Trakt API proxy
export async function traktRequest(path) {
  const response = await fetch(`${API_URL}/api/proxy/trakt/${path}`);
  if (!response.ok) {
    throw new Error(`Trakt proxy error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

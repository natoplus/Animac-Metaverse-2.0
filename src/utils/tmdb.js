// utils/tmdb.js
import { fetchTMDB } from "./proxyFetch";

function mapTMDB(item, type = "movie") {
  const title = item.title || item.name || "Untitled";

  return {
    id: `west-tmdb-${item.id}`,
    title,
    year: item.release_date?.slice(0, 4) || item.first_air_date?.slice(0, 4) || "—",
    rating: typeof item.vote_average === "number" ? +item.vote_average.toFixed(1) : 0,
    poster:
      item.poster_path
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
        : sample(PLACEHOLDER.posters),
    backdrop:
      item.backdrop_path
        ? `https://image.tmdb.org/t/p/original${item.backdrop_path}`
        : sample(PLACEHOLDER.backdrops),
    type,
    region: "west",
    synopsis: item.overview || "",
    trailerUrl: null, // could fetch /videos for trailers if needed
    _meta: { source: "tmdb", tmdbId: item.id },
  };
}

// ---------------- Fetchers ----------------
export async function fetchTMDBTrending() {
  const json = await fetchTMDB(`/trending/all/day`);
  return (json?.results || []).map((m) => mapTMDB(m, m.media_type));
}

export async function fetchTMDBUpcoming() {
  const json = await fetchTMDB(`/movie/upcoming`, { page: 1 });
  return (json?.results || []).map((m) => mapTMDB(m, "movie"));
}

export async function fetchTMDBTop() {
  const json = await fetchTMDB(`/movie/top_rated`, { page: 1 });
  return (json?.results || []).map((m) => mapTMDB(m, "movie"));
}

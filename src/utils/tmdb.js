// utils/tmdb.js
import { fetchTMDB } from "./proxyFetch";

function mapTMDBItem(r) {
  const isMovie = r.media_type ? r.media_type === "movie" : !!r.title;
  const type = isMovie ? "movie" : "tv";
  const id = r.id;

  return {
    id: `west-tmdb-${type}-${id}`,
    title: r.title || r.name || "Untitled",
    year: (r.release_date || r.first_air_date || "").slice(0, 4) || "—",
    rating: typeof r.vote_average === "number" ? +r.vote_average.toFixed(1) : 0,
    poster: r.poster_path
      ? `https://image.tmdb.org/t/p/w500${r.poster_path}`
      : null,
    backdrop: r.backdrop_path
      ? `https://image.tmdb.org/t/p/w780${r.backdrop_path}`
      : null,
    type,
    region: "west",
    synopsis: r.overview || "",
    _meta: { source: "tmdb", tmdbId: id, tmdbType: type },
  };
}

// ---------------- Fetchers ----------------
export async function fetchTMDBTrending() {
  const json = await fetchTMDB("/trending/all/day");
  return (json?.results || []).map(mapTMDBItem);
}

export async function fetchTMDBUpcoming() {
  const [movies, tv] = await Promise.all([
    fetchTMDB("/movie/upcoming", { page: "1" }),
    fetchTMDB("/tv/on_the_air", { page: "1" }),
  ]);
  return [...(movies?.results || []), ...(tv?.results || [])].map(mapTMDBItem);
}

export async function fetchTMDBTopRated() {
  const [movies, tv] = await Promise.all([
    fetchTMDB("/movie/top_rated", { page: "1" }),
    fetchTMDB("/tv/top_rated", { page: "1" }),
  ]);
  return [...(movies?.results || []), ...(tv?.results || [])].map(mapTMDBItem);
}

export async function fetchTMDBRecommended() {
  // TMDB doesn’t expose a global recommended list, so fallback to "popular"
  const [movies, tv] = await Promise.all([
    fetchTMDB("/movie/popular", { page: "1" }),
    fetchTMDB("/tv/popular", { page: "1" }),
  ]);
  return [...(movies?.results || []), ...(tv?.results || [])].map(mapTMDBItem);
}

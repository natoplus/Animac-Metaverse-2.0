// utils/trakt.js
import { fetchTrakt } from "./proxyFetch";

function mapTraktMovie(item) {
  const m = item.movie || item;
  return {
    id: `west-trakt-movie-${m?.ids?.trakt}`,
    title: m?.title || "Untitled",
    year: m?.year || "—",
    rating: typeof m?.rating === "number" ? +m.rating.toFixed(1) : 0,
    type: "movie",
    region: "west",
    trailerUrl: m?.trailer || null,
    _meta: { source: "trakt", traktId: m?.ids?.trakt },
  };
}

function mapTraktShow(item) {
  const s = item.show || item;
  return {
    id: `west-trakt-show-${s?.ids?.trakt}`,
    title: s?.title || "Untitled",
    year: s?.year || "—",
    rating: typeof s?.rating === "number" ? +s.rating.toFixed(1) : 0,
    type: "tv",
    region: "west",
    trailerUrl: s?.trailer || null,
    _meta: { source: "trakt", traktId: s?.ids?.trakt },
  };
}

// ---------------- Fetchers ----------------
export async function fetchTraktTrending() {
  const [movies, shows] = await Promise.all([
    fetchTrakt("/movies/trending", { page: "1", limit: "20", extended: "full" }),
    fetchTrakt("/shows/trending", { page: "1", limit: "20", extended: "full" }),
  ]);
  return [...movies.map(mapTraktMovie), ...shows.map(mapTraktShow)];
}

export async function fetchTraktUpcoming() {
  // Trakt doesn’t have a strict "upcoming" endpoint, so fallback to anticipated
  const [movies, shows] = await Promise.all([
    fetchTrakt("/movies/anticipated", { page: "1", limit: "20" }),
    fetchTrakt("/shows/anticipated", { page: "1", limit: "20" }),
  ]);
  return [...movies.map(mapTraktMovie), ...shows.map(mapTraktShow)];
}

export async function fetchTraktTopRated() {
  const [movies, shows] = await Promise.all([
    fetchTrakt("/movies/top-rated", { page: "1", limit: "20" }),
    fetchTrakt("/shows/top-rated", { page: "1", limit: "20" }),
  ]);
  return [...movies.map(mapTraktMovie), ...shows.map(mapTraktShow)];
}

export async function fetchTraktRecommended() {
  // Fallback to "popular" since Trakt does not have a global recommended
  const [movies, shows] = await Promise.all([
    fetchTrakt("/movies/popular", { page: "1", limit: "20" }),
    fetchTrakt("/shows/popular", { page: "1", limit: "20" }),
  ]);
  return [...movies.map(mapTraktMovie), ...shows.map(mapTraktShow)];
}

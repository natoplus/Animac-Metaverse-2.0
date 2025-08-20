// utils/trakt.js
import { fetchTrakt } from "./proxyFetch";
import { sample, PLACEHOLDER } from "./placeholders";

function mapTraktMovie(item) {
  const m = item.movie || item;
  return {
    id: `west-trakt-movie-${m?.ids?.trakt}`,
    title: m?.title || "Untitled",
    year: m?.year || "—",
    rating: typeof m?.rating === "number" ? +m.rating.toFixed(1) : 0,
    poster: sample(PLACEHOLDER.posters),
    backdrop: sample(PLACEHOLDER.backdrops),
    type: "movie",
    region: "west",
    synopsis: m?.overview || "",
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
    poster: sample(PLACEHOLDER.posters),
    backdrop: sample(PLACEHOLDER.backdrops),
    type: "tv",
    region: "west",
    synopsis: s?.overview || "",
    trailerUrl: s?.trailer || null,
    _meta: { source: "trakt", traktId: s?.ids?.trakt },
  };
}

export async function fetchTraktTrending() {
  const [movies, shows] = await Promise.all([
    fetchTrakt("/movies/trending", { page: "1", limit: "20", extended: "full" }),
    fetchTrakt("/shows/trending", { page: "1", limit: "20", extended: "full" }),
  ]);
  return [...movies.map(mapTraktMovie), ...shows.map(mapTraktShow)];
}

// Trakt doesn’t have a real "upcoming" endpoint
export async function fetchTraktUpcoming() {
  return [];
}

export async function fetchTraktTopRated() {
  const [movies, shows] = await Promise.all([
    fetchTrakt("/movies/popular", { page: "1", limit: "20", extended: "full" }),
    fetchTrakt("/shows/popular", { page: "1", limit: "20", extended: "full" }),
  ]);
  return [...movies.map(mapTraktMovie), ...shows.map(mapTraktShow)];
}

// requires auth, so placeholder
export async function fetchTraktRecommended() {
  return [];
}
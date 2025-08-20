// utils/jikan.js
import { fetchJikan } from "./proxyFetch";
import { sample, PLACEHOLDER } from "./placeholders";

function mapJikanAnime(a) {
  const title = a.title_english || a.title || "Untitled";
  const youtubeId = a.trailer?.youtube_id;

  return {
    id: `east-jikan-${a.mal_id}`,
    title,
    year: a.year || a.aired?.prop?.from?.year || "—",
    rating: typeof a.score === "number" ? +a.score.toFixed(1) : 0,
    poster: a.images?.jpg?.large_image_url || a.images?.jpg?.image_url || sample(PLACEHOLDER.posters),
    backdrop: a.trailer?.images?.maximum_image_url || sample(PLACEHOLDER.backdrops),
    type: "anime",
    region: "east",
    synopsis: a.synopsis || "",
    trailerUrl: youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : a.trailer?.url || null,
    _meta: { source: "jikan", malId: a.mal_id },
  };
}

export async function fetchJikanTrending() {
  const json = await fetchJikan(`/top/anime`, { limit: 20 });
  return (json?.data || []).map(mapJikanAnime);
}

export async function fetchJikanUpcoming() {
  const json = await fetchJikan(`/seasons/upcoming`, { limit: 24 });
  return (json?.data || []).map(mapJikanAnime);
}

export async function fetchJikanTopRated() {
  const json = await fetchJikan(`/top/anime`, { limit: 24 });
  return (json?.data || []).map(mapJikanAnime);
}

// placeholder (Jikan has no global recommendations API)
export async function fetchJikanRecommended() {
  return [];
}
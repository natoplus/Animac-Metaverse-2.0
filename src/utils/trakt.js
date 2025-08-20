// utils/trakt.js
import { fetchTrakt } from "./proxyFetch";

function mapTrakt(item, type = "movie") {
  const data = item[type];
  if (!data) return null;

  const title = data.title || "Untitled";

  return {
    id: `west-trakt-${data.ids.trakt}`,
    title,
    year: data.year || "—",
    rating: typeof data.rating === "number" ? +data.rating.toFixed(1) : 0,
    poster: sample(PLACEHOLDER.posters), // trakt requires extra calls for images
    backdrop: sample(PLACEHOLDER.backdrops),
    type,
    region: "west",
    synopsis: data.overview || "",
    trailerUrl: data.trailer || null,
    _meta: { source: "trakt", traktId: data.ids.trakt, slug: data.ids.slug },
  };
}

// ---------------- Fetchers ----------------
export async function fetchTraktTrending() {
  const json = await fetchTrakt(`/trending/movies`, { page: 1 });
  return (json || []).map((m) => mapTrakt(m, "movie")).filter(Boolean);
}

export async function fetchTraktUpcoming() {
  // trakt doesn’t have "upcoming" directly; using anticipated as proxy
  const json = await fetchTrakt(`/movies/anticipated`, { page: 1 });
  return (json || []).map((m) => mapTrakt(m, "movie")).filter(Boolean);
}

export async function fetchTraktTop() {
  const json = await fetchTrakt(`/movies/popular`, { page: 1 });
  return (json || []).map((m) => mapTrakt(m, "movie")).filter(Boolean);
}

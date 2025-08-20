// utils/anilist.js
import { fetchAniList } from "./proxyFetch";

const anilistCache = new Map();

// Wrapper for AniList queries with caching
async function anilistQuery(query, variables = {}) {
  const cacheKey = JSON.stringify({ query, variables });
  if (anilistCache.has(cacheKey)) {
    return anilistCache.get(cacheKey);
  }

  const json = await fetchAniList(query, variables);

  if (json.errors) throw new Error("AniList GraphQL error");

  anilistCache.set(cacheKey, json.data);
  return json.data;
}

// ---------------- GraphQL Queries ----------------
const GQL_TRENDING = `
query ($page:Int,$perPage:Int){
  Page(page:$page, perPage:$perPage){
    media(type:ANIME, sort:TRENDING_DESC){
      id
      title{ romaji english }
      averageScore
      startDate{ year }
      format
      description(asHtml:false)
      coverImage{ extraLarge large }
      bannerImage
      trailer{ id site thumbnail }
    }
  }
}`;

const GQL_TOP = `
query ($page:Int,$perPage:Int){
  Page(page:$page, perPage:$perPage){
    media(type:ANIME, sort:SCORE_DESC){
      id
      title{ romaji english }
      averageScore
      startDate{ year }
      format
      description(asHtml:false)
      coverImage{ extraLarge large }
      bannerImage
      trailer{ id site thumbnail }
    }
  }
}`;

const GQL_UPCOMING = `
query ($page:Int,$perPage:Int){
  Page(page:$page, perPage:$perPage){
    media(type:ANIME, sort:START_DATE, status_not_in:[FINISHED, CANCELLED]){
      id
      title{ romaji english }
      averageScore
      startDate{ year }
      format
      description(asHtml:false)
      coverImage{ extraLarge large }
      bannerImage
      trailer{ id site thumbnail }
    }
  }
}`;

// Recommended = use "POPULARITY_DESC" as proxy
const GQL_RECOMMENDED = `
query ($page:Int,$perPage:Int){
  Page(page:$page, perPage:$perPage){
    media(type:ANIME, sort:POPULARITY_DESC){
      id
      title{ romaji english }
      averageScore
      startDate{ year }
      format
      description(asHtml:false)
      coverImage{ extraLarge large }
      bannerImage
      trailer{ id site thumbnail }
    }
  }
}`;

// ---------------- Mapper ----------------
function mapAniListMedia(m) {
  const title = m.title?.english || m.title?.romaji || "Untitled";
  const trailerUrl =
    m.trailer?.site?.toLowerCase() === "youtube" && m.trailer?.id
      ? `https://www.youtube.com/watch?v=${m.trailer.id}`
      : null;

  return {
    id: `east-anilist-${m.id}`,
    title,
    year: m.startDate?.year || "—",
    rating:
      typeof m.averageScore === "number"
        ? +(m.averageScore / 10).toFixed(1)
        : 0,
    poster: m.coverImage?.extraLarge || m.coverImage?.large,
    backdrop: m.bannerImage || null,
    type: "anime",
    region: "east",
    synopsis: m.description || "",
    trailerUrl,
    _meta: { source: "anilist", anilistId: m.id },
  };
}

// ---------------- Fetchers ----------------
export async function fetchAniListTrending() {
  const data = await anilistQuery(GQL_TRENDING, { page: 1, perPage: 20 });
  return (data?.Page?.media || []).map(mapAniListMedia);
}

export async function fetchAniListTopRated() {
  const data = await anilistQuery(GQL_TOP, { page: 1, perPage: 24 });
  return (data?.Page?.media || []).map(mapAniListMedia);
}

export async function fetchAniListUpcoming() {
  const data = await anilistQuery(GQL_UPCOMING, { page: 1, perPage: 24 });
  return (data?.Page?.media || []).map(mapAniListMedia);
}

export async function fetchAniListRecommended() {
  const data = await anilistQuery(GQL_RECOMMENDED, { page: 1, perPage: 24 });
  return (data?.Page?.media || []).map(mapAniListMedia);
}

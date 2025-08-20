// utils/anilist.js
import { fetchAniList } from "./proxyFetch";
import { sample, PLACEHOLDER } from "./placeholders";

const anilistCache = new Map();

async function anilistQuery(query, variables = {}) {
  const cacheKey = JSON.stringify({ query, variables });
  if (anilistCache.has(cacheKey)) return anilistCache.get(cacheKey);

  const json = await fetchAniList(query, variables);
  if (json.errors) throw new Error("AniList GraphQL error");

  anilistCache.set(cacheKey, json.data);
  return json.data;
}

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
      description(asHtml:false)
      coverImage{ extraLarge large }
      bannerImage
      trailer{ id site thumbnail }
    }
  }
}`;

function mapAniListAnime(a) {
  const title = a.title?.english || a.title?.romaji || a.title?.native || "Untitled";

  return {
    id: `east-anilist-${a.id}`,
    title,
    year: a.startDate?.year || "—",
    rating: typeof a.averageScore === "number" ? +(a.averageScore / 10).toFixed(1) : 0,
    poster: a.coverImage?.extraLarge || a.coverImage?.large || sample(PLACEHOLDER.posters),
    backdrop: a.bannerImage || sample(PLACEHOLDER.backdrops),
    type: "anime",
    region: "east",
    synopsis: a.description || "",
    trailerUrl: a.trailer?.site === "youtube" ? `https://www.youtube.com/watch?v=${a.trailer.id}` : null,
    _meta: { source: "anilist", aniListId: a.id },
  };
}

export async function fetchAniListTrending() {
  const json = await fetchAniList(`query { Page(page:1, perPage:20) { media(sort: TRENDING_DESC, type: ANIME) { id title { romaji english native } startDate { year } averageScore coverImage { large extraLarge } bannerImage description trailer { id site } } } }`);
  return (json?.data?.Page?.media || []).map(mapAniListAnime);
}

export async function fetchAniListUpcoming() {
  const json = await fetchAniList(`query { Page(page:1, perPage:20) { media(sort: START_DATE, type: ANIME, status: NOT_YET_RELEASED) { id title { romaji english native } startDate { year } averageScore coverImage { large extraLarge } bannerImage description trailer { id site } } } }`);
  return (json?.data?.Page?.media || []).map(mapAniListAnime);
}

export async function fetchAniListTopRated() {
  const json = await fetchAniList(`query { Page(page:1, perPage:20) { media(sort: SCORE_DESC, type: ANIME) { id title { romaji english native } startDate { year } averageScore coverImage { large extraLarge } bannerImage description trailer { id site } } } }`);
  return (json?.data?.Page?.media || []).map(mapAniListAnime);
}

// placeholder (AniList has recommendations per-id, not global)
export async function fetchAniListRecommended() {
  return [];
}
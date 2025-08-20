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

// ---------------- Base feeds ----------------
export async function fetchAniListTrending() {
  const query = `
    query {
      Page(page:1, perPage:20) {
        media(sort:TRENDING_DESC, type:ANIME) {
          id title { romaji english native }
          startDate { year }
          averageScore
          coverImage { large extraLarge }
          bannerImage
          description
          trailer { id site }
        }
      }
    }`;
  const json = await fetchAniList(query);
  return (json?.data?.Page?.media || []).map(mapAniListAnime);
}

export async function fetchAniListUpcoming() {
  const query = `
    query {
      Page(page:1, perPage:20) {
        media(sort:START_DATE, type:ANIME, status:NOT_YET_RELEASED) {
          id title { romaji english native }
          startDate { year }
          averageScore
          coverImage { large extraLarge }
          bannerImage
          description
          trailer { id site }
        }
      }
    }`;
  const json = await fetchAniList(query);
  return (json?.data?.Page?.media || []).map(mapAniListAnime);
}

export async function fetchAniListTopRated() {
  const query = `
    query {
      Page(page:1, perPage:20) {
        media(sort:SCORE_DESC, type:ANIME) {
          id title { romaji english native }
          startDate { year }
          averageScore
          coverImage { large extraLarge }
          bannerImage
          description
          trailer { id site }
        }
      }
    }`;
  const json = await fetchAniList(query);
  return (json?.data?.Page?.media || []).map(mapAniListAnime);
}

// ---------------- Recommendations ----------------
export async function fetchAniListRecommendations(anilistId) {
  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        recommendations {
          edges {
            node {
              mediaRecommendation {
                id
                title { romaji english native }
                averageScore
                startDate { year }
                coverImage { extraLarge large }
                bannerImage
                description
                trailer { id site }
              }
            }
          }
        }
      }
    }`;

  const data = await anilistQuery(query, { id: anilistId });
  const recs = data?.Media?.recommendations?.edges || [];
  return recs
    .map(edge => edge.node?.mediaRecommendation)
    .filter(Boolean)
    .map(mapAniListAnime);
}

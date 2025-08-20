// utils/watchtowerData.js
import {
  fetchAniListTrending,
  fetchAniListUpcoming,
  fetchAniListTop,
} from "./anilist";
import {
  fetchJikanTrending,
  fetchJikanUpcoming,
  fetchJikanTop,
} from "./jikan";
import {
  fetchTMDBTrending,
  fetchTMDBUpcoming,
  fetchTMDBTop,
} from "./tmdb";
import {
  fetchTraktTrending,
  fetchTraktPopular as fetchTraktTop,
} from "./trakt";

export const WatchtowerAPI = {
  east: {
    trending: async () => [
      ...(await fetchAniListTrending()),
      ...(await fetchJikanTrending()),
    ],
    upcoming: async () => [
      ...(await fetchAniListUpcoming()),
      ...(await fetchJikanUpcoming()),
    ],
    top: async () => [
      ...(await fetchAniListTop()),
      ...(await fetchJikanTop()),
    ],
  },
  west: {
    trending: async () => [
      ...(await fetchTMDBTrending()),
      ...(await fetchTraktTrending()),
    ],
    upcoming: async () => [
      ...(await fetchTMDBUpcoming()),
      // trakt has no real "upcoming", could skip or use anticipated
    ],
    top: async () => [
      ...(await fetchTMDBTop()),
      ...(await fetchTraktTop()),
    ],
  },
};

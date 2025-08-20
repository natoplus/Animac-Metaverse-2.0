// src/utils/watchtowerData.js
import { useEffect, useState, useCallback } from "react";

// AniList
import {
  fetchAniListTrending,
  fetchAniListUpcoming,
  fetchAniListTopRated,
  fetchAniListRecommended,
} from "./anilistApi";

// Jikan
import {
  fetchJikanTrending,
  fetchJikanUpcoming,
  fetchJikanTopRated,
  fetchJikanRecommended,
} from "./jikanApi";

// TMDB
import {
  fetchTMDBTrending,
  fetchTMDBUpcoming,
  fetchTMDBTopRated,
  fetchTMDBRecommended,
} from "./tmdbApi";

// Trakt
import {
  fetchTraktTrending,
  fetchTraktUpcoming,
  fetchTraktTopRated,
  fetchTraktRecommended,
} from "./traktApi";

// -----------------------------------------------------------------------------
// Hook: useWatchTowerData
// East = AniList + Jikan | West = TMDB + Trakt
// -----------------------------------------------------------------------------
export function useWatchTowerData(mode = "east") {
  const [trending, setTrending] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Utility: safe setter (prevents undefined/null)
  const safeSet = (setter, value) => setter(Array.isArray(value) ? value : []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (mode === "east") {
        // AniList + Jikan (Anime)
        const [aTrend, aUpcoming, aTop, aRec, jTrend, jUpcoming, jTop, jRec] =
          await Promise.allSettled([
            fetchAniListTrending(),
            fetchAniListUpcoming(),
            fetchAniListTopRated(),
            fetchAniListRecommended(),
            fetchJikanTrending(),
            fetchJikanUpcoming(),
            fetchJikanTopRated(),
            fetchJikanRecommended(),
          ]);

        safeSet(setTrending, [...(aTrend.value || []), ...(jTrend.value || [])]);
        safeSet(setUpcoming, [...(aUpcoming.value || []), ...(jUpcoming.value || [])]);
        safeSet(setTopRated, [...(aTop.value || []), ...(jTop.value || [])]);
        safeSet(setRecommended, [...(aRec.value || []), ...(jRec.value || [])]);
      } else {
        // TMDB + Trakt (Movies/TV)
        const [tTrend, tUpcoming, tTop, tRec, trTrend, trUpcoming, trTop, trRec] =
          await Promise.allSettled([
            fetchTMDBTrending(),
            fetchTMDBUpcoming(),
            fetchTMDBTopRated(),
            fetchTMDBRecommended(),
            fetchTraktTrending(),
            fetchTraktUpcoming(),
            fetchTraktTopRated(),
            fetchTraktRecommended(),
          ]);

        safeSet(setTrending, [...(tTrend.value || []), ...(trTrend.value || [])]);
        safeSet(setUpcoming, [...(tUpcoming.value || []), ...(trUpcoming.value || [])]);
        safeSet(setTopRated, [...(tTop.value || []), ...(trTop.value || [])]);
        safeSet(setRecommended, [...(tRec.value || []), ...(trRec.value || [])]);
      }
    } catch (err) {
      console.error("WatchTower data error:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [mode]);

  // Re-run when mode changes (east/west)
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    trending,
    upcoming,
    topRated,
    recommended,
    loading,
    error,
    refresh: loadData,
  };
}

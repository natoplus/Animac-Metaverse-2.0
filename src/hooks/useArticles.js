// src/hooks/useArticles.js
import { useEffect, useState } from "react";
import { fetchArticles, fetchFeaturedContent } from "../utils/api";

/**
 * Generic hook to fetch articles with filters
 */
export const useArticles = (
  category = null,
  featured = null,
  limit = 20,
  skip = 0,
  is_published = true
) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadArticles = async () => {
      setLoading(true);
      try {
        const params = { limit, skip };
        if (category) params.category = category;
        if (featured !== null) params.featured = featured;
        if (is_published !== null) params.is_published = is_published;

        const result = await fetchArticles(params);

        if (result?.error) {
          setError(result.message || "Failed to load articles");
          setArticles([]);
        } else {
          setArticles(result || []);
          setError(null);
        }
      } catch (err) {
        console.error("❌ Failed to fetch articles:", err);
        setError("Failed to load articles.");
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, [category, featured, limit, skip, is_published]);

  return { articles, loading, error };
};

/**
 * Hook to fetch featured articles and categorize them
 */
export const useFeaturedContent = () => {
  const [eastArticles, setEastArticles] = useState([]);
  const [westArticles, setWestArticles] = useState([]);
  const [allArticles, setAllArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      setLoading(true);
      try {
        const response = await fetchFeaturedContent();

        if (response?.error) {
          console.error("❌ Error fetching featured content:", response.message);
          setError(response.message);
          return;
        }

        const validArticles = Array.isArray(response)
          ? response.filter((a) => a && typeof a === "object")
          : [];

        const east = validArticles.filter(
          (article) => article?.region?.toLowerCase() === "east"
        );
        const west = validArticles.filter(
          (article) => article?.region?.toLowerCase() === "west"
        );

        setEastArticles(east);
        setWestArticles(west);
        setAllArticles(validArticles);
        setError(null);

        console.log("🌟 Featured content received:", validArticles);
      } catch (err) {
        console.error("🚨 Error loading featured content:", err.message);
        setError("Failed to fetch featured content.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return {
    eastArticles,
    westArticles,
    allArticles,
    loading,
    error,
  };
};
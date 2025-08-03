// src/hooks/useArticles.js

import { useState, useEffect } from 'react';
import { apiEndpoints } from '../utils/api';

/**
 * Hook to fetch articles based on filters such as:
 * - category: e.g., "east", "west"
 * - featured: true/false/null
 * - limit: max items to fetch
 * - skip: offset for pagination
 * - is_published: only published if true
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
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const params = { limit, skip };
        if (category) params.category = category;
        if (featured !== null) params.featured = featured;
        if (is_published !== null) params.is_published = is_published;

        const res = await apiEndpoints.getArticles(params);
        setArticles(res || []);
        setError(null);
      } catch (err) {
        console.error("❌ Failed to fetch articles:", err);
        setError('Failed to load articles.');
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [category, featured, limit, skip, is_published]);

  return { articles, loading, error };
};

/**
 * Hook to fetch the homepage featured content:
 * - Main hero article
 * - Top recent articles per region/category
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
        const response = await apiEndpoints.getFeaturedContent();
        console.log("🌟 Featured content received:", response);

        const validArticles = Array.isArray(response)
          ? response.filter((article) => article && typeof article === "object")
          : [];

        const east = validArticles.filter(
          (article) => article.region?.toLowerCase() === "east"
        );
        const west = validArticles.filter(
          (article) => article.region?.toLowerCase() === "west"
        );

        setEastArticles(east);
        setWestArticles(west);
        setAllArticles(validArticles);
        setError(null);
      } catch (err) {
        console.error("❌ Error fetching featured content:", err);
        setError('Failed to fetch featured content.');
        setEastArticles([]);
        setWestArticles([]);
        setAllArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return { eastArticles, westArticles, allArticles, loading, error };
};

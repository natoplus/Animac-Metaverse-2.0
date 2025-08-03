// src/hooks/useArticles.js

import { useState, useEffect } from 'react';
import { apiEndpoints, getFeaturedContent } from '../utils/api';

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

        const res = await apiEndpoints?.getArticles?.(params);
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
 * - Top recent articles per category
 */
export const useFeaturedContent = () => {
  const [featuredContent, setFeaturedContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      setLoading(true);
      try {
        const response = await apiEndpoints?.getFeaturedContent?.();
        console.log("🌟 Featured content received:", response);
        setFeaturedContent(response || {});
        setError(null);
      } catch (err) {
        console.error("❌ Error fetching featured content:", err);
        setError(err.message || 'Failed to fetch featured content.');
        setFeaturedContent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return { featuredContent, loading, error };
};

/**
 * Hook to fetch featured articles and group them by region: east, west, all
 */
export const useRegionArticles = () => {
  const [eastArticles, setEastArticles] = useState([]);
  const [westArticles, setWestArticles] = useState([]);
  const [allArticles, setAllArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const data = await getFeaturedContent();

        if (data?.error) {
          console.error("❌ Failed to fetch featured content:", data.message);
          setLoading(false);
          return;
        }

        const validArticles = Array.isArray(data)
          ? data.filter((article) => article && typeof article === "object")
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

        console.log("🌟 Featured content received:", validArticles);
      } catch (err) {
        console.error("🚨 Error loading articles:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  return {
    eastArticles,
    westArticles,
    allArticles,
    loading,
  };
};

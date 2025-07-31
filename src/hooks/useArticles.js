// src/hooks/useArticles.js

import { useState, useEffect } from 'react';
import { apiEndpoints } from '../utils/api';

/**
 * Hook to fetch articles based on category, featured flag, limit, etc.
 * @param {string|null} category - Article category ("east", "west", etc.)
 * @param {boolean|null} featured - Whether to filter only featured articles
 * @param {number} limit - Max number of articles to fetch
 * @param {number} skip - Number of articles to skip (pagination)
 * @param {boolean|null} is_published - Filter by published status
 */
export const useArticles = (category = null, featured = null, limit = 20, skip = 0, is_published = true) => {
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
 * Hook to fetch the featured content (hero + recent content per category)
 */
export const useFeaturedContent = () => {
  const [featuredContent, setFeaturedContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        const response = await apiEndpoints.getFeaturedContent();
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

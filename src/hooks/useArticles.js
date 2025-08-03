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

    fetchFeatured();// src/hooks/useArticles.js

import { useState, useEffect } from 'react';
import { apiEndpoints } from '../utils/api';

/**
 * Hook to fetch articles based on filters.
 *
 * @param {string|null} category - e.g., "east" or "west"
 * @param {boolean|null} featured - true, false, or null for any
 * @param {number} limit - number of articles to fetch
 * @param {number} skip - offset for pagination
 * @param {boolean|null} is_published - whether to filter published articles
 * @returns {{ articles: Array, loading: boolean, error: string|null }}
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
        if (Array.isArray(res)) {
          setArticles(res);
        } else {
          setArticles([]);
          console.warn('⚠️ Unexpected articles format:', res);
        }
        setError(null);
      } catch (err) {
        console.error('❌ Failed to fetch articles:', err);
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
 * Hook to fetch homepage featured content.
 *
 * @returns {{
 *  featuredContent: object|null,
 *  loading: boolean,
 *  error: string|null
 * }}
 */
export const useFeaturedContent = () => {
  const [featuredContent, setFeaturedContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      setLoading(true);
      try {
        const response = await apiEndpoints.getFeaturedContent();
        console.log('🌟 Featured content received:', response);

        if (response && typeof response === 'object') {
          setFeaturedContent(response);
        } else {
          setFeaturedContent(null);
          console.warn('⚠️ Unexpected featured content format:', response);
        }
        setError(null);
      } catch (err) {
        console.error('❌ Error fetching featured content:', err);
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

  }, []);

  return { featuredContent, loading, error };
};

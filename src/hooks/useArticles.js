// src/hooks/useArticles.js
import { useState, useEffect } from 'react';
import { apiEndpoints } from '../utils/api';

// ✅ Hook to fetch a list of articles by category and/or featured flag
export const useArticles = (category = null, featured = null) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const params = {};
        if (category) params.category = category;
        if (featured !== null) params.featured = featured;

        const res = await apiEndpoints.getArticles(params);
        setArticles(res || []);
        setError(null);
      } catch (err) {
        console.error("❌ Failed to fetch articles", err);
        setError('Failed to load articles.');
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [category, featured]);

  return { articles, loading, error };
};

// ✅ Hook to fetch featured content block (hero + recent content)
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
        setError(err.message);
        setFeaturedContent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return { featuredContent, loading, error };
};

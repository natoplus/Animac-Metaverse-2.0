import { useState, useEffect } from 'react';
import { apiEndpoints } from '../utils/api';

export const useArticles = (category = null, featured = null) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const params = {};
        if (category) params.category = category;
        if (featured !== null) params.featured = featured;

        const response = await apiEndpoints.getArticles(params);
        setArticles(response.data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [category, featured]);

  return { articles, loading, error };
};

export const useFeaturedContent = () => {
  const [featuredContent, setFeaturedContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedContent = async () => {
      try {
        setLoading(true);
        const response = await apiEndpoints.getFeaturedContent();
        setFeaturedContent(response.data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setFeaturedContent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedContent();
  }, []);

  return { featuredContent, loading, error };
};
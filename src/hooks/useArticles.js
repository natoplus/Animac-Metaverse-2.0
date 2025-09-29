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
      setError(null);
      
      try {
        const params = { limit, skip };
        if (category) params.category = category;
        if (featured !== null) params.featured = featured;
        if (is_published !== null) params.is_published = is_published;

        console.log(`🔍 Loading articles for category: ${category || 'all'}`);
        const result = await fetchArticles(params);

        if (result?.error) {
          setError(result.message || "Failed to load articles");
          setArticles([]);
        } else {
          setArticles(result || []);
          setError(null);
          console.log(`✅ Loaded ${result?.length || 0} articles for category: ${category || 'all'}`);
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
  const [featuredContent, setFeaturedContent] = useState([]);
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

        // The backend now returns { featured: [], recent_content: { east: [], west: [] } }
        // Use the featured array directly
        let featuredArticles = response?.featured || [];
        
        // Add some recent content as fallback if no featured articles
        if (featuredArticles.length === 0) {
          const recentEast = response?.recent_content?.east || [];
          const recentWest = response?.recent_content?.west || [];
          
          if (recentEast.length > 0) {
            featuredArticles.push({ ...recentEast[0], category: 'east' });
          }
          if (recentWest.length > 0) {
            featuredArticles.push({ ...recentWest[0], category: 'west' });
          }
        }

        setFeaturedContent(featuredArticles);
        setError(null);

        console.log("🌟 Featured content received:", featuredArticles);
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
    featuredContent,
    loading,
    error,
  };
};
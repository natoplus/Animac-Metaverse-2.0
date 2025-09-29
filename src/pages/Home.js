// === Imports ===
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { TrendingUp, Clock, Star, Users, BookOpen, List, ExternalLink, Mail, Hash } from 'lucide-react';
import SEO from "../components/SEO";
import HeroSection from '../components/HeroSection';
import ContentRow from '../components/ContentRow';
import { useFeaturedContent, useArticles } from '../hooks/useArticles';

// === WatchTower Preview Slideshow Component ===
const WatchTowerPreview = () => {
  const [trailers, setTrailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY;
  const TMDB_BASE_URL = "https://api.themoviedb.org/3";

  useEffect(() => {
    const fetchUpcomingWithTrailers = async () => {
      try {
        // Fetch upcoming movies
        const upcomingRes = await axios.get(`${TMDB_BASE_URL}/movie/upcoming`, {
          params: {
            api_key: TMDB_API_KEY,
            language: "en-US",
            page: 1,
          },
        });

        const upcomingMovies = upcomingRes.data.results;

        // Fetch trailers for each movie
        const moviesWithTrailers = await Promise.all(
          upcomingMovies.slice(0, 6).map(async (movie) => {
            const videosRes = await axios.get(`${TMDB_BASE_URL}/movie/${movie.id}/videos`, {
              params: {
                api_key: TMDB_API_KEY,
                language: "en-US",
              },
            });

            const trailer = videosRes.data.results.find(
              (vid) => vid.type === "Trailer" && vid.site === "YouTube"
            );

            return {
              id: movie.id,
              title: movie.title,
              youtubeKey: trailer ? trailer.key : null,
            };
          })
        );

        setTrailers(moviesWithTrailers.filter((m) => m.youtubeKey));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching trailers:", error);
        setLoading(false);
      }
    };

    fetchUpcomingWithTrailers();
  }, [TMDB_API_KEY]);

  // Auto slideshow
  useEffect(() => {
    if (trailers.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((i) => (i + 1) % trailers.length);
      }, 50000);
      return () => clearInterval(interval);
    }
  }, [trailers]);

  if (loading) {
    return (
      <div className="text-center py-20 text-lg text-gray-400">
        Loading trailers...
      </div>
    );
  }

  if (trailers.length === 0) return null;

  const currentTrailer = trailers[currentIndex];

  return (
    <div className="my-20 px-6 text-center max-w-6xl mx-auto">
      <h2 className="text-3xl md:text-5xl font-bold mb-6 font-azonix bg-clip-text text-transparent bg-gradient-to-r from-east-500 to-west-500">
        🎥 WatchTower Preview
      </h2>

      <div className="relative w-full max-w-4xl mx-auto aspect-video rounded-xl overflow-hidden shadow-lg bg-black">
        <AnimatePresence mode="wait">
          <motion.iframe
            key={currentTrailer.youtubeKey}
            src={`https://www.youtube.com/embed/${currentTrailer.youtubeKey}?autoplay=1&mute=1`}
            title={currentTrailer.title}
            allow="autoplay; encrypted-media"
            allowFullScreen
            className="w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          />
        </AnimatePresence>
      </div>

      <div className="flex justify-center mt-4 space-x-2">
        {trailers.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-3 h-3 rounded-full transition ${
              idx === currentIndex ? 'bg-east-500' : 'bg-gray-600 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// === Magazine-Style Components ===

// Featured Article Card Component
const FeaturedArticleCard = ({ article, isMain = false }) => {
  if (!article) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`netflix-card bg-netflix-dark rounded-lg overflow-hidden border border-gray-700/20 hover:border-gray-500/60 transition-all duration-300 ${
        isMain ? 'h-80' : 'h-64'
      } flex flex-col`}
    >
      <Link to={`/article/${article.slug}`}>
        <div className="relative h-32 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
          {article.featured_image ? (
            <img
              src={article.featured_image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-gray-500 text-lg font-azonix opacity-30">ANIMAC</div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          {isMain && (
            <div className="absolute top-3 left-3">
              <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs border border-red-500/30">
                Featured
              </span>
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col justify-between flex-1">
          <div>
            <h3 className="font-montserrat font-semibold text-lg mb-2 text-white line-clamp-2">
              {article.title}
            </h3>
            <p className="text-gray-400 text-sm mb-3 line-clamp-2 font-inter">
              {article.excerpt}
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-3">
              <span className="flex items-center space-x-1">
                <Users size={12} />
                <span>{article.author}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Clock size={12} />
                <span>{article.read_time} min</span>
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// Newsletter Signup Component
const NewsletterSignup = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-12"
    >
      <div className="max-w-4xl mx-auto bg-gradient-to-br from-east-800 to-west-800 rounded-2xl p-8 text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="p-3 rounded-lg bg-black/50 border border-gray-500/30 mr-4">
            <Mail size={24} className="text-gray-300" />
          </div>
          <h2 className="text-2xl md:text-3xl font-azonix font-bold text-white">
            Join Our Community
          </h2>
        </div>
        
        <p className="text-gray-300 text-lg mb-6">
          Stay updated with the latest anime and entertainment news, exclusive content, and community discussions.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 bg-black/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-east-500"
          />
          <button className="px-6 py-3 bg-gradient-to-r from-east-500 to-west-500 text-white rounded-lg font-semibold hover:from-east-600 hover:to-west-600 transition-all duration-300">
            Subscribe
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Category Showcase Component
const CategoryShowcase = ({ title, articles, category, icon: Icon }) => {
  const getThemeClasses = () => {
    switch (category) {
      case 'east':
        return {
          title: 'text-east-400',
          border: 'border-east-500/30',
          card: 'hover-glow-east border-east-500/20 hover:border-east-500/60'
        };
      case 'west':
        return {
          title: 'text-west-400',
          border: 'border-west-500/30',
          card: 'hover-glow-west border-west-500/20 hover:border-west-500/60'
        };
      default:
        return {
          title: 'text-gray-300',
          border: 'border-gray-500/30',
          card: 'hover:border-gray-500/60 border-gray-700/20'
        };
    }
  };

  const theme = getThemeClasses();

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-12"
    >
      <div className="flex items-center mb-6">
        <div className={`p-3 rounded-lg bg-black/50 border ${theme.border} mr-4`}>
          <Icon size={24} className={theme.title} />
        </div>
        <h2 className={`text-2xl md:text-3xl font-azonix font-bold ${theme.title}`}>
          {title}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.slice(0, 6).map((article, index) => (
          <motion.div
            key={article.id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <Link to={`/article/${article.slug}`}>
              <div className={`netflix-card bg-netflix-dark rounded-lg overflow-hidden border ${theme.card} transition-all duration-300 h-64 flex flex-col`}>
                <div className="relative h-32 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                  {article.featured_image ? (
                    <img
                      src={article.featured_image}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-gray-500 text-lg font-azonix opacity-30">
                        {category === 'east' ? 'EAST' : category === 'west' ? 'WEST' : 'ANIMAC'}
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>

                <div className="p-4 flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="font-montserrat font-semibold text-lg mb-2 text-white line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2 font-inter">
                      {article.excerpt}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center space-x-1">
                        <Users size={12} />
                        <span>{article.author}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock size={12} />
                        <span>{article.read_time} min</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// Lists & Rankings Component
const ListsRankings = ({ articles }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-12"
    >
      <div className="flex items-center mb-6">
        <div className="p-3 rounded-lg bg-black/50 border border-gray-500/30 mr-4">
          <List size={24} className="text-gray-300" />
        </div>
        <h2 className="text-2xl md:text-3xl font-azonix font-bold text-gray-300">
          Lists & Rankings
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {articles.slice(0, 4).map((article, index) => (
          <motion.div
            key={article.id || index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <Link to={`/article/${article.slug}`}>
              <div className="netflix-card bg-netflix-dark rounded-lg overflow-hidden border border-gray-700/20 hover:border-gray-500/60 transition-all duration-300 p-6 flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-east-500 to-west-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-montserrat font-semibold text-lg text-white mb-1 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-2">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <span className="flex items-center space-x-1 mr-4">
                      <Users size={12} />
                      <span>{article.author}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock size={12} />
                      <span>{article.read_time} min read</span>
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// Resource Hub Component
const ResourceHub = () => {
  const resources = [
    { name: 'Commission Site', url: '#', description: 'Get custom artwork' },
    { name: 'Main Site', url: '#', description: 'Official website' },
    { name: 'Documentation', url: '#', description: 'GitBook guides' },
    { name: 'Community', url: '#', description: 'Join Soic community' },
    { name: 'Support', url: '#', description: 'Get help & support' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-12"
    >
      <div className="flex items-center mb-6">
        <div className="p-3 rounded-lg bg-black/50 border border-gray-500/30 mr-4">
          <ExternalLink size={24} className="text-gray-300" />
        </div>
        <h2 className="text-2xl md:text-3xl font-azonix font-bold text-gray-300">
          Resource Hub
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((resource, index) => (
          <motion.a
            key={index}
            href={resource.url}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
            className="netflix-card bg-netflix-dark rounded-lg p-6 border border-gray-700/20 hover:border-gray-500/60 transition-all duration-300 flex items-center space-x-4"
          >
            <div className="p-2 rounded-lg bg-gradient-to-br from-east-500 to-west-500">
              <ExternalLink size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-montserrat font-semibold text-white mb-1">
                {resource.name}
              </h3>
              <p className="text-gray-400 text-sm">
                {resource.description}
              </p>
            </div>
          </motion.a>
        ))}
      </div>
    </motion.div>
  );
};

// === Main Home Page ===
const Home = () => {
  const { featuredContent } = useFeaturedContent();
  const { articles: eastArticles, loading: eastLoading, error: eastError } = useArticles('east');
  const { articles: westArticles, loading: westLoading, error: westError } = useArticles('west');
  const { articles: allArticles, loading: allLoading, error: allError } = useArticles();

  // Debug logging
  console.log('🏠 Home component data:', {
    featuredContent,
    eastArticles: eastArticles?.length || 0,
    westArticles: westArticles?.length || 0,
    allArticles: allArticles?.length || 0,
    eastLoading,
    westLoading,
    allLoading,
    eastError,
    westError,
    allError
  });

  // If no articles are loaded, show a message
  if (!allLoading && allArticles.length === 0 && !allError) {
    console.log('⚠️ No articles found in database');
  }

  // Test backend connectivity
  useEffect(() => {
    const testBackend = async () => {
      try {
        console.log('🔍 Testing backend connectivity...');
        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://animac-metaverse.onrender.com';
        console.log('🔍 Backend URL:', backendUrl);
        
        const response = await fetch(`${backendUrl}/api/health`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Backend health check successful:', data);
        } else {
          console.error('❌ Backend health check failed:', response.status, response.statusText);
        }
      } catch (err) {
        console.error('❌ Backend connection failed:', err);
        console.error('❌ Error details:', err.message);
      }
    };
    testBackend();
  }, []);

  return (
    <>
      <SEO
        title="ANIMAC METAVERSE - Your Mainstream for Anime & Western Entertainment"
        description="Dive into curated anime and western entertainment culture on Animac Metaverse. Discover the latest in anime, movies, cartoons, and entertainment news."
        url="/"
        image="/assets/animac-preview-logo.svg"
        type="website"
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-black text-white"
      >
        <HeroSection featuredContent={featuredContent} />

        {/* === Buzzfeed Ticker === */}
        <div className="bg-gradient-to-r from-east-500 to-west-500 py-2 overflow-hidden mb-8 mt-8">
          <div className="whitespace-nowrap animate-marquee text-sm md:text-base font-semibold font-mono uppercase">
            {allArticles.slice(0, 10).map((article, i) => (
              <span key={i} className="mx-6">📰 {article.title}</span>
            ))}
            {allArticles.slice(0, 10).map((article, i) => (
              <span key={`dup-${i}`} className="mx-6">📰 {article.title}</span>
            ))}
          </div>
        </div>

        <div className="relative z-10 -mt-32 pt-32 bg-gradient-to-t from-netflix-black to-transparent">
          <div className="container mx-auto space-y-24">
            <ContentRow
              title="This Week in Anime"
              articles={eastArticles}
              category="east"
              emptyMessage="No eastern articles found yet."
            />

            <ContentRow
              title="Movies & Cartoons Spotlight"
              articles={westArticles}
              category="west"
              emptyMessage="No western articles found yet."
            />

            <ContentRow
              title="🔥 Trending Now"
              articles={allArticles.filter((a) => a.is_featured)}
              category="neutral"
              emptyMessage="No featured stories available."
            />

            <ContentRow
              title="⭐ Editor's Choice"
              articles={allArticles.slice(0, 8)}
              category="neutral"
              emptyMessage="No editor picks at the moment."
            />

            <div className="max-w-5xl mx-auto bg-gradient-to-br from-east-800 to-west-800 rounded-2xl p-10 shadow-lg text-center">
              <h3 className="text-3xl md:text-5xl font-bold font-azonix bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-yellow-500 mb-4">
                🌟 Spotlight Creator
              </h3>
              <p className="text-gray-300 text-lg mb-6">
                Meet <span className="font-bold">Amari Tenshi</span>, creator of <i>"Sky Reapers."</i>
              </p>
              <motion.a
                href="/creator/amari-tenshi"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block px-8 py-3 bg-gradient-to-r from-pink-600 to-yellow-500 text-white rounded-lg font-semibold"
              >
                Read the Interview →
              </motion.a>
            </div>

            {/* WatchTower Preview with Live Data */}
            <WatchTowerPreview />

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="py-16 px-4"
            >
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="font-azonix text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-east-500 to-west-500 bg-clip-text text-transparent">
                  Dive Deeper into BUZZFEED
                </h2>
                <p className="text-xl text-gray-300 font-inter mb-8 leading-relaxed">
                  Explore our dedicated portals for anime culture and western entertainment. Choose your journey and discover stories that resonate with your passion.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <motion.a
                    href="/buzzfeed/east"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-east-600 to-east-500 text-white font-montserrat font-semibold rounded-lg hover:from-east-700 hover:to-east-600 transition-all duration-300 hover-glow-east"
                  >
                    Explore EAST Portal <span className="ml-2 text-lg">→</span>
                  </motion.a>

                  <motion.a
                    href="/buzzfeed/west"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-west-600 to-west-500 text-white font-montserrat font-semibold rounded-lg hover:from-west-700 hover:to-west-600 transition-all duration-300 hover-glow-west"
                  >
                    Explore WEST Portal <span className="ml-2 text-lg">→</span>
                  </motion.a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* === NEW MAGAZINE-STYLE SECTIONS === */}
        

        {/* 2. Trending / Popular Now */}
        <section className="container mx-auto px-4 mb-16">
          {allLoading ? (
            <div className="text-center py-12">
              <div className="text-gray-400">Loading trending articles...</div>
            </div>
          ) : allError ? (
            <div className="text-center py-12">
              <div className="text-red-400">Error loading articles: {allError}</div>
            </div>
          ) : (
            <ContentRow
              title="🔥 Trending Now"
              articles={allArticles
                .sort((a, b) => (b.likes || 0) + (b.bookmarks || 0) - (a.likes || 0) - (a.bookmarks || 0))
                .slice(0, 8)}
              category="neutral"
              emptyMessage="No trending articles yet."
            />
          )}
        </section>

        {/* 3. Latest News / Updates */}
        <section className="container mx-auto px-4 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-center mb-6">
              <div className="p-3 rounded-lg bg-black/50 border border-gray-500/30 mr-4">
                <Clock size={24} className="text-gray-300" />
              </div>
              <h2 className="text-2xl md:text-3xl font-azonix font-bold text-gray-300">
                Latest News & Updates
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allArticles
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 9)
                .map((article, index) => (
                <motion.div
                  key={article.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <Link to={`/article/${article.slug}`}>
                    <div className="netflix-card bg-netflix-dark rounded-lg overflow-hidden border border-gray-700/20 hover:border-gray-500/60 transition-all duration-300 h-64 flex flex-col">
                      <div className="relative h-32 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                        {article.featured_image ? (
                          <img
                            src={article.featured_image}
                            alt={article.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-gray-500 text-lg font-azonix opacity-30">ANIMAC</div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute top-3 left-3">
                          <span className="bg-gray-500/20 text-gray-300 px-2 py-1 rounded text-xs border border-gray-500/30">
                            {new Date(article.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 flex flex-col justify-between flex-1">
                        <div>
                          <h3 className="font-montserrat font-semibold text-lg mb-2 text-white line-clamp-2">
                            {article.title}
                          </h3>
                          <p className="text-gray-400 text-sm mb-3 line-clamp-2 font-inter">
                            {article.excerpt}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center space-x-3">
                            <span className="flex items-center space-x-1">
                              <Users size={12} />
                              <span>{article.author}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock size={12} />
                              <span>{article.read_time} min</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* 4. Categories Showcase */}
        <section className="container mx-auto px-4 mb-16">
          {eastLoading || westLoading ? (
            <div className="text-center py-12">
              <div className="text-gray-400">Loading categories...</div>
            </div>
          ) : (eastArticles.length === 0 && westArticles.length === 0) ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">No articles found in any category.</div>
              <div className="text-sm text-gray-500">
                Create some articles in the admin dashboard to see them here.
              </div>
            </div>
          ) : (
            <>
              <CategoryShowcase
                title="Anime & Manga"
                articles={eastArticles}
                category="east"
                icon={BookOpen}
              />
              
              <CategoryShowcase
                title="Movies & TV"
                articles={westArticles}
                category="west"
                icon={Star}
              />
            </>
          )}
        </section>

        {/* 5. Editorial Picks / Opinion Pieces */}
        <section className="container mx-auto px-4 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-center mb-6">
              <div className="p-3 rounded-lg bg-black/50 border border-yellow-500/30 mr-4">
                <Star size={24} className="text-yellow-400" />
              </div>
              <h2 className="text-2xl md:text-3xl font-azonix font-bold text-yellow-400">
                Editorial Picks
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allArticles.filter(article => article.is_featured).slice(0, 6).map((article, index) => (
                <motion.div
                  key={article.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <Link to={`/article/${article.slug}`}>
                    <div className="netflix-card bg-netflix-dark rounded-lg overflow-hidden border border-yellow-500/20 hover:border-yellow-500/60 transition-all duration-300 h-80 flex flex-col relative">
                      {/* Special Editorial Badge */}
                      <div className="absolute top-3 right-3 z-10">
                        <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs border border-yellow-500/30">
                          Editor's Choice
                        </span>
                      </div>

                      <div className="relative h-40 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                        {article.featured_image ? (
                          <img
                            src={article.featured_image}
                            alt={article.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-gray-500 text-lg font-azonix opacity-30">EDITORIAL</div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      </div>

                      <div className="p-4 flex flex-col justify-between flex-1">
                        <div>
                          <h3 className="font-montserrat font-semibold text-lg mb-2 text-white line-clamp-2">
                            {article.title}
                          </h3>
                          <p className="text-gray-400 text-sm mb-3 line-clamp-3 font-inter">
                            {article.excerpt}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center space-x-3">
                            <span className="flex items-center space-x-1">
                              <Users size={12} />
                              <span>{article.author}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock size={12} />
                              <span>{article.read_time} min</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* 6. Lists & Rankings */}
        <section className="container mx-auto px-4 mb-16">
          <ListsRankings articles={allArticles.filter(article => 
            /list|top|best|ranking|countdown/i.test(article.title)
          ).slice(0, 4)} />
        </section>

        {/* 7. Resource Hub */}
        <section className="container mx-auto px-4 mb-16">
          <ResourceHub />
        </section>

        {/* 8. Newsletter / Community Join */}
        <section className="container mx-auto px-4 mb-16">
          <NewsletterSignup />
        </section>
      </motion.div>
    </>
  );
};

export default Home;

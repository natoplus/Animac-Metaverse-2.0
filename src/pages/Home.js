// === Imports ===
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
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

// === Main Home Page ===
const Home = () => {
  const { featuredContent } = useFeaturedContent();
  const { articles: eastArticles } = useArticles('east');
  const { articles: westArticles } = useArticles('west');
  const { articles: allArticles } = useArticles();

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
      </motion.div>
    </>
  );
};

export default Home;

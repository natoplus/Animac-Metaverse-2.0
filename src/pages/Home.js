import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HeroSection from '../components/HeroSection';
import ContentRow from '../components/ContentRow';
import { useFeaturedContent, useArticles } from '../hooks/useArticles';

const UpcomingSeriesPreview = ({ eastArticles, westArticles, loading }) => {
  const [selectedRegion, setSelectedRegion] = useState('east');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Get the right articles based on region and filter upcoming series only
  const series = (selectedRegion === 'east' ? eastArticles : westArticles).filter(
    (article) => article.isUpcoming // Assuming you have a field like this to mark upcoming series
  );

  // Slideshow interval for auto change
  useEffect(() => {
    if (!loading && series.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((i) => (i + 1) % series.length);
      }, 5000); // 5 seconds fade

      return () => clearInterval(interval);
    }
  }, [series, loading]);

  if (loading) {
    return <p className="text-center text-gray-400 italic">Loading upcoming series...</p>;
  }

  if (series.length === 0) {
    return <p className="text-center text-gray-400 italic">No upcoming series found.</p>;
  }

  const currentSeries = series[currentIndex];

  return (
    <div className="my-20 px-6 text-center max-w-6xl mx-auto">
      {/* Toggle */}
      <div className="flex justify-center mb-6 space-x-6">
        {['east', 'west'].map((region) => (
          <button
            key={region}
            onClick={() => {
              setSelectedRegion(region);
              setCurrentIndex(0); // reset slideshow on toggle change
            }}
            className={`px-6 py-2 rounded-full font-semibold transition ${
              selectedRegion === region
                ? 'bg-gradient-to-r from-east-500 to-west-500 text-white shadow-lg'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {region.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Slideshow container */}
      <div className="relative w-[240px] h-[360px] mx-auto rounded-xl overflow-hidden shadow-xl bg-black">
        <AnimatePresence mode="wait">
          <motion.a
            key={currentSeries.id}
            href={`/article/${currentSeries.slug}`} // assuming slug
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="block w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${currentSeries.cover_image || currentSeries.thumbnail})` }}
            title={currentSeries.title}
          >
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-transparent p-4 text-white text-center font-semibold text-lg">
              {currentSeries.title}
            </div>
          </motion.a>
        </AnimatePresence>
      </div>

      {/* Navigation dots */}
      <div className="flex justify-center mt-4 space-x-2">
        {series.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-3 h-3 rounded-full transition ${
              idx === currentIndex ? 'bg-east-500' : 'bg-gray-600 hover:bg-gray-400'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Button to WatchTower */}
      <motion.a
        href="/watchtower"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mt-8 inline-block px-8 py-3 bg-gradient-to-r from-east-600 to-west-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition"
      >
        Visit WatchTower →
      </motion.a>
    </div>
  );
};

const Home = () => {
  const { featuredContent, loading: featuredLoading } = useFeaturedContent();
  const { articles: eastArticles, loading: eastLoading } = useArticles('east');
  const { articles: westArticles, loading: westLoading } = useArticles('west');
  const { articles: allArticles, loading: allLoading } = useArticles();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-black text-white"
    >
      {/* Hero Section */}
      <HeroSection featuredContent={featuredContent} />

      {/* Buzzfeed Bulletin Ticker */}
      <div className="bg-gradient-to-r from-east-500 to-west-500 py-2 overflow-hidden">
        <div className="whitespace-nowrap animate-marquee text-sm md:text-base font-semibold font-mono uppercase">
          {allArticles.slice(0, 10).map((article, i) => (
            <span key={i} className="mx-6">
              📰 {article.title}
            </span>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 -mt-32 pt-32 bg-gradient-to-t from-netflix-black to-transparent">
        <div className="container mx-auto">
          {/* East Content */}
          {!eastLoading && eastArticles.length > 0 ? (
            <ContentRow
              title="This Week in Anime"
              articles={eastArticles}
              category="east"
              emptyMessage="No eastern articles found yet."
            />
          ) : (
            <p className="text-center text-gray-400 my-6 italic">No eastern articles found yet.</p>
          )}

          {/* West Content */}
          {!westLoading && westArticles.length > 0 ? (
            <ContentRow
              title="Movies & Cartoons Spotlight"
              articles={westArticles}
              category="west"
              emptyMessage="No western articles found yet."
            />
          ) : (
            <p className="text-center text-gray-400 my-6 italic">No western articles found yet.</p>
          )}

          {/* Trending */}
          {!allLoading && allArticles.length > 0 ? (
            <ContentRow
              title="🔥 Trending Now"
              articles={allArticles.filter((article) => article.is_featured)}
              category="neutral"
              emptyMessage="No featured stories available."
            />
          ) : (
            <p className="text-center text-gray-400 my-6 italic">No featured stories available.</p>
          )}

          {/* Editor's Picks */}
          {!allLoading && allArticles.length > 0 ? (
            <ContentRow
              title="⭐ Editor's Choice"
              articles={allArticles.slice(0, 8)}
              category="neutral"
              emptyMessage="No editor picks at the moment."
            />
          ) : (
            <p className="text-center text-gray-400 my-6 italic">No editor picks at the moment.</p>
          )}

          {/* === REPLACE GENRE SHOWCASE WITH UPCOMING SERIES PREVIEW === */}
          <UpcomingSeriesPreview
            eastArticles={eastArticles}
            westArticles={westArticles}
            loading={eastLoading || westLoading}
          />

          {/* Spotlight Creator */}
          <div className="my-24 px-6">
            <div className="max-w-5xl mx-auto bg-gradient-to-br from-east-800 to-west-800 rounded-2xl p-10 shadow-lg text-center">
              <h3 className="text-3xl md:text-5xl font-bold font-azonix bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-yellow-500 mb-4">
                🌟 Spotlight Creator
              </h3>
              <p className="text-gray-300 font-inter text-lg mb-6">
                This month, meet{' '}
                <span className="font-bold text-white">Amari Tenshi</span>, the mind behind the cult-favorite indie
                series <i>"Sky Reapers."</i> Dive into their story and inspirations.
              </p>
              <motion.a
                href="/creator/amari-tenshi"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block px-8 py-3 bg-gradient-to-r from-pink-600 to-yellow-500 text-white rounded-lg font-semibold hover:from-pink-700 hover:to-yellow-600 transition"
              >
                Read the Interview →
              </motion.a>
            </div>
          </div>

          {/* Parallax Animated Banner */}
          <div className="my-24">
            <div className="relative h-[300px] sm:h-[400px] md:h-[500px] overflow-hidden rounded-2xl">
              <motion.div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage:
                    'url(https://images.unsplash.com/photo-1605733160314-4fc7c2c5f9e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80)',
                }}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ duration: 10, ease: 'easeOut' }}
              />
              <div className="relative z-10 flex flex-col items-center justify-center h-full bg-black/60 backdrop-blur-sm text-center p-6">
                <h2 className="text-3xl md:text-5xl font-bold font-azonix text-white mb-4">Immersive Worlds Await</h2>
                <p className="text-gray-200 text-lg font-inter max-w-xl">
                  From futuristic dystopias to heartfelt romances — discover stories that transport you beyond reality.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Portal */}
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
                Explore our dedicated portals for anime culture and western entertainment. Choose your journey and
                discover stories that resonate with your passion.
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
  );
};

export default Home;

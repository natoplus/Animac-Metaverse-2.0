import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection = ({ featuredContent }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showMoreInfo, setShowMoreInfo] = useState(false);

  // Transform featured articles to hero slides format
  const transformToHeroSlides = (articles) => {
    if (!articles || articles.length === 0) return [];
    
    return articles.map(article => ({
      id: article.id,
      title: article.title,
      subtitle: article.author ? `By ${article.author}` : 'Featured Article',
      description: article.excerpt || 'Discover the latest insights and stories from the world of anime and entertainment.',
      category: article.category || 'neutral',
      image: article.featured_image || 'https://via.placeholder.com/1920x1080/1a1a1a/ffffff?text=ANIMAC',
      imageMobile: article.featured_image || 'https://via.placeholder.com/768x1024/1a1a1a/ffffff?text=ANIMAC',
      link: `/article/${article.slug}`,
      readTime: article.read_time || 5,
      createdAt: article.created_at,
      fullContent: article.content // Store full content for "More Info"
    }));
  };

  // Shuffle array function
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Default slides (always available)
  const defaultSlides = [
    {
      id: 1,
      title: 'Attack on Titan Final Season',
      subtitle: 'The Ultimate Battle Begins',
      description:
        "Eren Yeager's journey reaches its climactic end as humanity faces its greatest threat yet. Experience the stunning conclusion to Hajime Isayama's masterpiece.",
      category: 'east',
      image:
        'https://occ-0-8407-2218.1.nflxso.net/dnm/api/v6/Z-WHgqd_TeJxSuha8aZ5WpyLcX8/AAAABfrlSgfIEw-hX0imXlnY3qlZQoHl7Sx1z4CVxkWNdRMltLiGO6lkciwA1XsDjZto2aQJP9X7ulUOHfspuCwAdhfCngH7SZzsPZZn.jpg?r=551',
      imageMobile:
        'https://i.pinimg.com/736x/0f/06/2e/0f062e74d730cdc4b27922f6eefb9bed.jpg',
      link: '/article/attack-on-titan',
      readTime: 8,
    },
    {
      id: 2,
      title: 'Spider-Verse Revolution',
      subtitle: 'Animation Redefined',
      description:
        'How Into the Spider-Verse changed animation forever with groundbreaking visual storytelling that influenced a generation of filmmakers.',
      category: 'west',
      image:
        'https://platform.theverge.com/wp-content/uploads/sites/2/chorus/uploads/chorus_asset/file/13572496/SpiderVerse_cropped.jpg?quality=90&strip=all&crop=0,0,100,100',
      imageMobile:
        'https://platform.theverge.com/wp-content/uploads/sites/2/chorus/uploads/chorus_asset/file/13572496/SpiderVerse_cropped.jpg?quality=90&strip=all&crop=0,0,100,100',
      link: '/article/spider-verse',
      readTime: 6,
    },
    {
      id: 3,
      title: 'Studio Culture Chronicles',
      subtitle: 'Behind the Animation',
      description:
        "Dive deep into the studios that shape our favorite animated worlds, from MAPPA's revolutionary techniques to Pixar's emotional storytelling.",
      category: 'both',
      image:
        'https://static1.cbrimages.com/wordpress/wp-content/uploads/2021/12/deku-and-spider-man.jpg',
      imageMobile:
        'https://preview.redd.it/would-spider-man-be-a-good-mentor-teacher-for-deku-v0-pvckixzd370f1.jpeg?auto=webp&s=7233d8e3bffb3fce84d7eb54196f68bf4bf1ba18',
      link: '/buzzfeed',
      readTime: 10,
    },
  ];

  // Combine featured articles with default slides and shuffle randomly
  const getHeroSlides = () => {
    const featuredSlides = featuredContent?.length > 0 ? transformToHeroSlides(featuredContent) : [];
    const allSlides = [...featuredSlides, ...defaultSlides];
    return shuffleArray(allSlides);
  };

  const heroSlides = getHeroSlides();

  useEffect(() => {
    // Only start the timer if the modal is not open
    if (!showMoreInfo) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [heroSlides.length, showMoreInfo]);

  const nextSlide = () =>
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  const current = heroSlides[currentSlide];

  const getThemeClasses = (category) => {
    switch (category) {
      case 'east':
        return 'from-east-900/80 to-transparent';
      case 'west':
        return 'from-west-900/80 to-transparent';
      default:
        return 'from-netflix-black/80 to-transparent';
    }
  };

  const getButtonClasses = (category) => {
    switch (category) {
      case 'east':
        return 'hover:bg-east-600 border-east-500 text-east-100 hover-glow-east';
      case 'west':
        return 'hover:bg-west-600 border-west-500 text-west-100 hover-glow-west';
      default:
        return 'hover:bg-gray-600 border-gray-500 text-gray-100';
    }
  };

  return (
    <div className="relative h-screen overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <picture>
            <source media="(max-width: 768px)" srcSet={current.imageMobile || current.image} />
            <source media="(min-width: 769px)" srcSet={current.image} />
            <img
              src={current.image}
              alt={current.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </picture>
          <div className={`absolute inset-0 bg-gradient-to-r ${getThemeClasses(current.category)}`} />
          <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4">
          <motion.div
            key={currentSlide}
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="max-w-2xl"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className={`inline-block px-3 py-1 rounded-full text-xs font-inter font-semibold mb-4 ${
                current.category === 'east'
                  ? 'bg-east-500/20 text-east-300 border border-east-500/30'
                  : current.category === 'west'
                  ? 'bg-west-500/20 text-west-300 border border-west-500/30'
                  : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
              }`}
            >
              {current.category === 'east'
                ? 'EAST • ANIME'
                : current.category === 'west'
                ? 'WEST • MOVIES & CARTOONS'
                : 'FEATURED'}
            </motion.div>

            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-5xl md:text-7xl font-azonix font-bold mb-4 leading-tight"
            >
              {current.title}
            </motion.h1>

            <motion.h2
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-xl md:text-2xl font-montserrat font-medium text-gray-300 mb-6"
            >
              {current.subtitle}
            </motion.h2>

            <motion.p
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-lg font-inter text-gray-200 mb-8 leading-relaxed max-w-xl"
            >
              {current.description}
            </motion.p>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                to={current.link}
                className="inline-flex items-center px-8 py-3 bg-white text-black font-inter font-semibold rounded transition-all duration-300 hover:bg-gray-200 hover:scale-105"
              >
                <Play size={20} className="mr-2" fill="currentColor" />
                Read Story
              </Link>

              <button
                onClick={() => setShowMoreInfo(true)}
                className={`inline-flex items-center px-8 py-3 border-2 bg-transparent font-inter font-semibold rounded transition-all duration-300 ${getButtonClasses(
                  current.category
                )}`}
              >
                <Info size={20} className="mr-2" />
                More Info
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all duration-300 hover:scale-110"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all duration-300 hover:scale-110"
      >
        <ChevronRight size={24} />
      </button>

      

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-16 right-8 z-20 text-gray-400 text-sm font-inter"
      >
        Scroll for more
      </motion.div>

      {/* More Info Modal */}
      <AnimatePresence>
        {showMoreInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowMoreInfo(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-netflix-dark rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-gray-700/50"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="relative">
                <img
                  src={current.image}
                  alt={current.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-transparent to-transparent" />
                <button
                  onClick={() => setShowMoreInfo(false)}
                  className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all duration-300"
                >
                  ✕
                </button>
                <div className="absolute bottom-4 left-4">
                  <h2 className="text-2xl md:text-3xl font-azonix font-bold text-white mb-2">
                    {current.title}
                  </h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-300">
                    <span>{current.subtitle}</span>
                    <span>•</span>
                    <span>{current.readTime} min read</span>
                    {current.createdAt && (
                      <>
                        <span>•</span>
                        <span>{new Date(current.createdAt).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-96">
                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-inter font-semibold ${
                    current.category === 'east'
                      ? 'bg-east-500/20 text-east-300 border border-east-500/30'
                      : current.category === 'west'
                      ? 'bg-west-500/20 text-west-300 border border-west-500/30'
                      : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                  }`}>
                    {current.category === 'east'
                      ? 'EAST • ANIME'
                      : current.category === 'west'
                      ? 'WEST • MOVIES & CARTOONS'
                      : 'FEATURED'}
                  </span>
                </div>
                
                <p className="text-gray-200 text-lg leading-relaxed mb-6">
                  {current.description}
                </p>

                {current.fullContent && (
                  <div className="text-gray-300 leading-relaxed">
                    <p className="text-sm opacity-75">
                      {current.fullContent.length > 500 
                        ? `${current.fullContent.substring(0, 500)}...` 
                        : current.fullContent}
                    </p>
                  </div>
                )}

                <div className="mt-6 flex gap-4">
                  <Link
                    to={current.link}
                    className="inline-flex items-center px-6 py-3 bg-white text-black font-inter font-semibold rounded transition-all duration-300 hover:bg-gray-200 hover:scale-105"
                    onClick={() => setShowMoreInfo(false)}
                  >
                    <Play size={18} className="mr-2" fill="currentColor" />
                    Read Full Story
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HeroSection;

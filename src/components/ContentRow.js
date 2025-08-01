import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const ContentRow = ({ title, articles, category = 'neutral' }) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scroll = (direction) => {
    const container = scrollRef.current;
    if (container) {
      const scrollAmount = container.clientWidth * 0.8;
      const newScrollLeft =
        container.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);

      container.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
    }
  };

  const handleScroll = () => {
    const container = scrollRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      );
    }
  };

  useEffect(() => {
    handleScroll(); // initialize scroll button states
    const container = scrollRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [articles]);

  const getThemeClasses = () => {
    switch (category) {
      case 'east':
        return {
          title: 'text-east-400 border-east-500/30',
          card: 'hover-glow-east border-east-500/20 hover:border-east-500/60',
          tag: 'bg-east-500/20 text-east-300 border-east-500/30',
        };
      case 'west':
        return {
          title: 'text-west-400 border-west-500/30',
          card: 'hover-glow-west border-west-500/20 hover:border-west-500/60',
          tag: 'bg-west-500/20 text-west-300 border-west-500/30',
        };
      default:
        return {
          title: 'text-gray-300 border-gray-500/30',
          card: 'hover:border-gray-500/60 border-gray-700/20',
          tag: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
        };
    }
  };

  const theme = getThemeClasses();

  if (!articles || articles.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative mb-12"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6 px-4">
        <h2 className={`text-2xl md:text-3xl font-azonix font-bold ${theme.title} border-l-4 pl-4`}>
          {title}
        </h2>

        <div className="flex space-x-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed ${
              canScrollLeft ? 'hover:scale-110' : ''
            }`}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed ${
              canScrollRight ? 'hover:scale-110' : ''
            }`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto space-x-4 pb-4 content-row px-4 scrollbar-hide"
      >
        {articles.map((article, index) => (
          <motion.div
            key={article.id || index}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="flex-none w-80"
          >
            <Link to={`/article/${article.id}`}>
              <div
                className={`netflix-card bg-netflix-dark rounded-lg overflow-hidden border ${theme.card} transition-all duration-300`}
              >
                {/* Article Image */}
                <div className="relative h-48 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                  {article.featured_image ? (
                    <img
                      src={article.featured_image}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-gray-500 text-4xl font-azonix opacity-30">
                        {category === 'east'
                          ? 'EAST'
                          : category === 'west'
                          ? 'WEST'
                          : 'ANIMAC'}
                      </div>
                    </div>
                  )}

                  {/* Category Badge */}
                  <div
                    className={`absolute top-3 left-3 px-2 py-1 rounded text-xs font-inter font-semibold ${theme.tag} border`}
                  >
                    {category === 'east'
                      ? 'ANIME'
                      : category === 'west'
                      ? 'MOVIES & CARTOONS'
                      : 'FEATURED'}
                  </div>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-montserrat font-semibold text-lg mb-2 text-white line-clamp-2 leading-tight">
                    {article.title}
                  </h3>

                  <p className="text-gray-400 text-sm mb-3 line-clamp-3 font-inter leading-relaxed">
                    {article.excerpt}
                  </p>

                  {/* Article Meta */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center space-x-1">
                        <User size={12} />
                        <span>{article.author}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock size={12} />
                        <span>{article.read_time} min read</span>
                      </span>
                    </div>

                    {article.is_featured && (
                      <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs border border-yellow-500/30">
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {article.tags.slice(0, 3).map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 transition-colors"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ContentRow;

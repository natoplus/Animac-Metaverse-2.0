import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import { Filter, Search, Calendar, User, Clock } from 'lucide-react';
import { useArticles } from '../hooks/useArticles';
import { Link } from 'react-router-dom';

const WestPortal = () => {
  const { articles: westArticles, loading } = useArticles('west');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  // Get unique tags from articles
  const allTags = [...new Set(westArticles.flatMap(article => article.tags || []))];

  // Filter articles based on search and tag
  const filteredArticles = westArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || (article.tags && article.tags.includes(selectedTag));
    return matchesSearch && matchesTag;
  });

  // Featured article (first featured or first article)
  const featuredArticle = westArticles.find(article => article.is_featured) || westArticles[0];

  const pageTitle = "West Portal • Movies & Cartoons Chronicles";
  const pageDescription = "Dive into Hollywood blockbusters, indie animations, and western cartoon classics with reviews, features, and deep dives.";
  const pageUrl = "https://animac-metaverse.vercel.app/buzzfeed/west"; // Replace with your actual site URL
  const previewImage = featuredArticle?.featured_image || "https://animac-metaverse.vercel.app/assets/buzzfeed-west.jpg";

  return (
    <>
      <SEO
        title={pageTitle}
        description={pageDescription}
        url={pageUrl}
        image={previewImage}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen pt-20 west-gradient"
      >
        {/* West Portal Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-west-900/30 via-netflix-dark to-netflix-black">
          <div className="absolute inset-0 bg-[url('https://platform.theverge.com/wp-content/uploads/sites/2/chorus/uploads/chorus_asset/file/13572496/SpiderVerse_cropped.jpg?quality=90&strip=all&crop=0,0,100,100')] bg-cover bg-center opacity-20" />

          <div className="relative z-10 container mx-auto px-4 py-16">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl"
            >
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="inline-block px-4 py-2 bg-west-500/20 border border-west-500/30 rounded-full text-west-300 font-inter font-semibold text-sm mb-4"
              >
                BUZZFEED • WEST PORTAL
              </motion.div>

              <h1 className="font-ackno text-6xl md:text-8xl font-bold mb-6 text-glow-west">
                WEST
              </h1>

              <p className="text-2xl font-montserrat font-medium text-west-300 mb-4">
                Movies & Cartoons Chronicles
              </p>

              <p className="text-lg font-inter text-gray-300 leading-relaxed max-w-2xl">
                Dive into Hollywood blockbusters, indie animations, and western cartoon classics.
                Comprehensive reviews, feature articles, and deep dives into the entertainment that defines western culture.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Search and Filter Section */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-col md:flex-row gap-4 mb-12"
          >
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search movies & cartoons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-netflix-dark border border-gray-700 rounded-lg text-white font-inter placeholder-gray-400 focus:outline-none focus:border-west-500 transition-colors"
              />
            </div>

            {/* Tag Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="pl-10 pr-8 py-3 bg-netflix-dark border border-gray-700 rounded-lg text-white font-inter focus:outline-none focus:border-west-500 transition-colors appearance-none"
              >
                <option value="">All Tags</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          </motion.div>

          {/* Featured Article */}
          {featuredArticle && (
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mb-16"
            >
              <h2 className="font-azonix text-3xl font-bold text-west-400 mb-6 border-l-4 border-west-500 pl-4">
                Featured Story
              </h2>

              <Link to={`/article/${featuredArticle.id}`}>
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-west-900/40 to-netflix-dark hover-glow-west transition-all duration-300 hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent z-10" />
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1717395948943-f2a38e2e41f4')] bg-cover bg-center opacity-30" />

                  <div className="relative z-20 p-8 md:p-12">
                    <div className="max-w-2xl">
                      <div className="inline-block px-3 py-1 bg-west-500/20 border border-west-500/30 rounded-full text-west-300 font-inter font-semibold text-sm mb-4">
                        FEATURED • MOVIES & CARTOONS
                      </div>

                      <h3 className="font-montserrat text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                        {featuredArticle.title}
                      </h3>

                      <p className="text-lg text-gray-300 font-inter leading-relaxed mb-6">
                        {featuredArticle.excerpt}
                      </p>

                      <div className="flex items-center space-x-6 text-sm text-gray-400">
                        <span className="flex items-center space-x-2">
                          <User size={16} />
                          <span>{featuredArticle.author}</span>
                        </span>
                        <span className="flex items-center space-x-2">
                          <Clock size={16} />
                          <span>{featuredArticle.read_time} min read</span>
                        </span>
                        <span className="flex items-center space-x-2">
                          <Calendar size={16} />
                          <span>{new Date(featuredArticle.created_at).toLocaleDateString()}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Articles Grid */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-azonix text-3xl font-bold text-west-400 border-l-4 border-west-500 pl-4">
                Latest Articles
              </h2>
              <div className="text-sm text-gray-400 font-inter">
                {filteredArticles.length} articles found
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="bg-gray-800 rounded-lg h-64 mb-4"></div>
                    <div className="bg-gray-700 h-4 rounded mb-2"></div>
                    <div className="bg-gray-700 h-3 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredArticles.map((article, index) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    <Link to={`/article/${article.id}`}>
                      <div className="netflix-card bg-netflix-dark rounded-lg overflow-hidden border border-west-500/20 hover-glow-west hover:border-west-500/60 transition-all duration-300">
                        {/* Article Image */}
                        <div className="relative h-48 bg-gradient-to-br from-west-800/30 to-gray-900 overflow-hidden">
                          {article.featured_image ? (
                            <img
                              src={article.featured_image}
                              alt={article.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="text-west-500/30 text-2xl font-azonix">
                                WEST
                              </div>
                            </div>
                          )}

                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                          {article.is_featured && (
                            <div className="absolute top-3 right-3 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs border border-yellow-500/30">
                              Featured
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-6">
                          <h3 className="font-montserrat font-semibold text-lg mb-3 text-white line-clamp-2 leading-tight">
                            {article.title}
                          </h3>

                          <p className="text-gray-400 text-sm mb-4 line-clamp-3 font-inter leading-relaxed">
                            {article.excerpt}
                          </p>

                          {/* Article Meta */}
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                            <span className="flex items-center space-x-1">
                              <User size={12} />
                              <span>{article.author}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock size={12} />
                              <span>{article.read_time} min</span>
                            </span>
                          </div>

                          {/* Tags */}
                          {article.tags && article.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {article.tags.slice(0, 3).map((tag, tagIndex) => (
                                <span
                                  key={tagIndex}
                                  className="text-xs px-2 py-1 bg-west-500/20 text-west-300 rounded border border-west-500/30 hover:bg-west-500/30 transition-colors cursor-pointer"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setSelectedTag(tag);
                                  }}
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
            )}

            {!loading && filteredArticles.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">😔</div>
                <h3 className="font-montserrat text-xl font-semibold text-white mb-2">
                  No articles found
                </h3>
                <p className="text-gray-400 font-inter">
                  Try adjusting your search terms or filters
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

      export default WestPortal;
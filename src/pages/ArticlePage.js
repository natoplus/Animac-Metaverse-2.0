import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Clock, Calendar, Share2, Bookmark, Heart } from 'lucide-react';
import { apiEndpoints } from '../utils/api';

const ArticlePage = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await apiEndpoints.getArticle(id);
        setArticle(response.data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setArticle(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArticle();
    }
  }, [id]);

  const getThemeClasses = (category) => {
    switch (category) {
      case 'east':
        return {
          gradient: 'from-east-900/30 via-netflix-dark to-netflix-black',
          accent: 'text-east-400',
          badge: 'bg-east-500/20 text-east-300 border-east-500/30',
          button: 'bg-east-500 hover:bg-east-600 text-white',
          border: 'border-east-500'
        };
      case 'west':
        return {
          gradient: 'from-west-900/30 via-netflix-dark to-netflix-black',
          accent: 'text-west-400',
          badge: 'bg-west-500/20 text-west-300 border-west-500/30',
          button: 'bg-west-500 hover:bg-west-600 text-white',
          border: 'border-west-500'
        };
      default:
        return {
          gradient: 'from-netflix-dark to-netflix-black',
          accent: 'text-gray-400',
          badge: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
          button: 'bg-gray-500 hover:bg-gray-600 text-white',
          border: 'border-gray-500'
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-netflix-black">
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="bg-gray-800 h-96 rounded-lg mb-8"></div>
            <div className="bg-gray-700 h-8 rounded mb-4"></div>
            <div className="bg-gray-700 h-6 rounded w-2/3 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-gray-700 h-4 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen pt-20 bg-netflix-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😢</div>
          <h2 className="font-montserrat text-2xl font-bold text-white mb-2">
            Article Not Found
          </h2>
          <p className="text-gray-400 font-inter mb-6">
            The article you're looking for doesn't exist or has been moved.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-gray-700 text-white font-inter font-medium rounded-lg hover:bg-gray-600 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const theme = getThemeClasses(article.category);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen pt-20"
    >
      {/* Hero Section */}
      <div className={`relative overflow-hidden bg-gradient-to-br ${theme.gradient}`}>
        <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-transparent to-transparent z-10" />
        {article.featured_image && (
          <div className="absolute inset-0 bg-cover bg-center opacity-20"
               style={{ backgroundImage: `url(${article.featured_image})` }} />
        )}
        
        <div className="relative z-20 container mx-auto px-4 py-16">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            {/* Back Button */}
            <Link
              to={article.category === 'east' ? '/buzzfeed/east' : article.category === 'west' ? '/buzzfeed/west' : '/'}
              className="inline-flex items-center text-gray-400 hover:text-white font-inter mb-6 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to {article.category === 'east' ? 'EAST Portal' : article.category === 'west' ? 'WEST Portal' : 'Home'}
            </Link>

            {/* Category Badge */}
            <div className={`inline-block px-4 py-2 ${theme.badge} rounded-full font-inter font-semibold text-sm mb-6 border`}>
              {article.category === 'east' ? 'EAST • ANIME' : 
               article.category === 'west' ? 'WEST • MOVIES & CARTOONS' : 'FEATURED'}
            </div>

            {/* Title */}
            <h1 className="font-montserrat text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              {article.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-gray-300 mb-8">
              <span className="flex items-center space-x-2">
                <User size={20} />
                <span className="font-inter font-medium">{article.author}</span>
              </span>
              <span className="flex items-center space-x-2">
                <Calendar size={20} />
                <span className="font-inter">{new Date(article.created_at).toLocaleDateString()}</span>
              </span>
              <span className="flex items-center space-x-2">
                <Clock size={20} />
                <span className="font-inter">{article.read_time} min read</span>
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setLiked(!liked)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-300 ${
                  liked 
                    ? `${theme.button} ${theme.border}` 
                    : 'bg-transparent border-gray-600 text-gray-300 hover:border-gray-400 hover:text-white'
                }`}
              >
                <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
                <span className="font-inter">Like</span>
              </button>
              
              <button
                onClick={() => setBookmarked(!bookmarked)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-300 ${
                  bookmarked 
                    ? `${theme.button} ${theme.border}` 
                    : 'bg-transparent border-gray-600 text-gray-300 hover:border-gray-400 hover:text-white'
                }`}
              >
                <Bookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} />
                <span className="font-inter">Save</span>
              </button>
              
              <button className="flex items-center space-x-2 px-4 py-2 rounded-lg border bg-transparent border-gray-600 text-gray-300 hover:border-gray-400 hover:text-white transition-all duration-300">
                <Share2 size={18} />
                <span className="font-inter">Share</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Article Content */}
      <div className="bg-netflix-black">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Excerpt */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mb-12"
            >
              <p className="text-xl font-inter text-gray-300 leading-relaxed italic border-l-4 border-gray-600 pl-6">
                {article.excerpt}
              </p>
            </motion.div>

            {/* Main Content */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="prose prose-lg prose-invert max-w-none"
            >
              <div className="font-inter text-gray-300 leading-relaxed text-lg">
                {article.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-6">
                    {paragraph}
                  </p>
                ))}
              </div>
            </motion.div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="mt-12 pt-8 border-t border-gray-800"
              >
                <h3 className="font-montserrat font-semibold text-white mb-4">Tags</h3>
                <div className="flex flex-wrap gap-3">
                  {article.tags.map((tag, index) => (
                    <span
                      key={index}
                      className={`px-3 py-2 ${theme.badge} rounded-lg font-inter font-medium text-sm border cursor-pointer hover:opacity-80 transition-opacity`}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Author Info */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="mt-12 pt-8 border-t border-gray-800"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center">
                  <User size={24} className="text-gray-300" />
                </div>
                <div>
                  <h4 className="font-montserrat font-semibold text-white">{article.author}</h4>
                  <p className="text-gray-400 font-inter text-sm">
                    Contributing writer at ANIMAC • 
                    {article.category === 'east' ? ' EAST Portal specialist' : 
                     article.category === 'west' ? ' WEST Portal specialist' : ' Featured content creator'}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ArticlePage;
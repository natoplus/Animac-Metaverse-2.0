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
        const fetchedArticle = response.data?.article || response.data; // adapt to your API shape
        setArticle(fetchedArticle);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch article');
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
        <div className="container mx-auto px-4 py-12 animate-pulse space-y-6">
          <div className="bg-gray-800 h-96 rounded-lg"></div>
          <div className="bg-gray-700 h-8 w-2/3 rounded"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-700 h-4 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen pt-20 bg-netflix-black flex items-center justify-center text-center">
        <div>
          <div className="text-6xl mb-4">😢</div>
          <h2 className="text-white text-2xl font-bold font-montserrat mb-2">Article Not Found</h2>
          <p className="text-gray-400 mb-6 font-inter">
            This article doesn't exist or was removed.
          </p>
          <Link
            to="/"
            className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
          >
            <ArrowLeft size={20} className="inline mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const theme = getThemeClasses(article.category);
  const estimatedReadTime = article.read_time || Math.ceil((article.content || '').split(' ').length / 200);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="min-h-screen pt-20">
      {/* Hero Section */}
      <div className={`relative overflow-hidden bg-gradient-to-br ${theme.gradient}`}>
        <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-transparent to-transparent z-10" />
        {article.featured_image && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${article.featured_image})` }}
          />
        )}

        <div className="relative z-20 container mx-auto px-4 py-16 max-w-4xl">
          <Link
            to={article.category === 'east' ? '/buzzfeed/east' : article.category === 'west' ? '/buzzfeed/west' : '/'}
            className="text-gray-400 hover:text-white font-inter mb-6 inline-flex items-center transition"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to {article.category === 'east' ? 'EAST Portal' : article.category === 'west' ? 'WEST Portal' : 'Home'}
          </Link>

          <div className={`inline-block px-4 py-2 ${theme.badge} rounded-full font-inter text-sm border mb-6`}>
            {article.category === 'east' ? 'EAST • ANIME' : article.category === 'west' ? 'WEST • MOVIES & CARTOONS' : 'FEATURED'}
          </div>

          <h1 className="text-white text-4xl md:text-6xl font-bold font-montserrat mb-6">{article.title}</h1>

          <div className="flex flex-wrap items-center gap-6 text-gray-300 text-sm mb-8">
            <span className="flex items-center gap-2">
              <User size={18} /> {article.author || 'ANIMAC Team'}
            </span>
            <span className="flex items-center gap-2">
              <Calendar size={18} /> {new Date(article.created_at).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-2">
              <Clock size={18} /> {estimatedReadTime} min read
            </span>
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setLiked(!liked)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 border transition ${
                liked ? `${theme.button} ${theme.border}` : 'bg-transparent border-gray-600 text-gray-300 hover:border-gray-400 hover:text-white'
              }`}
            >
              <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
              Like
            </button>

            <button
              onClick={() => setBookmarked(!bookmarked)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 border transition ${
                bookmarked ? `${theme.button} ${theme.border}` : 'bg-transparent border-gray-600 text-gray-300 hover:border-gray-400 hover:text-white'
              }`}
            >
              <Bookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} />
              Save
            </button>

            <button className="px-4 py-2 rounded-lg flex items-center gap-2 border border-gray-600 text-gray-300 hover:border-gray-400 hover:text-white transition">
              <Share2 size={18} />
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Article Body */}
      <div className="bg-netflix-black">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="mb-12 italic text-xl text-gray-300 border-l-4 border-gray-600 pl-6 font-inter">
            {article.excerpt || 'No excerpt provided.'}
          </div>

          <div className="prose prose-invert max-w-none font-inter text-gray-300 text-lg space-y-6">
            {(article.content || '').split('\n').map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>

          {/* Tags */}
          {article.tags?.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-800">
              <h3 className="text-white font-montserrat font-semibold mb-4">Tags</h3>
              <div className="flex flex-wrap gap-3">
                {article.tags.map((tag, i) => (
                  <span key={i} className={`px-3 py-2 ${theme.badge} rounded-lg font-inter text-sm border`}>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Author Info */}
          <div className="mt-12 pt-8 border-t border-gray-800 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
              <User size={24} className="text-gray-300" />
            </div>
            <div>
              <h4 className="text-white font-montserrat font-semibold">{article.author || 'ANIMAC Team'}</h4>
              <p className="text-gray-400 font-inter text-sm">
                {article.category === 'east' ? 'EAST Portal specialist' : article.category === 'west' ? 'WEST Portal specialist' : 'Featured contributor'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ArticlePage;

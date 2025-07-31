// src/pages/ArticlePage.js
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, User, Clock, Calendar, Share2, Bookmark, Heart, Loader,
} from 'lucide-react';
import { apiEndpoints } from '../utils/api';
import CommentSection from '../components/CommentSection';

const ArticlePage = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      try {
        const res = await apiEndpoints.getArticle(id);
        setArticle(res);
        setError(null);
        window.scrollTo(0, 0);

        const likeKey = `liked-${res.id}`;
        const bookmarkKey = `bookmarked-${res.id}`;
        setLiked(localStorage.getItem(likeKey) === 'true');
        setBookmarked(localStorage.getItem(bookmarkKey) === 'true');
      } catch (err) {
        console.error("❌ Failed to fetch article", err);
        setError('Article not found or failed to load.');
        setArticle(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchArticle();
  }, [id]);

  const getTheme = (category) => {
    switch (category) {
      case 'east':
        return {
          gradient: 'from-east-900/30 via-netflix-dark to-netflix-black',
          accent: 'text-east-400',
          badge: 'bg-east-500/20 text-east-300 border-east-500/30',
          button: 'bg-east-500 hover:bg-east-600',
          border: 'border-east-500',
        };
      case 'west':
        return {
          gradient: 'from-west-900/30 via-netflix-dark to-netflix-black',
          accent: 'text-west-400',
          badge: 'bg-west-500/20 text-west-300 border-west-500/30',
          button: 'bg-west-500 hover:bg-west-600',
          border: 'border-west-500',
        };
      default:
        return {
          gradient: 'from-netflix-dark to-netflix-black',
          accent: 'text-gray-400',
          badge: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
          button: 'bg-gray-600 hover:bg-gray-700',
          border: 'border-gray-500',
        };
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("❌ Failed to copy link:", err);
    }
  };

  const handleLike = () => {
    const key = `liked-${article.id}`;
    const newState = !liked;
    setLiked(newState);
    localStorage.setItem(key, newState);
  };

  const handleBookmark = () => {
    const key = `bookmarked-${article.id}`;
    const newState = !bookmarked;
    setBookmarked(newState);
    localStorage.setItem(key, newState);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-netflix-black flex justify-center items-center">
        <div className="text-gray-400 font-inter flex items-center gap-2">
          <Loader className="animate-spin" size={20} /> Loading article...
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
          <p className="text-gray-400 mb-6 font-inter">{error}</p>
          <Link to="/" className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition">
            <ArrowLeft size={20} className="inline mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const theme = getTheme(article.category);
  const estimatedReadTime = article.read_time || Math.ceil((article.content || '').split(' ').length / 200);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="min-h-screen pt-20">
      {/* Hero Section */}
      <div className={`relative overflow-hidden bg-gradient-to-br ${theme.gradient}`}>
        {article.featured_image && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${article.featured_image})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-transparent to-transparent z-10" />

        <div className="relative z-20 container mx-auto px-4 py-16 max-w-4xl">
          <Link
            to={article.category === 'east' ? '/buzzfeed/east' : article.category === 'west' ? '/buzzfeed/west' : '/'}
            className="text-gray-400 hover:text-white font-inter inline-flex items-center mb-4"
          >
            <ArrowLeft size={20} className="mr-2" /> Back to {article.category?.toUpperCase() || 'Home'}
          </Link>

          <span className={`inline-block px-4 py-2 rounded-full text-sm font-inter border ${theme.badge}`}>
            {article.category?.toUpperCase() || 'FEATURED'}
          </span>

          <h1 className="text-white text-4xl md:text-5xl font-bold font-montserrat mt-4 mb-6">
            {article.title}
          </h1>

          <div className="flex flex-wrap gap-6 text-sm text-gray-300 mb-8">
            <span className="flex items-center gap-2"><User size={16} /> {article.author || 'ANIMAC Team'}</span>
            <span className="flex items-center gap-2"><Calendar size={16} /> {new Date(article.created_at).toLocaleDateString()}</span>
            <span className="flex items-center gap-2"><Clock size={16} /> {estimatedReadTime} min read</span>
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleLike}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 border transition ${liked ? `${theme.button} ${theme.border} text-white` : 'bg-transparent border-gray-600 text-gray-300 hover:border-gray-400 hover:text-white'}`}
            >
              <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
              Like
            </button>

            <button
              onClick={handleBookmark}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 border transition ${bookmarked ? `${theme.button} ${theme.border} text-white` : 'bg-transparent border-gray-600 text-gray-300 hover:border-gray-400 hover:text-white'}`}
            >
              <Bookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} />
              Save
            </button>

            <button
              onClick={() => setShowShareModal(true)}
              className="px-4 py-2 rounded-lg flex items-center gap-2 border border-gray-600 text-gray-300 hover:border-gray-400 hover:text-white transition"
            >
              <Share2 size={18} />
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Article Body */}
      <div className="bg-netflix-black">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          {article.excerpt && (
            <div className="mb-12 italic text-xl text-gray-300 border-l-4 border-gray-600 pl-6 font-inter">
              {article.excerpt}
            </div>
          )}
          <div className="prose prose-invert max-w-none text-gray-300 text-lg space-y-6 font-inter">
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
                  <span key={i} className={`px-3 py-2 rounded-lg font-inter text-sm border ${theme.badge}`}>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ✅ Comment Section */}
        <CommentSection articleId={article.id} />
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center">
          <div className="bg-netflix-dark p-6 rounded-lg max-w-sm text-center">
            <h3 className="text-white text-lg font-bold mb-4">Share this article</h3>
            <p className="text-gray-300 mb-4 text-sm">Copy the link and share it with friends:</p>
            <input
              readOnly
              className="w-full p-2 rounded bg-gray-800 text-gray-300 text-sm mb-2"
              value={window.location.href}
              onClick={(e) => e.target.select()}
            />
            <button
              onClick={handleCopyLink}
              className="text-sm font-semibold text-white py-1 px-4 rounded bg-gray-700 hover:bg-gray-600 mb-2"
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
            <button
              onClick={() => setShowShareModal(false)}
              className="text-sm text-gray-400 hover:text-white underline block"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ArticlePage;

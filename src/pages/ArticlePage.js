// src/pages/ArticlePage.js
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, User, Clock, Calendar, Share2, Bookmark, Heart, Loader,
} from 'lucide-react';
import { apiEndpoints } from '../utils/api';
import CommentSection from '../components/CommentSection';
import { toggleArticleLike, toggleArticleBookmark } from '../services/articleService'; // Make sure this path is correct

const ArticlePage = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [shareCount, setShareCount] = useState(0);

  const fetchArticle = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      const res = await apiEndpoints.getArticle(id);
      if (!res || typeof res !== 'object') throw new Error('Invalid article response');

      setArticle(res);
      setLikeCount(res.likes ?? 0);
      setBookmarkCount(res.bookmarks ?? 0);
      setShareCount(res.shares ?? 0);
      setLiked(!!res.likedByCurrentUser);
      setBookmarked(!!res.bookmarkedByCurrentUser);
      setError(null);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error('❌ Failed to fetch article:', err);
      setError('Article not found or failed to load.');
      setArticle(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setShareCount(prev => prev + 1);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('❌ Failed to copy link:', err);
    }
  };

  const handleLike = async () => {
    try {
      await toggleArticleLike(id);
      setLiked(prev => !prev);
      setLikeCount(prev => prev + (liked ? -1 : 1));
    } catch (err) {
      console.error('❌ Like toggle failed:', err);
    }
  };

  const handleBookmark = async () => {
    try {
      await toggleArticleBookmark(id);
      setBookmarked(prev => !prev);
      setBookmarkCount(prev => prev + (bookmarked ? -1 : 1));
    } catch (err) {
      console.error('❌ Bookmark toggle failed:', err);
    }
  };

  const getTheme = (category) => {
    switch (category) {
      case 'east': return {
        gradient: 'from-east-900/30 via-netflix-dark to-netflix-black',
        accent: 'text-east-400',
        badge: 'bg-east-500/20 text-east-300 border-east-500/30',
        button: 'bg-east-500 hover:bg-east-600',
        border: 'border-east-500',
      };
      case 'west': return {
        gradient: 'from-west-900/30 via-netflix-dark to-netflix-black',
        accent: 'text-west-400',
        badge: 'bg-west-500/20 text-west-300 border-west-500/30',
        button: 'bg-west-500 hover:bg-west-600',
        border: 'border-west-500',
      };
      default: return {
        gradient: 'from-netflix-dark to-netflix-black',
        accent: 'text-gray-400',
        badge: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
        button: 'bg-gray-600 hover:bg-gray-700',
        border: 'border-gray-500',
      };
    }
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
          <h2 className="text-white text-2xl font-bold mb-2">Article Not Found</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link to="/" className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition">
            <ArrowLeft size={20} className="inline mr-2" /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const theme = getTheme(article.category);
  const estimatedReadTime = article.read_time || Math.ceil((article.content || '').split(' ').length / 200);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="min-h-screen pt-20 bg-netflix-black text-gray-200">
      {/* Article content and interaction buttons */}
      {/* ... (rest of unchanged render logic) ... */}
    </motion.div>
  );
};

export default ArticlePage;

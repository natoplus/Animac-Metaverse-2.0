import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, User, Clock, Calendar, Share2, Bookmark, Heart, Loader,
} from 'lucide-react';

import CommentSection from '../components/CommentSection';
import { toggleLikeArticle, toggleBookmarkArticle } from '../services/articleService';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://animac-metaverse.onrender.com';

const ArticlePage = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);

  const [likeCount, setLikeCount] = useState(0);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [shareCount, setShareCount] = useState(0);

  const [likeProcessing, setLikeProcessing] = useState(false);
  const [bookmarkProcessing, setBookmarkProcessing] = useState(false);

  const getSessionId = () => {
    let sessionId = localStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  };

  const fetchArticle = useCallback(async () => {
    if (!id) {
      setError('Missing article ID in URL.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/articles/by-id/${id}`);
      const data = res.data;

      setArticle(data);
      setLikeCount(data.likes ?? 0);
      setBookmarkCount(data.bookmarks ?? 0);
      setShareCount(data.shares ?? 0);
      setLiked(Boolean(data.likedByCurrentUser));
      setBookmarked(Boolean(data.bookmarkedByCurrentUser));
      setError(null);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error('❌ Failed to fetch article:', err?.response?.data || err.message);
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
    if (!article?.id || likeProcessing) return;
    setLikeProcessing(true);
    const sessionId = getSessionId();
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount(prev => newLiked ? prev + 1 : Math.max(prev - 1, 0));
    try {
      await toggleLikeArticle(article.id, sessionId);
    } catch (error) {
      console.error('❌ Like toggle failed:', error);
    } finally {
      setLikeProcessing(false);
    }
  };

  const handleBookmark = async () => {
    if (!article?.id || bookmarkProcessing) return;
    setBookmarkProcessing(true);
    const sessionId = getSessionId();
    const newBookmarked = !bookmarked;
    setBookmarked(newBookmarked);
    setBookmarkCount(prev => newBookmarked ? prev + 1 : Math.max(prev - 1, 0));
    try {
      await toggleBookmarkArticle(article.id, sessionId);
    } catch (error) {
      console.error('❌ Bookmark toggle failed:', error);
    } finally {
      setBookmarkProcessing(false);
    }
  };

  const getTheme = (category) => {
    switch (category?.toLowerCase()) {
      case 'east':
        return {
          gradient: 'from-east-900/50 via-netflix-dark to-netflix-black',
          accent: 'text-east-400',
          badge: 'border-east-400 text-east-300 bg-east-800/20',
        };
      case 'west':
        return {
          gradient: 'from-west-900/50 via-netflix-dark to-netflix-black',
          accent: 'text-west-400',
          badge: 'border-west-400 text-west-300 bg-west-800/20',
        };
      default:
        return {
          gradient: 'from-gray-900 via-netflix-dark to-netflix-black',
          accent: 'text-gray-300',
          badge: 'border-gray-500 text-gray-300 bg-gray-800/20',
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`min-h-screen pt-20 bg-gradient-to-b ${theme.gradient} text-gray-200`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold leading-tight text-white mb-3">{article.title}</h1>
        <p className={`text-md sm:text-lg font-medium ${theme.accent} mb-6 italic`}>
          {article.excerpt || 'An insightful read from Animac.'}
        </p>

        <div className="text-sm text-gray-400 flex gap-4 items-center mb-6">
          <span><User size={14} className="inline mr-1" /> {article.author}</span>
          <span><Calendar size={14} className="inline mr-1" /> {new Date(article.created_at).toLocaleDateString()}</span>
          <span><Clock size={14} className="inline mr-1" /> {estimatedReadTime} min read</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-gray-300 mb-8">
          <button onClick={handleLike} disabled={likeProcessing} className="hover:text-pink-500 transition flex items-center gap-1">
            <Heart size={18} /> {liked ? 'Liked' : 'Like'} ({likeCount})
          </button>
          <button onClick={handleBookmark} disabled={bookmarkProcessing} className="hover:text-yellow-400 transition flex items-center gap-1">
            <Bookmark size={18} /> {bookmarked ? 'Bookmarked' : 'Bookmark'} ({bookmarkCount})
          </button>
          <button onClick={handleCopyLink} className="hover:text-blue-400 transition flex items-center gap-1">
            <Share2 size={18} /> {copied ? 'Copied!' : 'Share'} ({shareCount})
          </button>
        </div>

        {/* Article Body */}
        <div className="bg-netflix-black">
          <div className="container mx-auto px-4 py-10 max-w-4xl">
            {article.excerpt && (
              <div className="mb-12 italic text-xl text-gray-300 border-l-4 border-gray-600 pl-6 font-inter">
                {article.excerpt}
              </div>
            )}
            <div className="prose prose-invert max-w-none text-gray-300 text-lg space-y-6 font-inter">
              {(article.content || '').split('\n').map((para, idx) => (
                <p key={idx}>{para.trim()}</p>
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
        </div>

        {/* Comments */}
        <div className="mt-12">
          <CommentSection articleId={article.id} />
        </div>
      </div>
    </motion.div>
  );
};

export default ArticlePage;

// src/pages/ArticlePage.js
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, User, Clock, Calendar, Share2, Bookmark, Heart, Loader,
} from 'lucide-react';

import CommentSection from '../components/CommentSection';
import { toggleArticleLike, toggleBookmark } from '../services/articleService';

const API_URL = process.env.REACT_APP_BACKEND_URL;

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
      console.log('[Session] New session ID created:', sessionId);
    } else {
      console.log('[Session] Existing session ID used:', sessionId);
    }
    return sessionId;
  };

  const fetchArticle = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    console.log('[Fetch] Fetching article with ID:', id);

    try {
      const res = await axios.get(`${API_URL}/api/articles/${id}`);
      const data = res.data;

      console.log('[Fetch] Article data received:', data);

      setArticle(data);
      setLikeCount(data.likes ?? 0);
      setBookmarkCount(data.bookmarks ?? 0);
      setShareCount(data.shares ?? 0);
      setLiked(!!data.likedByCurrentUser);
      setBookmarked(!!data.bookmarkedByCurrentUser);
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
      setShareCount((prev) => prev + 1);
      console.log('[Share] Link copied to clipboard');
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
    setLikeCount((prev) => newLiked ? prev + 1 : Math.max(prev - 1, 0));

    console.log(`[Like] Sending like toggle: articleId=${article.id}, liked=${newLiked}`);

    try {
      await toggleArticleLike(article.id, sessionId, newLiked);
      console.log('[Like] Like toggled successfully');
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
    setBookmarkCount((prev) => newBookmarked ? prev + 1 : Math.max(prev - 1, 0));

    console.log(`[Bookmark] Sending bookmark toggle: articleId=${article.id}, bookmarked=${newBookmarked}`);

    try {
      await toggleBookmark(article.id, sessionId, newBookmarked);
      console.log('[Bookmark] Bookmark toggled successfully');
    } catch (error) {
      console.error('❌ Bookmark toggle failed:', error);
    } finally {
      setBookmarkProcessing(false);
    }
  };

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
      className="min-h-screen pt-20 bg-netflix-black text-gray-200"
    >
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-2 text-white">{article.title}</h1>
        <div className="text-sm text-gray-400 flex gap-4 items-center mb-4">
          <span><User className="inline mr-1" size={14} /> {article.author}</span>
          <span><Calendar className="inline mr-1" size={14} /> {new Date(article.created_at).toLocaleDateString()}</span>
          <span><Clock className="inline mr-1" size={14} /> {estimatedReadTime} min read</span>
        </div>

        <div className="flex items-center gap-4 text-gray-300 mb-6">
          <button
            onClick={handleLike}
            disabled={likeProcessing}
            className="hover:text-pink-500 transition flex items-center gap-1"
          >
            <Heart size={18} /> {liked ? 'Liked' : 'Like'} ({likeCount})
          </button>

          <button
            onClick={handleBookmark}
            disabled={bookmarkProcessing}
            className="hover:text-yellow-400 transition flex items-center gap-1"
          >
            <Bookmark size={18} /> {bookmarked ? 'Bookmarked' : 'Bookmark'} ({bookmarkCount})
          </button>

          <button onClick={handleCopyLink} className="hover:text-blue-400 transition flex items-center gap-1">
            <Share2 size={18} /> {copied ? 'Copied!' : 'Share'} ({shareCount})
          </button>
        </div>

        <div className="prose prose-invert max-w-none text-gray-100">
          {article.content ? (
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          ) : (
            <p className="text-gray-500 italic">No content available.</p>
          )}
        </div>

        <div className="mt-10">
          <CommentSection articleId={article.id} />
        </div>
      </div>
    </motion.div>
  );
};

export default ArticlePage;

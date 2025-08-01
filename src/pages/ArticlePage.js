// src/pages/ArticlePage.js
import React, { useState, useEffect, useCallback } from 'react';
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
    if (!article) return;
    try {
      const res = await apiEndpoints.toggleArticleLike(article.id);
      setLiked(!!res.liked);
      setLikeCount(res.likes ?? likeCount);
      localStorage.setItem(`liked-${article.id}`, res.liked);
    } catch (err) {
      console.error('❌ Like toggle failed:', err);
    }
  };

  const handleBookmark = async () => {
    if (!article) return;
    try {
      const res = await apiEndpoints.toggleArticleBookmark(article.id);
      setBookmarked(!!res.bookmarked);
      setBookmarkCount(res.bookmarks ?? bookmarkCount);
      localStorage.setItem(`bookmarked-${article.id}`, res.bookmarked);
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
      {/* Hero */}
      <div className={`relative bg-gradient-to-br ${theme.gradient}`}>
        {article.featured_image && (
          <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${article.featured_image})` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-transparent to-transparent z-10" />
        <div className="relative z-20 px-4 py-16 max-w-4xl mx-auto">
          <Link to="/" className="text-gray-400 hover:text-white mb-3 inline-flex items-center text-sm">
            <ArrowLeft size={18} className="mr-1" /> Back to Articles
          </Link>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${theme.badge}`}>
            {(article.category || 'misc').toUpperCase()}
          </span>
          <h1 className="text-white text-4xl md:text-5xl font-bold mt-4 mb-6">{article.title}</h1>

          <div className="flex flex-wrap gap-6 text-sm text-gray-300 mb-6">
            <span className="flex items-center gap-2"><User size={16} /> {article.author || 'ANIMAC Team'}</span>
            <span className="flex items-center gap-2"><Calendar size={16} /> {new Date(article.created_at).toLocaleDateString()}</span>
            <span className="flex items-center gap-2"><Clock size={16} /> {estimatedReadTime} min read</span>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <button onClick={handleLike} className={`px-4 py-2 rounded flex items-center gap-2 border ${liked ? `${theme.button} text-white` : 'border-gray-600 text-gray-300 hover:text-white'}`}>
              <Heart size={18} fill={liked ? 'currentColor' : 'none'} /> {likeCount} Likes
            </button>

            <button onClick={handleBookmark} className={`px-4 py-2 rounded flex items-center gap-2 border ${bookmarked ? `${theme.button} text-white` : 'border-gray-600 text-gray-300 hover:text-white'}`}>
              <Bookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} /> {bookmarkCount} Bookmarks
            </button>

            <button onClick={() => setShowShareModal(true)} className="px-4 py-2 rounded flex items-center gap-2 border border-gray-600 text-gray-300 hover:text-white">
              <Share2 size={18} /> {shareCount} Shares
            </button>
          </div>
        </div>
      </div>

      {/* Article Body */}
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-16">
        {article.excerpt && (
          <blockquote className="italic border-l-4 border-gray-600 pl-6 text-lg text-gray-400">{article.excerpt}</blockquote>
        )}

        <div className="prose prose-invert prose-lg max-w-none">
          {(article.content || '').split('\n').map((para, i) => {
            const isHighlight = para.includes('**') || para.includes('🔥');
            const content = para.replace(/\*\*(.*?)\*\*/g, (_, m) => m);
            return (
              <p key={i} className={isHighlight ? 'text-yellow-400 font-semibold' : ''}>
                {content}
              </p>
            );
          })}
        </div>

        {/* Tags */}
        {article.tags?.length > 0 && (
          <div className="pt-8 border-t border-gray-700">
            <h3 className="text-white font-semibold mb-4">Tags</h3>
            <div className="flex flex-wrap gap-3">
              {article.tags.map((tag, i) => (
                <span key={i} className={`px-3 py-2 rounded-lg font-inter text-sm border ${theme.badge}`}>#{tag}</span>
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        <CommentSection articleId={article.id} />
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
          <div className="bg-netflix-dark p-6 rounded-lg max-w-sm w-full text-center">
            <h3 className="text-white text-lg font-bold mb-2">Share this article</h3>
            <p className="text-gray-400 mb-4 text-sm">Copy the link below:</p>
            <input
              readOnly
              value={window.location.href}
              onClick={e => e.target.select()}
              className="w-full mb-3 p-2 text-sm rounded bg-gray-800 text-gray-300"
            />
            <button onClick={handleCopyLink} className="w-full py-2 rounded bg-gray-600 text-white hover:bg-gray-500 mb-2">
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
            <button onClick={() => setShowShareModal(false)} className="text-gray-400 hover:text-white underline text-sm">
              Close
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ArticlePage;

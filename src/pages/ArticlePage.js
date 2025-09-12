// src/pages/ArticlePage.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import DOMPurify from 'dompurify';
import { useParams, Link } from 'react-router-dom';
import SEO from '../components/SEO';
import LoadingScreen from '../components/LoadingScreen';
import axios from 'axios';
import {
  ArrowLeft, User, Clock, Calendar, Share2, Bookmark, Heart,
} from 'lucide-react';

import CommentSection from '../components/CommentSection';
import { toggleLikeArticle, toggleBookmarkArticle, getArticleStatus, shareArticle } from '../services/articleService';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://animac-metaverse.onrender.com';

// Get or create unique session ID
const getSessionId = () => {
  let sessionId = localStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('session_id', sessionId);
  }
  return sessionId;
};

// Dynamic category theme
const getTheme = (category) => {
  const cat = category?.toLowerCase();
  const map = {
    east: ['from-east-900/50 via-netflix-dark to-netflix-black', 'neon-glow border-east-400 text-east-300 bg-east-800/20'],
    west: ['from-west-900/50 via-netflix-dark to-netflix-black', 'neon-glow border-west-400 text-west-300 bg-west-800/20'],
  };
  return {
    gradient: map[cat]?.[0] || 'from-gray-900 via-netflix-dark to-netflix-black',
    badge: map[cat]?.[1] || 'neon-glow border-gray-500 text-gray-300 bg-gray-800/20',
  };
};

const ArticlePage = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [shared, setShared] = useState(false);
  const [copied, setCopied] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [shareCount, setShareCount] = useState(0);
  const [likeProcessing, setLikeProcessing] = useState(false);
  const [bookmarkProcessing, setBookmarkProcessing] = useState(false);

  // Fetch article and related
  const fetchArticle = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/articles/${slug}`);
      const data = res.data;
      setArticle(data);
      setLikeCount(data.likes ?? 0);
      setBookmarkCount(data.bookmarks ?? 0);
      setShareCount(data.shares ?? 0);

      // Fetch session-specific status
      try {
        const status = await getArticleStatus(data.id, getSessionId());
        setLiked(!!status.liked);
        setBookmarked(!!status.bookmarked);
        setShared(!!status.shared);
      } catch (e) {
        // Non-blocking; proceed without session status
        console.log('Could not fetch session status:', e.message);
      }

      // Fetch related articles
      const relRes = await axios.get(`${API_URL}/api/articles`, {
        params: { category: data.category, limit: 3, is_published: true },
      });
      const related = relRes.data.filter(a => a.slug !== slug);
      setRelatedArticles(related);

      setError(null);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error(err);
      setError('Article not found or failed to load.');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  // Scroll listener for back button
  useEffect(() => {
    const handleScroll = () => {
      const backButton = document.getElementById('back-home-btn');
      if (backButton) backButton.classList.toggle('collapsed', window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Copy link handler
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      // Count share once per session via backend
      try {
        if (article?.id && !shared) {
          await shareArticle(article.id, getSessionId());
          setShareCount(prev => prev + 1);
          setShared(true);
        }
      } catch (e) {
        // Already shared for this session; ignore
        console.log('Share already counted for this session');
      }
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  // Like handler
  const handleLike = async () => {
    if (!article?.id || likeProcessing) return;
    setLikeProcessing(true);
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount(prev => newLiked ? prev + 1 : Math.max(prev - 1, 0));
    try {
      await toggleLikeArticle(article.id, getSessionId(), liked);
    } catch (err) {
      console.error(err);
    } finally {
      setLikeProcessing(false);
    }
  };

  // Bookmark handler
  const handleBookmark = async () => {
    if (!article?.id || bookmarkProcessing) return;
    setBookmarkProcessing(true);
    const newState = !bookmarked;
    setBookmarked(newState);
    setBookmarkCount(prev => newState ? prev + 1 : Math.max(prev - 1, 0));
    try {
      await toggleBookmarkArticle(article.id, getSessionId(), bookmarked);
    } catch (err) {
      console.error(err);
    } finally {
      setBookmarkProcessing(false);
    }
  };

  // Memoized theme & read time
  const theme = useMemo(() => getTheme(article?.category), [article]);
  const readTime = useMemo(() => {
    if (!article?.content) return 1;
    return Math.ceil(article.content.split(/\s+/).length / 200);
  }, [article]);

  if (loading) return <LoadingScreen />;

  if (error || !article) {
    return (
      <div className="min-h-screen pt-20 bg-netflix-black flex items-center justify-center">
        <h2 className="text-white">{error || 'Article Not Found'}</h2>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={article.title}
        description={article.excerpt || 'Read this amazing article on Animac Metaverse.'}
        url={`/article/${article.slug}`}
        image={article.featured_image || '/assets/buzzfeed-purple.jpg'}
        type="article"
        author={article.author}
        publishedTime={article.created_at}
        modifiedTime={article.updated_at}
        section={article.category}
        tags={article.tags || []}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`min-h-screen bg-gradient-to-b ${theme.gradient} text-gray-200`}
      >
        {/* Hero */}
        <div className="relative h-[420px] sm:h-[500px] overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${article.featured_image || '/default-cover.jpg'})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent z-10" />
          <div className="absolute inset-0 z-20 flex items-end justify-center text-center px-6 pb-10">
            <div className="bg-black/40 backdrop-blur-sm p-6 rounded-xl max-w-3xl">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
                {article.title?.trim()}
              </h1>
              {article.excerpt && <p className="text-lg text-gray-300 italic">{article.excerpt}</p>}
            </div>
          </div>
        </div>

        {/* Start Divider */}
        <div className="relative flex-1 mx-4 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 animate-pulse shadow-lg rounded-full">
          <span className="font-azonix absolute left-1/2 -translate-x-1/2 -top-6 text-purple-400 font-bold text-sm md:text-base animate-pulse drop-shadow-lg">
            START
          </span>
        </div>

        {/* Content */}
        <div className="bg-gradient-to-b from-black via-black/95 to-netflix-black">
          <div className="container mx-auto px-4 py-14 max-w-4xl">
            {/* Meta + Actions */}
            <div className="bg-grey/60 p-6 rounded-xl max-w-3xl">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-16">
                <Link
                  id="back-home-btn"
                  to="/"
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium neon-glow backdrop-blur-md bg-black/50 hover:bg-black/70 text-white border ${theme.badge}`}
                >
                  <ArrowLeft size={18} /> Back to Home
                </Link>
                <span className={`px-4 py-2 rounded-full text-sm border ${theme.badge}`}>
                  {article.category?.toUpperCase() || 'FEATURED'}
                </span>
              </div>

              <div className="text-sm text-gray-400 flex gap-4 mb-8 mt-8">
                <span><User size={14} /> {article.author || 'Unknown'}</span>
                <span><Calendar size={14} /> {new Date(article.created_at).toLocaleDateString()}</span>
                <span><Clock size={14} /> {readTime} min read</span>
              </div>

              <div className="flex flex-wrap gap-4 mb-10 text-gray-300">
                <button 
                  onClick={handleLike} 
                  disabled={likeProcessing} 
                  aria-label="Like Article" 
                  className={`flex items-center gap-1 transition-colors duration-200 ${
                    liked 
                      ? 'text-pink-500 bg-pink-500/20 border border-pink-500/30 px-3 py-1 rounded-full' 
                      : 'hover:text-pink-500'
                  }`}
                >
                  <Heart size={18} fill={liked ? 'currentColor' : 'none'} /> 
                  {liked ? 'Liked' : 'Like'} ({likeCount})
                </button>
                <button 
                  onClick={handleBookmark} 
                  disabled={bookmarkProcessing} 
                  aria-label="Bookmark Article" 
                  className={`flex items-center gap-1 transition-colors duration-200 ${
                    bookmarked 
                      ? 'text-yellow-400 bg-yellow-400/20 border border-yellow-400/30 px-3 py-1 rounded-full' 
                      : 'hover:text-yellow-400'
                  }`}
                >
                  <Bookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} /> 
                  {bookmarked ? 'Bookmarked' : 'Bookmark'} ({bookmarkCount})
                </button>
                <button 
                  onClick={handleCopyLink} 
                  aria-label="Share Article" 
                  className={`flex items-center gap-1 transition-colors duration-200 ${
                    shared 
                      ? 'text-blue-400 bg-blue-400/20 border border-blue-400/30 px-3 py-1 rounded-full' 
                      : 'hover:text-blue-400'
                  }`}
                >
                  <Share2 size={18} fill={shared ? 'currentColor' : 'none'} /> 
                  {copied ? 'Copied' : shared ? 'Shared' : 'Share'} ({shareCount})
                </button>
              </div>
            </div>

            {/* Body */}
            <div
              className="prose prose-invert max-w-none text-lg space-y-6 font-inter"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />


            {/* End Divider */}
            <div className="mt-14 mb-10 relative flex-1 mx-4 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 animate-pulse shadow-lg rounded-full">
              <span className="font-azonix absolute left-1/2 -translate-x-1/2 -top-6 text-blue-400 font-bold text-sm md:text-base animate-pulse drop-shadow-lg">
                END
              </span>
            </div>

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <div className="mt-16">
                <h3 className="text-white font-azonix text-2xl mb-4">Related Articles</h3>
                <div className="grid gap-6 sm:grid-cols-2">
                  {relatedArticles.map(rel => (
                    <Link key={rel.id} to={`/article/${rel.slug}`} className="neon-glow border border-white-700 bg-black/20 hover:bg-black/40 p-4 rounded-lg transition relative overflow-hidden">
                      {rel.featured_image && (
                        <div className="h-40 bg-cover bg-center rounded-md mb-3" style={{ backgroundImage: `url(${rel.featured_image})` }} />
                      )}
                      <h4 className="text-lg font-semibold text-white">{rel.title}</h4>
                      <p className="text-gray-400 truncate">{rel.excerpt}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {article.tags?.length > 0 && (
              <div className="mt-12">
                <h3 className="text-white font-azonix mb-4">Tags</h3>
                <div className="flex flex-wrap gap-3">
                  {article.tags.map((tag, i) => (
                    <span key={i} className={`px-3 py-2 rounded-lg text-sm border ${theme.badge}`}>#{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Comments */}
            <div className="mt-12">
              <CommentSection articleId={article.id} />
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default ArticlePage;

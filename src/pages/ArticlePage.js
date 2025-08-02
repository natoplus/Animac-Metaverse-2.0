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
  const [related, setRelated] = useState([]);
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

      const rel = await axios.get(`${API_URL}/api/articles`, {
        params: { category: data.category, limit: 3, is_published: true }
      });
      setRelated(rel.data.filter(a => a.id !== id));

      setError(null);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error(err);
      setError('Article not found or failed to load.');
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
    } catch {}
  };

  const handleLike = async () => {
    if (!article?.id || likeProcessing) return;
    setLikeProcessing(true);
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount(prev => newLiked ? prev + 1 : Math.max(prev - 1, 0));
    await toggleLikeArticle(article.id, getSessionId()).catch(console.error);
    setLikeProcessing(false);
  };

  const handleBookmark = async () => {
    if (!article?.id || bookmarkProcessing) return;
    setBookmarkProcessing(true);
    const newB = !bookmarked;
    setBookmarked(newB);
    setBookmarkCount(prev => newB ? prev + 1 : Math.max(prev - 1, 0));
    await toggleBookmarkArticle(article.id, getSessionId()).catch(console.error);
    setBookmarkProcessing(false);
  };

  const getTheme = category => {
    switch (category?.toLowerCase()) {
      case 'east':
        return { gradient: 'from-east-900/50 via-netflix-dark to-netflix-black', badge: 'neon-glow border-east-400 text-east-300 bg-east-800/20' };
      case 'west':
        return { gradient: 'from-west-900/50 via-netflix-dark to-netflix-black', badge: 'neon-glow border-west-400 text-west-300 bg-west-800/20' };
      default:
        return { gradient: 'from-gray-900 via-netflix-dark to-netflix-black', badge: 'neon-glow border-gray-500 text-gray-300 bg-gray-800/20' };
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const backButton = document.getElementById('back-home-btn');
      if (!backButton) return;
      backButton.classList.toggle('collapsed', window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) return <div className="min-h-screen pt-20 bg-netflix-black flex justify-center items-center"><Loader className="animate-spin text-gray-400" size={24}/> Loading...</div>;
  if (error || !article) return <div className="min-h-screen pt-20 bg-netflix-black flex items-center justify-center"><h2 className="text-white">Article Not Found</h2></div>;

  const theme = getTheme(article.category);
  const readTime = article.read_time || Math.ceil((article.content || '').split(' ').length / 200);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className={`min-h-screen bg-gradient-to-b ${theme.gradient} text-gray-200`}>

      {/* Hero Section */}
      <div className="relative h-[420px] sm:h-[500px] overflow-hidden">
        {article.featured_image && (
          <motion.div initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${article.featured_image})` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent z-10" />


        <div className="absolute inset-0 z-20 flex items-end justify-center text-center px-6 pb-10">
          <div className="bg-black/40 backdrop-blur-sm p-6 rounded-xl max-w-3xl">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">{article.title}</h1>
            {article.excerpt && <p className="text-lg text-gray-300 italic">{article.excerpt}</p>}
          </div>
        </div>
      </div>

      {/* Neon divider */}
      <div className="w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 animate-pulse shadow-lg" />

      {/* Body */}
      <div className="bg-gradient-to-b from-black via-black/95 to-netflix-black">
        <div className="container mx-auto px-4 py-14 max-w-4xl">

        
          <div className="bg-grey/60 p-6 rounded-xl max-w-3xl">

              <div className="top-4 left-6 bottom-3 z-30 transition-transform duration-300" id="back-home-btn">
                <Link to="/" className="inline-flex items-center neon-glow text-white bg-black/50 px-4 py-2 rounded-full text-sm hover:bg-black/70 backdrop-blur-md">
                  <ArrowLeft size={18} className="mr-2"/> Back to Home
                </Link>
              </div>

              <span className={`inline-block px-4 py-2 rounded-full text-sm font-inter border ${theme.badge} mb-6`}>
               {article.category?.toUpperCase() || 'FEATURED'}
              </span>

             <div className="text-sm text-gray-400 flex gap-4 mb-6">
                <span><User size={14}/> {article.author}</span>
                <span><Calendar size={14}/> {new Date(article.created_at).toLocaleDateString()}</span>
                <span><Clock size={14}/> {readTime} min read</span>
             </div>

             <div className="flex flex-wrap gap-4 mb-10 text-gray-300">
                <button onClick={handleLike} disabled={likeProcessing} className="flex items-center gap-1 hover:text-pink-500"><Heart size={18}/>{liked ? 'Liked' : 'Like'} ({likeCount})</button>
                <button onClick={handleBookmark} disabled={bookmarkProcessing} className="flex items-center gap-1 hover:text-yellow-400"><Bookmark size={18}/>{bookmarked ? 'Bookmarked' : 'Bookmark'} ({bookmarkCount})</button>
                <button onClick={handleCopyLink} className="flex items-center gap-1 hover:text-blue-400"><Share2 size={18}/>{copied ? 'Copied' : 'Share'} ({shareCount})</button>
             </div>

          </div>

          <div className="prose prose-invert max-w-none text-lg space-y-6 font-inter">
            {article.content.split('\n').map((p, i) => <p key={i}>{p.trim()}</p>)}
          </div>

          {related.length > 0 && (
            <div className="mt-16">
              <h3 className="text-white text-2xl mb-4">Related Articles</h3>
              <div className="grid gap-6 sm:grid-cols-2">
                {related.map(rel => (
                  <Link key={rel.id} to={`/article/${rel.id}`} className="neon-glow border border-gray-700 bg-black/20 hover:bg-black/40 p-4 rounded-lg transition relative overflow-hidden">
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

          {article.tags?.length > 0 && (
            <div className="mt-12">
              <h3 className="text-white mb-4">Tags</h3>
              <div className="flex flex-wrap gap-3">
                {article.tags.map((tag, i) => (
                  <span key={i} className={`px-3 py-2 rounded-lg text-sm border ${theme.badge}`}>#{tag}</span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-12"><CommentSection articleId={article.id}/></div>
        </div>
      </div>
    </motion.div>
  );
};

export default ArticlePage;

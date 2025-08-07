// ...[Imports remain unchanged]
import React, { useState, useEffect, useRef } from 'react';
import { ThumbsUp, ThumbsDown, MessageCircle, X, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://animac-metaverse.onrender.com';

const getSessionId = () => {
  let sessionId = localStorage.getItem("sessionId");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("sessionId", sessionId);
  }
  return sessionId;
};

const Comment = ({
  comment,
  allComments,
  onReplyClick,
  onVote,
  upvotedComments,
  downvotedComments,
  toggleReplies,
  showReplies,
  replyCounts,
  downvoteCounts,
  depth = 0,
}) => {
  const isUpvoted = comment.liked_by_user || upvotedComments.includes(comment.id);
  const isDownvoted = comment.disliked_by_user || downvotedComments.includes(comment.id);
  const voteScore = comment.likes || 0;
  const replyCount = replyCounts[comment.id] || 0;
  const downvoteCount = downvoteCounts?.[comment.id] ?? comment.downvotes ?? 0;
  const replies = allComments.filter((c) => c.parent_id === comment.id);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="bg-[#111] p-4 rounded-xl mb-3 text-gray-200 border border-purple-500/20"
      style={{ marginLeft: depth * 16 }}
    >
      <p className="mb-2">{comment.content || '[Deleted]'}</p>
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>
          by <span className="text-purple-400">{comment.author?.trim() || 'Anonymous'}</span> •{' '}
          {new Date(comment.created_at).toLocaleString()} • {replyCount} repl{replyCount === 1 ? 'y' : 'ies'}
        </span>
        <div className="flex gap-3 items-center">
          <button
            onClick={() => onVote(comment.id, 'up')}
            className={`hover:text-purple-400 ${isUpvoted ? 'text-purple-500' : 'text-gray-400'}`}
          >
            <ThumbsUp size={16} fill={isUpvoted ? 'currentColor' : 'none'} />
          </button>
          <span className="text-gray-300 font-semibold">{voteScore}</span>

          <button
            onClick={() => onVote(comment.id, 'down')}
            className={`hover:text-red-400 ${isDownvoted ? 'text-red-400' : 'text-gray-400'}`}
          >
            <ThumbsDown size={16} fill={isDownvoted ? 'currentColor' : 'none'} />
          </button>
          <span className="text-red-400 font-semibold">{downvoteCount}</span>

          <button
            onClick={() => onReplyClick(comment)}
            className="hover:text-white flex items-center gap-1 text-gray-400"
          >
            <MessageCircle size={14} />
            <span>Reply</span>
          </button>

          {replyCount > 0 && (
            <button
              onClick={() => toggleReplies(comment.id)}
              className="text-blue-400 hover:text-white ml-2 flex items-center gap-1"
            >
              {showReplies[comment.id] ? <><ChevronUp size={14} /> Hide</> : <><ChevronDown size={14} /> View</>}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showReplies[comment.id] && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {replies.map((reply) => (
              <Comment
                key={reply.id}
                comment={reply}
                allComments={allComments}
                onReplyClick={onReplyClick}
                onVote={onVote}
                upvotedComments={upvotedComments}
                downvotedComments={downvotedComments}
                toggleReplies={toggleReplies}
                showReplies={showReplies}
                replyCounts={replyCounts}
                downvoteCounts={downvoteCounts}
                depth={depth + 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const CommentSection = ({ articleId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [guestName, setGuestName] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [visibleCount, setVisibleCount] = useState(5);
  const [upvotedComments, setUpvotedComments] = useState([]);
  const [showReplies, setShowReplies] = useState({});

  useEffect(() => {
    fetchComments();
  }, [articleId]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`${API_URL}/api/comments/${articleId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setComments(data);
      } else {
        console.error('Unexpected response:', data);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const body = {
        article_id: articleId,
        content: newComment,
        guest_name: guestName,
        ...(replyingTo && { reply_to: replyingTo }),
      };

      const res = await fetch(`${API_URL}/api/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const savedComment = await res.json();
        setComments((prev) => [savedComment, ...prev]);
        setNewComment('');
        setGuestName('');
        setReplyingTo(null);
        fetchComments(); // Refresh to reflect nested count
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  const toggleReplies = (commentId) => {
    setShowReplies((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  const handleLike = async (commentId) => {
    try {
      const res = await fetch(`${API_URL}/api/comments/${commentId}/like`, {
        method: 'POST',
      });

      if (res.ok) {
        setUpvotedComments((prev) =>
          prev.includes(commentId)
            ? prev.filter((id) => id !== commentId)
            : [...prev, commentId]
        );
        fetchComments();
      }
    } catch (err) {
      console.error('Error liking comment:', err);
    }
  };

  const parentComments = comments.filter((c) => !c.reply_to);
  const getReplies = (commentId) => comments.filter((c) => c.reply_to === commentId);

  const renderComment = (comment, level = 0) => {
    const isLiked = upvotedComments.includes(comment.id);
    const replies = getReplies(comment.id);
    const isReplying = replyingTo === comment.id;

    return (
      <motion.div
        key={comment.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className={`bg-[#111] p-4 rounded-lg mb-3 shadow-md border border-gray-800 ${level > 0 ? 'ml-4 md:ml-8' : ''}`}
      >
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-400">@{comment.guest_name || 'Anonymous'}</p>
            <p className="text-base text-white mt-1">{comment.content}</p>
          </div>
          <button onClick={() => setReplyingTo(isReplying ? null : comment.id)}>
            <MessageCircle size={16} className="text-gray-400 hover:text-white" />
          </button>
        </div>

        <div className="flex items-center mt-2 space-x-4 text-gray-400 text-sm">
          <button onClick={() => handleLike(comment.id)} className="flex items-center space-x-1 hover:text-white">
            <ThumbsUp size={16} />
            <span>{comment.likes}</span>
          </button>

          {replies.length > 0 && (
            <button onClick={() => toggleReplies(comment.id)} className="hover:text-white">
              {showReplies[comment.id] ? 'Hide' : `View ${comment.reply_count || replies.length} Replies`}
            </button>
          )}
        </div>

        {isReplying && (
          <form onSubmit={handleSubmit} className="mt-3 space-y-2">
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-[#222] p-2 rounded-md text-white text-sm"
            />
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a reply..."
              className="w-full bg-[#222] p-2 rounded-md text-white text-sm"
              rows={2}
            />
            <div className="flex justify-end space-x-2">
              <button type="button" onClick={() => setReplyingTo(null)} className="text-gray-400 text-sm">
                Cancel
              </button>
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm">
                Reply
              </button>
            </div>
          </form>
        )}

        <AnimatePresence>
          {showReplies[comment.id] && replies.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-4"
            >
              {replies.map((reply) => renderComment(reply, level + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto text-white">
      <h3 className="text-xl font-semibold mb-4">Comments</h3>

      <form onSubmit={handleSubmit} className="space-y-3 mb-8">
        <input
          type="text"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          placeholder="Your name"
          className="w-full bg-[#222] p-2 rounded-md text-white text-sm"
        />
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="w-full bg-[#222] p-3 rounded-md text-white text-sm"
          rows={3}
        />
        <button type="submit" className="bg-red-600 hover:bg-red-700 px-4 py-2 text-sm rounded-md">
          Post Comment
        </button>
      </form>

      <AnimatePresence>
        {parentComments.slice(0, visibleCount).map((comment) => renderComment(comment))}
      </AnimatePresence>

      {visibleCount < parentComments.length && (
        <div className="text-center mt-4">
          <button
            onClick={() => setVisibleCount((prev) => prev + 5)}
            className="text-sm text-blue-400 hover:underline"
          >
            Load more comments
          </button>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
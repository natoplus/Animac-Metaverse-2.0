import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://animac-metaverse.onrender.com';

// Generate or retrieve session ID from localStorage
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
  replies,
  onReplyClick,
  onVote,
  upvotedComments,
  downvotedComments,
  toggleReplies,
  showReplies,
  replyCounts,
  downvoteCounts,
}) => {
  const isUpvoted = upvotedComments.includes(comment.id);
  const isDownvoted = downvotedComments.includes(comment.id);
  const voteScore = (comment.likes || 0) - (comment.dislikes || 0);
  const replyCount = replyCounts[comment.id] || 0;
  const downvoteCount = downvoteCounts[comment.id] || 0;
  const sessionId = getSessionId(); // ✅ get session ID


  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="bg-[#111] p-4 rounded-xl mb-3 text-gray-200 border border-purple-500/20"
    >
      <p className="mb-2">{comment.content || '[Deleted]'}</p>
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>
          by <span className="text-purple-400">{comment.author || 'Anonymous'}</span> •{' '}
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
              className="text-blue-400 hover:text-white ml-2"
            >
              {showReplies[comment.id] ? 'Hide Replies' : 'View Replies'}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showReplies[comment.id] &&
          replies.map((reply) => (
            <motion.div
              key={reply.id}
              className="ml-4 mt-3 border-l border-purple-800/30 pl-4"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <Comment
                comment={reply}
                replies={[]}
                onReplyClick={onReplyClick}
                onVote={onVote}
                upvotedComments={upvotedComments}
                downvotedComments={downvotedComments}
                toggleReplies={toggleReplies}
                showReplies={showReplies}
                replyCounts={replyCounts}
                downvoteCounts={downvoteCounts}
              />
            </motion.div>
          ))}
      </AnimatePresence>
    </motion.div>
  );
};

const CommentSection = ({ articleId }) => {
  const [comments, setComments] = useState([]);
  const [visibleCount, setVisibleCount] = useState(5);
  const [upvotedComments, setUpvotedComments] = useState([]);
  const [downvotedComments, setDownvotedComments] = useState([]);
  const [showReplies, setShowReplies] = useState({});
  const [alias, setAlias] = useState('');
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyCounts, setReplyCounts] = useState({});
  const [downvoteCounts, setDownvoteCounts] = useState({});

  const fetchComments = async () => {
    try {
      const res = await fetch(`${API_URL}/api/comments?article_id=${articleId}`);
      const data = await res.json();
      setComments(data || []);

      const repliesMap = {};
      const downvotesMap = {};

      data.forEach((comment) => {
        if (comment.parent_id) {
          repliesMap[comment.parent_id] = (repliesMap[comment.parent_id] || 0) + 1;
        }
        if (comment.dislikes) {
          downvotesMap[comment.id] = comment.dislikes;
        }
      });

      setReplyCounts(repliesMap);
      setDownvoteCounts(downvotesMap);
    } catch (err) {
      console.error('Error loading comments:', err);
    }
  };

  useEffect(() => {
    if (articleId) fetchComments();
  }, [articleId]);

  const handleVote = async (commentId, type) => {
    const sessionId = getSessionId(); // ✅ get session ID

    try {
      await fetch(`${API_URL}/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_id: sessionId, type }), // ✅ send session_id and type
      });

      if (type === 'up') {
        setUpvotedComments((prev) =>
          prev.includes(commentId) ? prev.filter((id) => id !== commentId) : [...prev, commentId]
        );
      } else {
        setDownvotedComments((prev) =>
          prev.includes(commentId) ? prev.filter((id) => id !== commentId) : [...prev, commentId]
        );
      }

      fetchComments();
    } catch (err) {
      console.error('Voting error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const body = {
      content: newComment,
      author: alias,
      article_id: articleId,
      parent_id: replyTo?.id || null,
    };

    try {
      await fetch(`${API_URL}/api/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      setNewComment('');
      setReplyTo(null);
      fetchComments();
    } catch (err) {
      console.error('Submit error:', err);
    }
  };

  const toggleReplies = (commentId) => {
    setShowReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const groupReplies = (parentId) => comments.filter((c) => c.parent_id === parentId);
  const topLevelComments = comments.filter((c) => !c.parent_id);

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold text-white mb-4">Comments</h3>

      <form
        onSubmit={handleSubmit}
        className="mb-6 p-4 rounded-xl border border-white backdrop-blur bg-black/60 neon-glow"
      >
        {replyTo && (
          <div className="mb-2 flex items-center justify-between text-sm text-purple-400">
            Replying to: {replyTo.author || 'Anonymous'}
            <button
              onClick={() => setReplyTo(null)}
              type="button"
              className="text-red-500 hover:text-red-700"
            >
              <X size={16} />
            </button>
          </div>
        )}
        <input
          type="text"
          className="w-full mb-2 p-2 rounded-md border border-gray-700 bg-black/80 text-white"
          placeholder="Your alias (optional)"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
        />
        <textarea
          className="w-full p-3 rounded-md border border-gray-700 bg-black/80 text-white focus:outline-none"
          rows="4"
          placeholder={replyTo ? 'Write your reply...' : 'Add a comment...'}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button
          type="submit"
          className="mt-3 px-4 py-2 rounded-full border border-white text-white hover:bg-purple-700/20 backdrop-blur-md bg-black/50 neon-glow"
        >
          {replyTo ? 'Post Reply' : 'Post Comment'}
        </button>
      </form>

      <AnimatePresence>
        {topLevelComments.slice(0, visibleCount).map((comment) => (
          <Comment
            key={comment.id}
            comment={comment}
            replies={groupReplies(comment.id)}
            onReplyClick={setReplyTo}
            onVote={handleVote}
            upvotedComments={upvotedComments}
            downvotedComments={downvotedComments}
            toggleReplies={toggleReplies}
            showReplies={showReplies}
            replyCounts={replyCounts}
            downvoteCounts={downvoteCounts}
          />
        ))}
      </AnimatePresence>

      {visibleCount < topLevelComments.length && (
        <button
          onClick={() => setVisibleCount((prev) => prev + 5)}
          className="text-purple-400 mt-4 hover:underline"
        >
          Load more comments
        </button>
      )}
    </div>
  );
};

export default CommentSection;

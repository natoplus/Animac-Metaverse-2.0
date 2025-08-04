import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://animac-metaverse.onrender.com';

const Comment = ({
  comment,
  replies,
  onReplyClick,
  onVote,
  upvotedComments,
  downvotedComments,
  toggleReplies,
  showReplies,
}) => {
  const isUpvoted = upvotedComments.includes(comment.id);
  const isDownvoted = downvotedComments.includes(comment.id);
  const voteScore = comment.score ?? ((comment.likes || 0) - (comment.dislikes || 0));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="bg-gray-900 p-4 rounded-lg mb-3 text-gray-200 text-sm"
    >
      <p className="mb-2">{comment.content || '[Deleted]'}</p>
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>
          by <span className="text-blue-400">{comment.author || 'Anonymous'}</span> •{' '}
          {new Date(comment.created_at).toLocaleString()}
          {replies.length > 0 && (
            <span className="ml-2 text-blue-400">
              • {replies.length} repl{replies.length === 1 ? 'y' : 'ies'}
            </span>
          )}
        </span>
        <div className="flex gap-3 items-center">
          <button
            onClick={() => onVote(comment.id, 'up')}
            className={`hover:text-green-500 ${isUpvoted ? 'text-green-400' : 'text-gray-400'}`}
          >
            <ThumbsUp size={16} fill={isUpvoted ? 'currentColor' : 'none'} />
          </button>
          <span className="text-gray-400 font-semibold">{voteScore}</span>
          <button
            onClick={() => onVote(comment.id, 'down')}
            className={`hover:text-red-500 ${isDownvoted ? 'text-red-400' : 'text-gray-400'}`}
          >
            <ThumbsDown size={16} fill={isDownvoted ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={() => onReplyClick(comment)}
            className="hover:text-white flex items-center gap-1 text-gray-400"
          >
            <MessageCircle size={14} />
            <span>Reply</span>
          </button>
          {replies.length > 0 && (
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
              className="ml-4 mt-3 border-l-2 border-gray-700 pl-4"
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

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`${API_URL}/api/comments?article_id=${articleId}`);
        const data = await res.json();
        setComments(data || []);
      } catch (err) {
        console.error('Error loading comments:', err);
      }
    };

    if (articleId) fetchComments();
  }, [articleId]);

  const handleVote = async (commentId, type) => {
    try {
      await fetch(`${API_URL}/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

      const res = await fetch(`${API_URL}/api/comments?article_id=${articleId}`);
      const data = await res.json();
      setComments(data || []);
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

      const res = await fetch(`${API_URL}/api/comments?article_id=${articleId}`);
      const data = await res.json();
      setComments(data || []);
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

      {/* Comment/Reply Form */}
      <form onSubmit={handleSubmit} className="mb-6 bg-gray-800 p-4 rounded-lg shadow-inner">
        {replyTo && (
          <div className="mb-2 flex items-center justify-between text-sm text-blue-400">
            Replying to: {replyTo.author || 'Anonymous'}
            <button
              onClick={() => setReplyTo(null)}
              type="button"
              className="text-red-400 hover:text-red-600"
            >
              <X size={16} />
            </button>
          </div>
        )}
        <input
          type="text"
          className="w-full mb-2 p-2 rounded-md bg-gray-700 text-white placeholder-gray-400"
          placeholder="Your alias (optional)"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
        />
        <textarea
          className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="4"
          placeholder={replyTo ? 'Write your reply...' : 'Add a comment...'}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button
          type="submit"
          className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
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
          />
        ))}
      </AnimatePresence>

      {visibleCount < topLevelComments.length && (
        <button
          onClick={() => setVisibleCount((prev) => prev + 5)}
          className="text-blue-400 mt-4 hover:underline"
        >
          Load more comments
        </button>
      )}
    </div>
  );
};

export default CommentSection;

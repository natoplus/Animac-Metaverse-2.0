import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://animac-metaverse.onrender.com';

const Comment = ({
  comment,
  replies,
  onReply,
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
          by {comment.author || 'Anonymous'} •{' '}
          {new Date(comment.created_at).toLocaleString()}
          {replies.length > 0 && (
            <span className="ml-2 text-blue-400">
              • {replies.length} repl{replies.length === 1 ? 'y' : 'ies'}
            </span>
          )}
        </span>
        <div className="flex gap-3 items-center">
          <div className="flex gap-2 items-center">
            <button
              onClick={() => onVote(comment.id, 'up')}
              className={`hover:text-green-500 ${isUpvoted ? 'text-green-400' : 'text-gray-400'}`}
              aria-label="Upvote"
            >
              <ThumbsUp
                size={16}
                fill={isUpvoted ? 'currentColor' : 'none'}
                stroke="currentColor"
              />
            </button>
            <span className="text-gray-400 font-semibold">{voteScore}</span>
            <button
              onClick={() => onVote(comment.id, 'down')}
              className={`hover:text-red-500 ${isDownvoted ? 'text-red-400' : 'text-gray-400'}`}
              aria-label="Downvote"
            >
              <ThumbsDown
                size={16}
                fill={isDownvoted ? 'currentColor' : 'none'}
                stroke="currentColor"
              />
            </button>
          </div>
          <button
            onClick={() => onReply(comment.id)}
            className="hover:text-white flex items-center gap-1 text-gray-400"
            aria-label="Reply"
          >
            <MessageCircle size={14} />
            <span>Reply</span>
          </button>
          {replies.length > 0 && (
            <button
              onClick={() => toggleReplies(comment.id)}
              className="text-blue-400 hover:text-white ml-2"
              aria-label="Toggle replies"
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
                onReply={onReply}
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

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const baseURL = 'https://animac-metaverse.onrender.com'; // Use .env if needed
        const res = await fetch(`${baseURL}/api/comments/${articleId}`);
        const data = await res.json();
        setComments(data.comments || []);
      } catch (err) {
        console.error('Error loading comments:', err);
      }
    };
    fetchComments();
  }, [articleId]);

  const handleVote = async (commentId, type) => {
    try {
      await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
        body: JSON.stringify({ type }),
        headers: { 'Content-Type': 'application/json' },
      });

      setUpvotedComments((prev) =>
        type === 'up'
          ? prev.includes(commentId)
            ? prev.filter((id) => id !== commentId)
            : [...prev, commentId]
          : prev
      );
      setDownvotedComments((prev) =>
        type === 'down'
          ? prev.includes(commentId)
            ? prev.filter((id) => id !== commentId)
            : [...prev, commentId]
          : prev
      );

      // Refresh comment score
      const res = await fetch(`/api/articles/${articleId}/comments`);
      const data = await res.json();
      setComments(data.comments || []);
    } catch (err) {
      console.error('Voting error:', err);
    }
  };

  const handleReply = async (parentId) => {
    const content = prompt('Enter your reply:');
    if (!content) return;

    try {
      await fetch(`/api/comments/${parentId}/reply`, {
        method: 'POST',
        body: JSON.stringify({ content }),
        headers: { 'Content-Type': 'application/json' },
      });
      const res = await fetch(`/api/articles/${articleId}/comments`);
      const data = await res.json();
      setComments(data.comments || []);
    } catch (err) {
      console.error('Reply error:', err);
    }
  };

  const toggleReplies = (commentId) => {
    setShowReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const groupReplies = (parentId) =>
    comments.filter((c) => c.parent_id === parentId);

  const topLevelComments = comments.filter((c) => !c.parent_id);

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold text-white mb-4">Comments</h3>
      <AnimatePresence>
        {topLevelComments.slice(0, visibleCount).map((comment) => (
          <Comment
            key={comment.id}
            comment={comment}
            replies={groupReplies(comment.id)}
            onReply={handleReply}
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
          className="text-blue-500 mt-4 hover:underline"
        >
          Load more comments
        </button>
      )}
    </div>
  );
};

export default CommentSection;

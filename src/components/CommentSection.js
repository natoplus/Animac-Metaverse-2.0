// CommentSection.js
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
  const replies = comment.replies || [];

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
            className={`flex items-center gap-1 ${isUpvoted ? 'text-green-400' : 'text-gray-400 hover:text-white'}`}
          >
            <ThumbsUp size={14} />
            <span>{voteScore}</span>
          </button>
          <button
            onClick={() => onVote(comment.id, 'down')}
            className={`flex items-center gap-1 ${isDownvoted ? 'text-red-400' : 'text-gray-400 hover:text-white'}`}
          >
            <ThumbsDown size={14} />
            <span>{downvoteCount}</span>
          </button>
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
              {showReplies[comment.id] ? (
                <>
                  <ChevronUp size={14} /> Hide
                </>
              ) : (
                <>
                  <ChevronDown size={14} /> View
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showReplies[comment.id] && replies.length > 0 && (
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
  const [visibleCount, setVisibleCount] = useState(5);
  const [upvotedComments, setUpvotedComments] = useState([]);
  const [downvotedComments, setDownvotedComments] = useState([]);
  const [showReplies, setShowReplies] = useState({});
  const [alias, setAlias] = useState('');
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyCounts, setReplyCounts] = useState({});
  const [downvoteCounts, setDownvoteCounts] = useState({});

  const replyFormRef = useRef();

  const fetchComments = async () => {
    try {
      const sessionId = getSessionId();
      const res = await fetch(`${API_URL}/api/comments/${articleId}`, {
        headers: { 'session-id': sessionId },
      });

      const data = await res.json();
      if (!Array.isArray(data)) {
        console.error('Invalid comments data from backend:', data);
        setComments([]);
        return;
      }

      const repliesMap = {};
      const downvotesMap = {};
      const likedIds = [];
      const dislikedIds = [];

      // Prepare comment map with empty replies
      const commentMap = {};
      data.forEach((comment) => {
        comment.replies = [];
        commentMap[comment.id] = comment;

        if (comment.parent_id) {
          repliesMap[comment.parent_id] = (repliesMap[comment.parent_id] || 0) + 1;
        }
        if (comment.downvotes || comment.dislikes) {
          downvotesMap[comment.id] = comment.downvotes ?? comment.dislikes;
        }
        if (comment.is_liked_by_session || comment.liked_by_user) {
          likedIds.push(comment.id);
        }
        if (comment.is_disliked_by_session || comment.disliked_by_user) {
          dislikedIds.push(comment.id);
        }
      });

      // Attach children to their parent
      const nested = [];
      data.forEach((comment) => {
        if (comment.parent_id && commentMap[comment.parent_id]) {
          commentMap[comment.parent_id].replies.push(comment);
        } else if (!comment.parent_id) {
          nested.push(comment);
        }
      });

      // Recursively sort replies newest first
      const sortReplies = (comments) => {
        comments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        comments.forEach((c) => {
          if (c.replies?.length) sortReplies(c.replies);
        });
      };
      sortReplies(nested);

      setComments(nested);
      setReplyCounts(repliesMap);
      setDownvoteCounts(downvotesMap);
      setUpvotedComments(likedIds);
      setDownvotedComments(dislikedIds);
    } catch (err) {
      console.error('Error loading comments:', err);
    }
  };



  useEffect(() => {
    if (articleId) fetchComments();
  }, [articleId]);

  const handleVote = async (commentId, type) => {
    const sessionId = getSessionId();
    const isUpvote = type === 'up';
    const isDownvote = type === 'down';
    const endpoint = isUpvote ? 'like' : 'dislike';

    try {
      const res = await fetch(`${API_URL}/api/comments/${commentId}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'session-id': sessionId,
        },
        body: JSON.stringify({ type }),
      });

      if (!res.ok) throw new Error('Vote failed');

      if (isUpvote) {
        setUpvotedComments((prev) =>
          prev.includes(commentId) ? prev.filter((id) => id !== commentId) : [...prev, commentId]
        );
        setDownvotedComments((prev) => prev.filter((id) => id !== commentId));
      }

      if (isDownvote) {
        setDownvotedComments((prev) =>
          prev.includes(commentId) ? prev.filter((id) => id !== commentId) : [...prev, commentId]
        );
        setUpvotedComments((prev) => prev.filter((id) => id !== commentId));
      }

      fetchComments();
    } catch (err) {
      console.error('Voting error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const trimmedAlias = alias.trim();

    const body = {
      content: newComment,
      author: trimmedAlias !== '' ? trimmedAlias : undefined,
      article_id: articleId,
      parent_id: replyTo?.id || null,
      session_id: getSessionId(),
    };

    try {
      await fetch(`${API_URL}/api/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      setNewComment('');
      setReplyTo(null);
      setAlias('');

      if (replyTo?.id) {
        setShowReplies((prev) => ({ ...prev, [replyTo.id]: true }));
      }

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

  const topLevelComments = comments.filter((c) => !c.parent_id);

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold text-white mb-4">Comments</h3>

      <form
        onSubmit={handleSubmit}
        ref={replyFormRef}
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
            onReplyClick={(comment) => {
              setReplyTo(comment);
              setTimeout(() => {
                replyFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 100);
            }}
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

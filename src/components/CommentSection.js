// ...[Imports remain unchanged]
import React, { useState, useEffect, useRef } from 'react';
import { ThumbsUp, ThumbsDown, MessageCircle, X } from 'lucide-react';
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
      </AnimatePresence>
    </motion.div>
  );
};

const CommentSection = ({ articleId }) => {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [visibleCount, setVisibleCount] = useState(5);
  const [expandedComments, setExpandedComments] = useState({});
  const [upvotedComments, setUpvotedComments] = useState([]);
  const [downvotedComments, setDownvotedComments] = useState([]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`${API_URL}/api/articles/${articleId}/comments`);
      const data = await res.json();
      setComments(data);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [articleId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      const res = await fetch(`${API_URL}/api/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          article_id: articleId,
          content,
          author: author || 'Anonymous',
          parent_id: replyTo,
        }),
      });

      if (res.ok) {
        const newComment = await res.json();
        setComments((prev) => [...prev, newComment]);
        setContent('');
        setReplyTo(null);
      } else {
        console.error('Failed to post comment');
      }
    } catch (err) {
      console.error('Submit error:', err);
    }
  };

  const toggleExpand = (id) => {
    setExpandedComments((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleVote = async (commentId, type) => {
    const isUpvote = type === 'like';
    const endpoint = `${API_URL}/api/comments/${commentId}/${type}`;

    try {
      const res = await fetch(endpoint, { method: 'POST' });
      if (res.ok) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId
              ? {
                  ...c,
                  likes: isUpvote ? c.likes + 1 : c.likes,
                  dislikes: !isUpvote ? c.dislikes + 1 : c.dislikes,
                }
              : c
          )
        );

        if (isUpvote) {
          setUpvotedComments([...upvotedComments, commentId]);
        } else {
          setDownvotedComments([...downvotedComments, commentId]);
        }
      } else if (res.status === 403) {
        // Unlike or undislike
        const reverseEndpoint = `${API_URL}/api/comments/${commentId}/${type}`;
        const undoRes = await fetch(reverseEndpoint, { method: 'DELETE' });

        if (undoRes.ok) {
          setComments((prev) =>
            prev.map((c) =>
              c.id === commentId
                ? {
                    ...c,
                    likes: isUpvote ? Math.max(0, c.likes - 1) : c.likes,
                    dislikes: !isUpvote ? Math.max(0, c.dislikes - 1) : c.dislikes,
                  }
                : c
            )
          );

          if (isUpvote) {
            setUpvotedComments(upvotedComments.filter((id) => id !== commentId));
          } else {
            setDownvotedComments(downvotedComments.filter((id) => id !== commentId));
          }
        }
      }
    } catch (err) {
      console.error('Vote error:', err);
    }
  };

  const renderReplies = (parentId, level = 1) => {
    const replies = comments.filter((c) => c.parent_id === parentId);

    if (replies.length === 0) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className={`ml-${Math.min(level * 4, 16)} mt-2 space-y-2`}
      >
        {replies.map((reply) => (
          <div key={reply.id} className="bg-[#121212] p-2 rounded-lg border border-zinc-800">
            <div className="flex justify-between items-center text-sm text-gray-300">
              <span className="font-semibold">{reply.author}</span>
              <span className="text-xs opacity-50">{new Date(reply.created_at).toLocaleString()}</span>
            </div>
            <p className="text-gray-200 mt-1">{reply.content}</p>
            <div className="flex items-center mt-1 gap-3 text-xs text-zinc-400">
              <button
                onClick={() => handleVote(reply.id, 'like')}
                className={`flex items-center gap-1 ${upvotedComments.includes(reply.id) ? 'text-green-400' : ''}`}
              >
                <ThumbsUp size={14} />
                {reply.likes}
              </button>
              <button
                onClick={() => handleVote(reply.id, 'dislike')}
                className={`flex items-center gap-1 ${downvotedComments.includes(reply.id) ? 'text-red-400' : ''}`}
              >
                <ThumbsDown size={14} />
                {reply.dislikes}
              </button>
              <button
                onClick={() => setReplyTo(reply.id)}
                className="flex items-center gap-1 hover:text-blue-400"
              >
                <MessageCircle size={14} />
                Reply
              </button>
              {comments.some((c) => c.parent_id === reply.id) && (
                <button onClick={() => toggleExpand(reply.id)} className="flex items-center gap-1 hover:text-yellow-400">
                  {expandedComments[reply.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  {expandedComments[reply.id] ? 'Hide replies' : 'View replies'}
                </button>
              )}
            </div>

            <AnimatePresence>
              {expandedComments[reply.id] && renderReplies(reply.id, level + 1)}
            </AnimatePresence>

            {replyTo === reply.id && (
              <form onSubmit={handleSubmit} className="mt-2 space-y-2">
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-md bg-zinc-900 border border-zinc-700 p-1 text-sm text-white"
                />
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Your reply..."
                  className="w-full rounded-md bg-zinc-900 border border-zinc-700 p-1 text-sm text-white"
                />
                <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">
                  Post Reply
                </button>
              </form>
            )}
          </div>
        ))}
      </motion.div>
    );
  };

  const topLevelComments = comments
    .filter((c) => !c.parent_id)
    .slice(0, visibleCount);

  return (
    <div className="w-full max-w-3xl mx-auto p-4 text-white">
      <h2 className="text-xl font-bold mb-4">Comments</h2>

      <form onSubmit={handleSubmit} className="space-y-2 mb-6">
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Your name"
          className="w-full rounded-md bg-zinc-900 border border-zinc-700 p-2 text-white"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment..."
          className="w-full rounded-md bg-zinc-900 border border-zinc-700 p-2 text-white"
        />
        <button type="submit" className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded text-white">
          Post Comment
        </button>
      </form>

      <div className="space-y-4">
        {topLevelComments.map((comment) => (
          <div key={comment.id} className="bg-[#1a1a1a] p-4 rounded-lg border border-zinc-800">
            <div className="flex justify-between text-sm">
              <span className="font-bold">{comment.author}</span>
              <span className="text-xs text-zinc-400">{new Date(comment.created_at).toLocaleString()}</span>
            </div>
            <p className="text-zinc-200 mt-2">{comment.content}</p>
            <div className="flex items-center gap-3 mt-2 text-sm text-zinc-400">
              <button
                onClick={() => handleVote(comment.id, 'like')}
                className={`flex items-center gap-1 ${upvotedComments.includes(comment.id) ? 'text-green-400' : ''}`}
              >
                <ThumbsUp size={16} /> {comment.likes}
              </button>
              <button
                onClick={() => handleVote(comment.id, 'dislike')}
                className={`flex items-center gap-1 ${downvotedComments.includes(comment.id) ? 'text-red-400' : ''}`}
              >
                <ThumbsDown size={16} /> {comment.dislikes}
              </button>
              <button
                onClick={() => setReplyTo(comment.id)}
                className="flex items-center gap-1 hover:text-blue-400"
              >
                <MessageCircle size={16} /> Reply
              </button>
              {comments.some((c) => c.parent_id === comment.id) && (
                <button onClick={() => toggleExpand(comment.id)} className="flex items-center gap-1 hover:text-yellow-400">
                  {expandedComments[comment.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  {expandedComments[comment.id] ? 'Hide replies' : 'View replies'}
                </button>
              )}
            </div>

            <AnimatePresence>
              {expandedComments[comment.id] && renderReplies(comment.id)}
            </AnimatePresence>

            {replyTo === comment.id && (
              <form onSubmit={handleSubmit} className="mt-3 space-y-2">
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-md bg-zinc-900 border border-zinc-700 p-1 text-sm text-white"
                />
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Your reply..."
                  className="w-full rounded-md bg-zinc-900 border border-zinc-700 p-1 text-sm text-white"
                />
                <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">
                  Post Reply
                </button>
              </form>
            )}
          </div>
        ))}
      </div>

      {visibleCount < comments.filter((c) => !c.parent_id).length && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setVisibleCount((prev) => prev + 5)}
            className="text-blue-400 hover:underline"
          >
            Load more comments
          </button>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark } from 'lucide-react';

const API_URL = "https://animac-metaverse.onrender.com";

const Comment = ({
  comment,
  onReply,
  onVote,
  onBookmark,
  upvotedComments,
  downvotedComments,
  bookmarkedComments,
  repliesCount,
  toggleState,
  onToggle,
}) => {
  const isUpvoted = upvotedComments.includes(comment.id);
  const isDownvoted = downvotedComments.includes(comment.id);
  const isBookmarked = bookmarkedComments.includes(comment.id);
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
          by {comment.author || 'Anonymous'} • {new Date(comment.created_at).toLocaleString()}
          {repliesCount > 0 && (
            <span className="ml-2 text-blue-400">• {repliesCount} repl{repliesCount === 1 ? 'y' : 'ies'}</span>
          )}
        </span>
        <div className="flex gap-3 items-center">
          <div className="flex gap-2 items-center">
            <button
              onClick={() => onVote(comment.id, 'up')}
              className={`hover:text-white ${isUpvoted ? 'text-green-400' : ''}`}
              aria-label="Upvote"
            >
              👍
            </button>
            <span className="text-gray-400 font-semibold">{voteScore}</span>
            <button
              onClick={() => onVote(comment.id, 'down')}
              className={`hover:text-white ${isDownvoted ? 'text-red-400' : ''}`}
              aria-label="Downvote"
            >
              👎
            </button>
          </div>
          <button onClick={() => onReply(comment.id)} className="hover:text-white" aria-label="Reply">Reply</button>
          <button
            onClick={() => onBookmark(comment.id)}
            className={`hover:text-white flex items-center gap-1 ${isBookmarked ? 'text-yellow-400' : ''}`}
            aria-label="Bookmark"
          >
            <Bookmark size={14} />
          </button>
          {repliesCount > 0 && (
            <button
              onClick={() => onToggle(comment.id)}
              className="text-blue-400 hover:text-white ml-2"
              aria-label="Toggle replies"
            >
              {toggleState === 'expanded' ? 'Hide Replies' : 'View Replies'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const CommentSection = ({ articleId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [guestName, setGuestName] = useState('');
  const [parentId, setParentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [expandedThreads, setExpandedThreads] = useState({});
  const [visibleCount, setVisibleCount] = useState(5);
  const [upvotedComments, setUpvotedComments] = useState([]);
  const [downvotedComments, setDownvotedComments] = useState([]);
  const [bookmarkedComments, setBookmarkedComments] = useState([]);
  const [sessionId, setSessionId] = useState('');
  const commentBoxRef = useRef(null);

  // Initialize session and saved states
  useEffect(() => {
    let existing = sessionStorage.getItem('session_id');
    if (!existing) {
      existing = Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('session_id', existing);
    }
    setSessionId(existing);

    setUpvotedComments(JSON.parse(sessionStorage.getItem('upvoted_comments') || '[]'));
    setDownvotedComments(JSON.parse(sessionStorage.getItem('downvoted_comments') || '[]'));
    setBookmarkedComments(JSON.parse(sessionStorage.getItem('bookmarked_comments') || '[]'));

    const savedReplyId = sessionStorage.getItem('pending_reply');
    if (savedReplyId) setParentId(savedReplyId);
  }, []);

  // Fetch comments only if articleId is valid
  useEffect(() => {
    if (!articleId) return;
    fetchComments();
  }, [articleId]);

  // Save parentId for pending reply in sessionStorage
  useEffect(() => {
    if (parentId) sessionStorage.setItem('pending_reply', parentId);
    else sessionStorage.removeItem('pending_reply');
  }, [parentId]);

  // Fetch comments from API
  const fetchComments = async () => {
    try {
      setFetching(true);
      const res = await axios.get(`${API_URL}/api/comments/${articleId}`);
      setComments(res.data || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setFetching(false);
    }
  };

  // Handle posting new comment or reply
  const handlePost = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/comments`, {
        article_id: articleId,
        content: newComment,
        author: guestName || 'Guest',
        parent_id: parentId,
      });
      setNewComment('');
      setGuestName('');
      setParentId(null);
      await fetchComments();
      commentBoxRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.error('Post failed:', err);
      alert('Failed to post comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle voting logic (upvote/downvote/unvote)
  const handleVote = async (commentId, direction) => {
    const upvoted = upvotedComments.includes(commentId);
    const downvoted = downvotedComments.includes(commentId);
    let action = '';

    if (direction === 'up') {
      action = upvoted ? 'unvote' : 'upvote';
    } else if (direction === 'down') {
      action = downvoted ? 'unvote' : 'downvote';
    }

    try {
      await axios.post(`${API_URL}/api/comments/${commentId}/${action}`, {}, {
        headers: { 'X-Session-ID': sessionId },
      });

      const newUp = action === 'upvote'
        ? [...new Set([...upvotedComments, commentId])]
        : upvotedComments.filter(id => id !== commentId);

      const newDown = action === 'downvote'
        ? [...new Set([...downvotedComments, commentId])]
        : downvotedComments.filter(id => id !== commentId);

      setUpvotedComments(newUp);
      setDownvotedComments(newDown);
      sessionStorage.setItem('upvoted_comments', JSON.stringify(newUp));
      sessionStorage.setItem('downvoted_comments', JSON.stringify(newDown));

      fetchComments();
    } catch (err) {
      console.error(`${action} failed:`, err);
    }
  };

  // Handle bookmark toggle
  const handleBookmark = async (commentId) => {
    const isBookmarked = bookmarkedComments.includes(commentId);
    const endpoint = isBookmarked ? 'unbookmark' : 'bookmark';

    try {
      await axios.post(`${API_URL}/api/comments/${commentId}/${endpoint}`, {}, {
        headers: { 'X-Session-ID': sessionId },
      });

      const updated = isBookmarked
        ? bookmarkedComments.filter(id => id !== commentId)
        : [...new Set([...bookmarkedComments, commentId])];

      setBookmarkedComments(updated);
      sessionStorage.setItem('bookmarked_comments', JSON.stringify(updated));
      fetchComments();
    } catch (err) {
      console.error(`${endpoint} failed:`, err);
    }
  };

  // Toggle reply thread expansion
  const toggleReplies = (commentId) => {
    setExpandedThreads(prev => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  // Recursive rendering of replies for a given comment
  const renderReplies = (parentId) => {
    const replies = comments.filter(c => c.parent_id === parentId);
    const expanded = expandedThreads[parentId];

    return (
      <AnimatePresence>
        {expanded && replies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="ml-6 mt-2"
          >
            {replies.map(reply => (
              <div key={reply.id}>
                <Comment
                  comment={reply}
                  onReply={setParentId}
                  onVote={handleVote}
                  onBookmark={handleBookmark}
                  upvotedComments={upvotedComments}
                  downvotedComments={downvotedComments}
                  bookmarkedComments={bookmarkedComments}
                  repliesCount={comments.filter(c => c.parent_id === reply.id).length}
                  toggleState={expandedThreads[reply.id] ? 'expanded' : 'collapsed'}
                  onToggle={toggleReplies}
                />
                {renderReplies(reply.id)}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  const topLevelComments = useMemo(() => (
    comments.filter(c => !c.parent_id).slice(0, visibleCount)
  ), [comments, visibleCount]);

  const moreCommentsExist = useMemo(() => (
    comments.filter(c => !c.parent_id).length > visibleCount
  ), [comments, visibleCount]);

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl border-t border-gray-800" ref={commentBoxRef}>
      <h3 className="text-white text-xl font-bold mb-4">Comments</h3>

      <form onSubmit={handlePost} className="mb-6">
        <input
          type="text"
          placeholder="Your name (optional)"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          className="w-full mb-2 p-2 rounded bg-gray-800 text-gray-100 text-sm"
        />
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={parentId ? "Write a reply..." : "Write a comment..."}
          className="w-full p-3 rounded-lg bg-gray-800 text-gray-100 resize-none text-sm"
          rows={4}
        />
        <div className="flex items-center gap-3 mt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm"
          >
            {loading ? 'Posting...' : parentId ? 'Reply' : 'Post Comment'}
          </button>
          {parentId && (
            <button
              type="button"
              onClick={() => setParentId(null)}
              className="text-sm text-gray-400 underline hover:text-white"
            >
              Cancel reply
            </button>
          )}
        </div>
      </form>

      <div className="relative max-h-[600px] overflow-hidden group">
        <div className="overflow-y-auto pr-2">
          {fetching ? (
            <p className="text-gray-400 text-sm">Loading comments...</p>
          ) : topLevelComments.length ? (
            <AnimatePresence>
              {topLevelComments.map(comment => (
                <div key={comment.id}>
                  <Comment
                    comment={comment}
                    onReply={setParentId}
                    onVote={handleVote}
                    onBookmark={handleBookmark}
                    upvotedComments={upvotedComments}
                    downvotedComments={downvotedComments}
                    bookmarkedComments={bookmarkedComments}
                    repliesCount={comments.filter(c => c.parent_id === comment.id).length}
                    toggleState={expandedThreads[comment.id] ? 'expanded' : 'collapsed'}
                    onToggle={toggleReplies}
                  />
                  {renderReplies(comment.id)}
                </div>
              ))}
            </AnimatePresence>
          ) : (
            <p className="text-gray-500 text-sm">No comments yet.</p>
          )}
        </div>

        {moreCommentsExist && (
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center">
            <button
              onClick={() => setVisibleCount(prev => prev + 5)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 text-xs rounded mb-4"
            >
              Load more comments
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;

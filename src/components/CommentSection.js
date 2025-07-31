import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ThumbsUp } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://animac-metaverse.onrender.com';

const Comment = ({ comment, onReply, onLike, likedComments, setLikedComments, repliesCount }) => {
  const handleDoubleClick = () => {
    if (likedComments.includes(comment.id)) {
      setLikedComments(prev => prev.filter(id => id !== comment.id));
    }
  };

  return (
    <div
      className="bg-gray-900 p-4 rounded-lg mb-3 text-gray-200 text-sm"
      onDoubleClick={handleDoubleClick}
    >
      <p className="mb-2">{comment.content}</p>
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>
          by {comment.author || 'Anonymous'} • {new Date(comment.created_at).toLocaleString()}
          {repliesCount > 0 && (
            <span className="ml-2 text-blue-400">• {repliesCount} repl{repliesCount === 1 ? 'y' : 'ies'}</span>
          )}
        </span>
        <div className="flex gap-3">
          <button
            onClick={() => {
              if (!likedComments.includes(comment.id)) {
                onLike(comment.id);
                setLikedComments(prev => [...prev, comment.id]);
              }
            }}
            className="hover:text-white flex items-center gap-1"
          >
            <ThumbsUp size={14} /> {comment.likes}
          </button>
          <button onClick={() => onReply(comment.id)} className="hover:text-white">Reply</button>
        </div>
      </div>
    </div>
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
  const [likedComments, setLikedComments] = useState([]);
  const formRef = useRef(null);

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

  useEffect(() => {
    fetchComments();
  }, [articleId]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/comments`, {
        article_id: articleId,
        content: newComment,
        author: guestName || "Guest",
        parent_id: parentId || null,
      });
      setNewComment('');
      setGuestName('');
      setParentId(null);
      await fetchComments();
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Post failed:', err);
      alert('Failed to post comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (commentId) => {
    const sessionId = sessionStorage.getItem('session_id') || Date.now().toString();
    sessionStorage.setItem('session_id', sessionId);

    try {
      const alreadyLiked = likedComments.includes(commentId);

      const url = `${API_URL}/api/comments/${commentId}/${alreadyLiked ? 'unlike' : 'like'}`;
      await axios.post(url, null, {
        headers: { "X-Session-ID": sessionId },
      });

      const updated = alreadyLiked
        ? likedComments.filter(id => id !== commentId)
        : [...likedComments, commentId];
      setLikedComments(updated);

      fetchComments();
    } catch (err) {
      console.error('Like/unlike failed:', err);
    }
  };

  const toggleReplies = (commentId) => {
    setExpandedThreads(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const renderThread = (parent = null) => {
    const replies = comments.filter(c => c.parent_id === parent);
    if (replies.length === 0) return null;

    const visibleReplies = 2;

    return replies.map((c) => {
      const children = comments.filter(child => child.parent_id === c.id);
      const isExpanded = expandedThreads[c.id];
      const shouldCollapse = children.length > visibleReplies && !isExpanded;

      return (
        <div key={c.id} className={parent ? 'ml-6' : ''}>
          <Comment
            comment={c}
            onReply={setParentId}
            onLike={handleLike}
            likedComments={likedComments}
            setLikedComments={setLikedComments}
            repliesCount={children.length}
          />

          {children.slice(0, isExpanded ? children.length : visibleReplies).map(child => (
            <div key={child.id} className="ml-6">
              <Comment
                comment={child}
                onReply={setParentId}
                onLike={handleLike}
                likedComments={likedComments}
                setLikedComments={setLikedComments}
                repliesCount={0}
              />
            </div>
          ))}

          {shouldCollapse && (
            <button
              onClick={() => toggleReplies(c.id)}
              className="text-xs text-blue-400 ml-6 mt-1 mb-3 hover:underline"
            >
              View more replies ({children.length - visibleReplies})
            </button>
          )}
        </div>
      );
    });
  };

  const topLevelComments = comments.filter(c => !c.parent_id).slice(0, visibleCount);
  const moreCommentsExist = comments.filter(c => !c.parent_id).length > visibleCount;

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl border-t border-gray-800" ref={formRef}>
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
            className="px-4 py-2 rounded bg-east-500 hover:bg-east-600 text-white text-sm"
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
          ) : comments.length > 0 ? (
            renderThread()
          ) : (
            <p className="text-gray-500 text-sm">No comments yet.</p>
          )}
        </div>

        {comments.length > 3 && (
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center">
            <button
              onClick={() => {
                const container = formRef.current?.querySelector('.overflow-y-auto');
                if (container) container.style.maxHeight = 'none';
              }}
              className="bg-east-500 hover:bg-east-600 text-white px-4 py-1 text-xs rounded mb-4"
            >
              Read more comments
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;

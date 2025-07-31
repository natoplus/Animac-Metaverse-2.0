import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ThumbsUp } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://animac-metaverse.onrender.com';

const getSessionId = () => {
  let id = localStorage.getItem("session_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("session_id", id);
  }
  return id;
};

const Comment = ({ comment, onReply, onLike }) => (
  <div className="bg-gray-900 p-4 rounded-lg mb-3 text-gray-200 text-sm">
    <p className="mb-2">{comment.content}</p>
    <div className="flex justify-between items-center text-xs text-gray-500">
      <span>by {comment.author || 'Anonymous'} • {new Date(comment.created_at).toLocaleString()}</span>
      <div className="flex gap-3">
        <button onClick={() => onLike(comment.id)} className="hover:text-white flex items-center gap-1">
          <ThumbsUp size={14} /> {comment.likes}
        </button>
        <button onClick={() => onReply(comment.id)} className="hover:text-white">Reply</button>
      </div>
    </div>
  </div>
);

const CommentSection = ({ articleId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [guestName, setGuestName] = useState('');
  const [parentId, setParentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [expandedThreads, setExpandedThreads] = useState({});
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
    try {
      await axios.post(`${API_URL}/api/comments/${commentId}/like`, null, {
        headers: {
          'X-Session-ID': getSessionId(),
        },
      });
      fetchComments();
    } catch (err) {
      console.error('Like failed:', err);
      alert('You can only like once per comment.');
    }
  };

  const toggleReplies = (commentId) => {
    setExpandedThreads(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const renderThread = (parent = null, level = 0) => {
    const replies = comments.filter(c => c.parent_id === parent);
    if (replies.length === 0) return null;

    return replies.map((c, i) => {
      const children = comments.filter(child => child.parent_id === c.id);
      const isExpanded = expandedThreads[c.id];
      const shouldCollapse = children.length > 2 && !isExpanded;

      return (
        <div key={c.id} className={parent ? 'ml-6' : ''}>
          <Comment comment={c} onReply={setParentId} onLike={handleLike} />

          {children.length > 0 && (
            <>
              {renderThread(c.id, level + 1)}
              {shouldCollapse && (
                <button
                  onClick={() => toggleReplies(c.id)}
                  className="text-xs text-blue-400 ml-6 mt-1 mb-3 hover:underline"
                >
                  Show more replies ({children.length - 2})
                </button>
              )}
            </>
          )}
        </div>
      );
    });
  };

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

      {fetching ? (
        <p className="text-gray-400 text-sm">Loading comments...</p>
      ) : comments.length > 0 ? (
        renderThread()
      ) : (
        <p className="text-gray-500 text-sm">No comments yet. Be the first to share your thoughts!</p>
      )}
    </div>
  );
};

export default CommentSection;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ThumbsUp } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://animac-metaverse.onrender.com';

const Comment = ({ comment, onReply, onLike }) => (
  <div className="bg-gray-900 p-4 rounded-lg mb-3 text-gray-200 text-sm">
    <p className="mb-2">{comment.content}</p>
    <div className="flex justify-between items-center text-xs text-gray-500">
      <span>by {comment.author || 'Anonymous'} • {new Date(comment.created_at).toLocaleString()}</span>
      <div className="flex gap-3">
        <button
          onClick={() => onLike(comment.id)}
          className={`hover:text-white flex items-center gap-1 ${
            localStorage.getItem(`liked-${comment.id}`) ? 'text-blue-400' : ''
          }`}
          disabled={localStorage.getItem(`liked-${comment.id}`)}
        >
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
  const [parentId, setParentId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchComments = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/comments/${articleId}`);
      setComments(res.data || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
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
        author: "Guest",
        parent_id: parentId || null,
      });
      setNewComment('');
      setParentId(null);
      fetchComments();
    } catch (err) {
      console.error('Post failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (commentId) => {
    if (localStorage.getItem(`liked-${commentId}`)) return;
    try {
      await axios.post(`${API_URL}/api/comments/${commentId}/like`);
      localStorage.setItem(`liked-${commentId}`, 'true');
      fetchComments();
    } catch (err) {
      console.error('Like failed:', err);
    }
  };

  const renderThread = (parentId = null) => {
    return comments
      .filter(c => c.parent_id === parentId)
      .map(c => (
        <div key={c.id} className={parentId ? 'ml-6' : ''}>
          <Comment comment={c} onReply={setParentId} onLike={handleLike} />
          {renderThread(c.id)}
        </div>
      ));
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl border-t border-gray-800">
      <h3 className="text-white text-xl font-bold mb-4">Comments</h3>
      <form onSubmit={handlePost} className="mb-6">
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
      {renderThread()}
    </div>
  );
};

export default CommentSection;

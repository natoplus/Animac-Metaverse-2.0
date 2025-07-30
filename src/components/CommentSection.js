import React, { useState } from 'react';

const CommentSection = ({ articleId }) => {
  const [comments, setComments] = useState([
    { name: 'Alex', message: 'This was a great read!', date: '2025-07-29' },
    { name: 'Mira', message: 'Looking forward to more content like this.', date: '2025-07-28' }
  ]);
  const [form, setForm] = useState({ name: '', message: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.name.trim() && form.message.trim()) {
      const newComment = {
        name: form.name.trim(),
        message: form.message.trim(),
        date: new Date().toISOString().split('T')[0]
      };
      setComments(prev => [newComment, ...prev]);
      setForm({ name: '', message: '' });
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl border-t border-gray-800">
      <h3 className="text-white text-xl font-bold font-montserrat mb-6">Comments</h3>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <input
          name="name"
          type="text"
          placeholder="Your name"
          value={form.name}
          onChange={handleInputChange}
          className="w-full bg-gray-900 text-gray-200 p-3 rounded-lg border border-gray-700 placeholder-gray-500"
          required
        />
        <textarea
          name="message"
          rows="4"
          placeholder="Write a comment..."
          value={form.message}
          onChange={handleInputChange}
          className="w-full bg-gray-900 text-gray-200 p-3 rounded-lg border border-gray-700 placeholder-gray-500"
          required
        />
        <button
          type="submit"
          className="px-6 py-2 bg-east-500 hover:bg-east-600 text-white rounded-lg font-inter transition"
        >
          Post Comment
        </button>
      </form>

      {/* Comment List */}
      <div className="space-y-6">
        {comments.length > 0 ? (
          comments.map((c, i) => (
            <div key={i} className="bg-gray-900 p-4 rounded-lg border border-gray-700">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-east-400">{c.name}</span>
                <span className="text-xs text-gray-500">{c.date}</span>
              </div>
              <p className="text-gray-300 font-inter text-sm">{c.message}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 font-inter text-sm">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
};

export default CommentSection;

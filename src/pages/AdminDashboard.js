import React, { useEffect, useState, lazy, Suspense } from 'react';
import {
  fetchArticles,
  createArticle,
  updateArticle,
  deleteArticle,
} from '../utils/api';

import Header from '../components/Header';
import Footer from '../components/Footer';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import 'react-markdown-editor-lite/lib/index.css';
import '../styles/admin.css';

const MdEditor = lazy(() => import('react-markdown-editor-lite'));

const initialFormState = () => ({
  title: '',
  content: '',
  excerpt: '',
  category: 'east',
  tags: '',
  featured_image: '',
  is_featured: true,
  is_published: true,
});

export default function AdminDashboard() {
  const [articles, setArticles] = useState([]);
  const [formData, setFormData] = useState(initialFormState());
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    const data = await fetchArticles();
    if (Array.isArray(data)) {
      const unique = Array.from(new Map(data.map(item => [item.id, item])).values());
      setArticles(unique);
    } else {
      setArticles([]);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleEditorChange = ({ text }) => {
    setFormData((prev) => ({ ...prev, content: text }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
    };

    try {
      isEditing
        ? await updateArticle(editingId, payload)
        : await createArticle(payload);

      alert(isEditing ? '✅ Article updated!' : '✅ Article posted!');
      resetForm();
      await loadArticles();
    } catch (err) {
      alert('❌ Operation failed.');
    }
  };

  const handleEdit = (article) => {
    setFormData({
      ...article,
      tags: Array.isArray(article.tags) ? article.tags.join(', ') : '',
    });
    setEditingId(article.id);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    try {
      await deleteArticle(id);
      await loadArticles();
    } catch {
      alert('❌ Failed to delete article.');
    }
  };

  const resetForm = () => {
    setFormData(initialFormState());
    setIsEditing(false);
    setEditingId(null);
  };

  return (
    <>
      <Header />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="admin-panel space-y-10 max-w-4xl mx-auto py-10"
      >
        <h1 className="font-ackno text-4xl font-bold text-white text-center">ANIMAC Admin Panel</h1>

        {/* Article Form */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="neon-red bg-black border border-red-700 shadow-xl">
            <CardContent className="space-y-4 p-5">
              <h2 className="font-japanese text-2xl font-semibold text-white">
                {isEditing ? 'Edit Article' : 'Post New Article'}
              </h2>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <Input name="title" placeholder="Title" value={formData.title} onChange={handleChange} required />
                <Textarea name="excerpt" placeholder="Excerpt" value={formData.excerpt} onChange={handleChange} />

                <Suspense fallback={<div className="text-white">Loading editor...</div>}>
                  <MdEditor
                    value={formData.content}
                    style={{ height: '300px', backgroundColor: '#111' }}
                    renderHTML={(text) => <ReactMarkdown>{text}</ReactMarkdown>}
                    onChange={handleEditorChange}
                    className="dark-mode"
                  />
                </Suspense>

                <Input name="category" placeholder="Category (east/west)" value={formData.category} onChange={handleChange} />
                <Input name="tags" placeholder="Tags (comma-separated)" value={formData.tags} onChange={handleChange} />
                <Input name="featured_image" placeholder="Featured Image URL" value={formData.featured_image} onChange={handleChange} />

                <div className="flex gap-6 text-white">
                  <label>
                    <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleChange} /> Featured
                  </label>
                  <label>
                    <input type="checkbox" name="is_published" checked={formData.is_published} onChange={handleChange} /> Published
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full neon-btn animate-pulse-glow font-bold tracking-wider text-lg"
                >
                  {isEditing ? 'Update Article' : 'Submit Article'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Article List */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="neon-blue bg-black border border-blue-700 shadow-xl">
            <CardContent className="space-y-4 p-5">
              <h2 className="font-japanese text-2xl font-semibold text-white">Existing Articles</h2>
              {articles.length === 0 ? (
                <p className="text-gray-400">No articles found.</p>
              ) : (
                <ul className="space-y-4">
                  {articles.map((article) => (
                    <li key={article.id} className="border-b border-gray-700 pb-2 text-white">
                      <div className="flex justify-between items-center">
                        <div>
                          <strong>{article.title}</strong> — {article.category} —{' '}
                          {article.is_published ? '✅ Published' : '❌ Draft'}
                        </div>
                        <div className="space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleEdit(article)}
                            className="neon-btn-sm animate-pulse-glow"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(article.id)}
                            className="neon-btn-sm-red animate-pulse-glow"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
      <Footer />
    </>
  );
}

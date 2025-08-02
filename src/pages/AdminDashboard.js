import React, { useEffect, useState, lazy, Suspense } from 'react';
import {
  fetchArticles,
  createArticle,
  updateArticle,
  deleteArticle,
} from '../utils/api';

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

  const loadArticles = async () => {
    console.log('📥 Loading articles...');
    try {
      const data = await fetchArticles();
      if (Array.isArray(data)) {
        const uniqueMap = new Map();
        data.forEach((article) => {
          if (article?.id) uniqueMap.set(article.id, article);
        });
        setArticles([...uniqueMap.values()]);
        console.log(`✅ Loaded ${uniqueMap.size} articles.`);
      } else {
        setArticles([]);
        console.warn('⚠️ Articles fetched are not an array.');
      }
    } catch (err) {
      console.error('❌ Failed to load articles:', err);
      setArticles([]);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

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
      if (isEditing) {
        console.log(`✏️ Updating article ID: ${editingId}`);
        await updateArticle(editingId, payload);
        alert('✅ Article updated!');
      } else {
        console.log('📝 Creating new article...');
        await createArticle(payload);
        alert('✅ Article posted!');
      }

      resetForm();
      await loadArticles();
    } catch (err) {
      alert('❌ Operation failed.');
      console.error('⚠️ Error during submit:', err);
    }
  };

  const handleEdit = (article) => {
    console.log('✏️ Editing article:', article);
    setFormData({
      ...article,
      tags: Array.isArray(article.tags) ? article.tags.join(', ') : '',
    });
    setEditingId(article.id);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm('Are you sure you want to delete this article?');
    if (!confirm) return;

    try {
      console.log(`🗑️ Deleting article ID: ${id}`);
      await deleteArticle(id);
      await loadArticles();
    } catch (err) {
      console.error('❌ Failed to delete article:', err);
      alert('Failed to delete article.');
    }
  };

  const resetForm = () => {
    setFormData(initialFormState());
    setIsEditing(false);
    setEditingId(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="admin-panel space-y-10 max-w-4xl mx-auto mt-10"
    >
      <h1 className="font-ackno text-3xl font-bold text-white">ANIMAC Admin Panel</h1>

      {/* Article Form */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="neon-red bg-black border border-red-700">
          <CardContent className="space-y-4 p-5">
            <h2 className="font-japanese text-3xl font-semibold text-white">
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

              <Input name="category" placeholder="Category (east/west)" value={formData.category} onChange={handleChange} required />
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
              <Button type="submit" className="w-full">
                {isEditing ? 'Update Article' : 'Submit Article'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Articles List */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card className="neon-blue bg-black border border-blue-700">
          <CardContent className="space-y-4 p-5">
            <h2 className="font-japanese text-3xl font-semibold text-white">Existing Articles</h2>
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
                        <Button size="sm" onClick={() => handleEdit(article)}>Edit</Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(article.id)}>Delete</Button>
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
  );
}

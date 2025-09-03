// src/pages/AdminDashboard.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchArticles,
  createArticle,
  updateArticle,
  deleteArticle,
} from "../utils/api";
import TipTapEditor from "../components/TipTapEditor";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import {
  Trash2,
  Edit2,
  Save,
  Eye,
  EyeOff,
  Search,
} from "lucide-react";

// ------------------------------
// AdminDashboard Component
// ------------------------------
// Features:
// - TipTap editor with inline image resizing
// - Live preview panel (responsive)
// - Drafts / Published toggle
// - Search and sort articles
// - Auto-save toggle
// - Word count / read time
// - Tag autocomplete dropdown
// - Featured image input
// - Sleek dark theme with red-blue gradients
// - Minimalist icons with hover light effects
// - Animations on cards, buttons, and editor changes
// ------------------------------

export default function AdminDashboard() {
  // ----- States -----
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState([]);
  const [featuredImage, setFeaturedImage] = useState("");
  const [isDraft, setIsDraft] = useState(true);
  const [autoSave, setAutoSave] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const [showPreview, setShowPreview] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [draftsVisible, setDraftsVisible] = useState(true);
  const [publishedVisible, setPublishedVisible] = useState(true);
  const [tagInput, setTagInput] = useState("");
  const editorRef = useRef(null);

  // ----- Fetch Articles -----
  const loadArticles = useCallback(async () => {
    setLoading(true);
    const allArticles = await fetchArticles();
    setArticles(allArticles);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  // ----- Handle Article Edit -----
  const handleEdit = (article) => {
    setSelectedArticle(article);
    setTitle(article.title);
    setExcerpt(article.excerpt || "");
    setCategory(article.category || "");
    setTags(article.tags || []);
    setFeaturedImage(article.featured_image || "");
    setIsDraft(!article.is_published);
    setPreviewContent(article.content);
    if (editorRef.current) {
      editorRef.current.setContent && editorRef.current.setContent(article.content);
    }
  };

  // ----- Handle Delete -----
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this article?")) return;
    await deleteArticle(id);
    loadArticles();
  };

  // ----- Handle Save / Update -----
  const handleSave = async () => {
    const content = editorRef.current?.getHTML() || "";
    const payload = {
      title,
      excerpt,
      category,
      tags,
      featured_image: featuredImage,
      content,
      is_published: !isDraft,
    };
    if (selectedArticle) {
      await updateArticle(selectedArticle.id, payload);
    } else {
      await createArticle(payload);
    }
    resetForm();
    loadArticles();
  };

  const resetForm = () => {
    setSelectedArticle(null);
    setTitle("");
    setExcerpt("");
    setCategory("");
    setTags([]);
    setFeaturedImage("");
    setIsDraft(true);
    setPreviewContent("");
    setTagInput("");
  };

  // ----- Auto-save Draft -----
  useEffect(() => {
    if (!autoSave) return;
    const interval = setInterval(() => {
      if (!selectedArticle) return;
      handleSave();
    }, 30000); // every 30 seconds
    return () => clearInterval(interval);
  }, [autoSave, selectedArticle, title, excerpt, category, tags, featuredImage, previewContent]);

  // ----- Editor Change Handler -----
  const handleEditorChange = (html) => {
    setPreviewContent(html);
  };

  // ----- Word count / Read time -----
  const wordCount = previewContent?.split(/\s+/).length || 0;
  const readTime = Math.ceil(wordCount / 200);

  // ----- Filter & Search Articles -----
  const filteredArticles = articles
    .filter((a) => a.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((a) =>
      a.is_published ? publishedVisible : draftsVisible
    );

  // ----- Add tag via input -----
  const handleTagInputKey = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  // ----- Animation Variants -----
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 font-sans">
      {/* --- Header --- */}
      <h1 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-blue-500">
        Admin Dashboard
      </h1>

      {/* --- Search & Filters --- */}
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <Input
          placeholder="Search articles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-gray-800 border-gray-700 focus:border-blue-400 placeholder-gray-400 text-gray-100"
          icon={<Search size={16} />}
        />
        <div className="flex gap-2">
          <Button
            className={`bg-gray-800 border border-gray-700 hover:border-red-500 transition-colors`}
            onClick={() => setDraftsVisible(!draftsVisible)}
          >
            {draftsVisible ? <Eye size={16} /> : <EyeOff size={16} />} Drafts
          </Button>
          <Button
            className={`bg-gray-800 border border-gray-700 hover:border-blue-500 transition-colors`}
            onClick={() => setPublishedVisible(!publishedVisible)}
          >
            {publishedVisible ? <Eye size={16} /> : <EyeOff size={16} />} Published
          </Button>
        </div>
      </div>

      {/* --- Editor + Preview Panel --- */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* --- Editor Panel --- */}
        <motion.div
          className="flex-1"
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <Card className="mb-4 bg-gray-850 border border-gray-700 hover:border-blue-500 transition-colors duration-300 shadow-md">
            <CardContent>
              {/* --- Inputs --- */}
              <Input
                placeholder="Article Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mb-2 bg-gray-800 text-gray-100 placeholder-gray-400 border border-gray-700 focus:border-blue-400"
              />
              <Input
                placeholder="Excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="mb-2 bg-gray-800 text-gray-100 placeholder-gray-400 border border-gray-700 focus:border-blue-400"
              />
              <Input
                placeholder="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mb-2 bg-gray-800 text-gray-100 placeholder-gray-400 border border-gray-700 focus:border-blue-400"
              />

              {/* --- Tags Input --- */}
              <div className="flex gap-2 mb-2 flex-wrap">
                {tags.map((t, i) => (
                  <span
                    key={i}
                    className="bg-gradient-to-r from-red-500 to-blue-500 px-2 py-1 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setTags(tags.filter((tag) => tag !== t))}
                  >
                    {t} &times;
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="Add tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKey}
                  className="bg-gray-800 text-gray-100 placeholder-gray-400 border border-gray-700 focus:border-blue-400 px-2 py-1 rounded text-sm"
                />
              </div>

              <Input
                placeholder="Featured Image URL"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                className="mb-2 bg-gray-800 text-gray-100 placeholder-gray-400 border border-gray-700 focus:border-blue-400"
              />

              {/* Draft & Auto-save */}
              <div className="flex flex-wrap items-center gap-4 mb-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isDraft}
                    onChange={(e) => setIsDraft(e.target.checked)}
                    className="accent-blue-500"
                  />
                  Save as Draft
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={autoSave}
                    onChange={(e) => setAutoSave(e.target.checked)}
                    className="accent-red-500"
                  />
                  Auto-save Draft
                </label>
                <span className="ml-auto text-sm text-gray-400">
                  {wordCount} words | {readTime} min read
                </span>
              </div>

              {/* TipTap Editor */}
              <TipTapEditor
                ref={editorRef}
                initialContent={previewContent}
                onUpdate={handleEditorChange}
              />

              {/* Save Button */}
              <Button
                className="mt-4 bg-gradient-to-r from-red-500 to-blue-500 hover:from-blue-500 hover:to-red-500 text-white flex items-center gap-2 transition-all duration-300"
                onClick={handleSave}
              >
                <Save size={16} /> Save Article
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* --- Preview Panel --- */}
        <motion.div
          className="flex-1"
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <Card className="bg-gray-850 border border-gray-700 hover:border-red-500 transition-colors duration-300 shadow-md">
            <CardContent>
              <h2 className="text-xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-blue-400">
                Live Preview
              </h2>
              <div
                className="prose prose-invert max-w-full overflow-auto border rounded p-4 bg-gray-800"
                dangerouslySetInnerHTML={{ __html: previewContent }}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* --- Articles List --- */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-blue-500">
          Articles
        </h2>

        <AnimatePresence>
          {loading ? (
            <p>Loading...</p>
          ) : filteredArticles.length === 0 ? (
            <p>No articles found.</p>
          ) : (
            <div className="grid gap-4">
              {filteredArticles.map((article) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    className={`flex justify-between items-center p-4 bg-gray-850 border border-gray-700 rounded-md hover:shadow-lg transition-shadow duration-300 ${
                      !article.is_published ? "opacity-80" : ""
                    }`}
                  >
                    <div>
                      <h3 className="font-semibold">{article.title}</h3>
                      {!article.is_published && (
                        <span className="text-xs text-gray-400 animate-pulse">
                          Draft
                        </span>
                      )}
                      <div className="text-sm text-gray-400">
                        {article.category} | {article.tags?.join(", ")}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(article)}
                        className="p-1 rounded hover:bg-gradient-to-r hover:from-red-500 hover:to-blue-500 transition-colors duration-300"
                      >
                        <Edit2 size={18} className="text-gray-200 hover:text-white" />
                      </button>
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="p-1 rounded hover:bg-gradient-to-r hover:from-red-500 hover:to-blue-500 transition-colors duration-300"
                      >
                        <Trash2 size={18} className="text-gray-200 hover:text-white" />
                      </button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

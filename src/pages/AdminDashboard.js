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
import { Trash2, Edit2, Save, Eye, EyeOff, Search } from "lucide-react";

export default function AdminDashboard() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [articleForm, setArticleForm] = useState({
    title: "",
    excerpt: "",
    category: "",
    tags: [],
    featured_image: "",
    content: "",
    is_featured: false,
    is_published: false, // false = draft, true = published
  });
  const [autoSave, setAutoSave] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const [showPreview, setShowPreview] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [draftsVisible, setDraftsVisible] = useState(true);
  const [publishedVisible, setPublishedVisible] = useState(true);
  const [tagInput, setTagInput] = useState("");
  const editorRef = useRef(null);

  const loadArticles = useCallback(async () => {
    setLoading(true);
    const allArticles = await fetchArticles();
    setArticles(allArticles);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const resetForm = () => {
    setSelectedArticle(null);
    setArticleForm({
      title: "",
      excerpt: "",
      category: "",
      tags: [],
      featured_image: "",
      content: "",
      is_featured: false,
      is_published: false,
    });
    setPreviewContent("");
    setTagInput("");
  };

  const handleEdit = (article) => {
    setSelectedArticle(article);
    setArticleForm({
      title: article.title,
      excerpt: article.excerpt || "",
      category: article.category || "",
      tags: article.tags || [],
      featured_image: article.featured_image || "",
      content: article.content || "",
      is_featured: article.is_featured || false,
      is_published: article.is_published,
    });
    setPreviewContent(article.content || "");
    if (editorRef.current?.setContent) {
      editorRef.current.setContent(article.content || "");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this article?")) return;
    await deleteArticle(id);
    loadArticles();
  };

  const handleSave = async () => {
    const content = editorRef.current?.getHTML() || "";
    const payload = {
      ...articleForm,
      content,
    };
    if (selectedArticle) {
      await updateArticle(selectedArticle.id, payload);
    } else {
      await createArticle(payload);
    }
    resetForm();
    loadArticles();
  };

  // Auto-save draft
  useEffect(() => {
    if (!autoSave || !selectedArticle) return;

    const interval = setInterval(() => {
      handleSave();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoSave, selectedArticle]);

  const handleEditorChange = (html) => {
    setPreviewContent(html);
    setArticleForm({ ...articleForm, content: html });
  };

  const wordCount = previewContent?.trim().split(/\s+/).length || 0;
  const readTime = Math.ceil(wordCount / 200);

  const filteredArticles = articles.filter((a) =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const draftArticles = filteredArticles.filter((a) => !a?.is_published);
  const publishedArticles = filteredArticles.filter((a) => a?.is_published);

  const handleTagInputKey = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      setArticleForm({ ...articleForm, tags: [...articleForm.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };
  const glowClass =
    "shadow-[0_0_15px_rgba(255,0,150,0.2),0_0_20px_rgba(0,120,255,0.2)] hover:shadow-[0_0_20px_rgba(255,0,150,0.4),0_0_25px_rgba(0,120,255,0.4)] transition-shadow duration-300";

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 font-sans">
      <h1 className="text-3xl font-bold mb-6 font-azonix bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-blue-500">
        Admin Dashboard
      </h1>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <Input
          placeholder="Search articles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-gray-800 border border-gray-700 focus:border-blue-400 placeholder-gray-400 text-gray-100"
          icon={<Search size={16} />}
        />
        <div className="flex gap-2">
          <Button
            className="bg-gradient-to-r from-red-500 to-blue-500 hover:from-blue-500 hover:to-red-500 text-white px-4 py-2 rounded-[6px]"
            onClick={() => setDraftsVisible(!draftsVisible)}
          >
            {draftsVisible ? <Eye size={16} /> : <EyeOff size={16} />} Drafts
          </Button>
          <Button
            className="bg-gradient-to-r from-red-500 to-blue-500 hover:from-blue-500 hover:to-red-500 text-white px-4 py-2 rounded-[6px]"
            onClick={() => setPublishedVisible(!publishedVisible)}
          >
            {publishedVisible ? <Eye size={16} /> : <EyeOff size={16} />} Published
          </Button>
        </div>
      </div>

      {/* Editor + Preview */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Editor */}
        <motion.div className="flex-1" initial="hidden" variants={cardVariants}>
          <Card className={`mb-4 bg-gray-850 border border-gray-700 rounded-[6px] shadow-md animate-pulse ${glowClass}`}>
            <CardContent>
              <Input
                placeholder="Article Title"
                value={articleForm.title}
                onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                className="mb-3 bg-gray-800 text-gray-100 placeholder-gray-400 border border-gray-700 focus:border-blue-400"
              />
              <Input
                placeholder="Excerpt"
                value={articleForm.excerpt}
                onChange={(e) => setArticleForm({ ...articleForm, excerpt: e.target.value })}
                className="mb-3 bg-gray-800 text-gray-100 placeholder-gray-400 border border-gray-700 focus:border-blue-400"
              />
              <Input
                placeholder="Category"
                value={articleForm.category}
                onChange={(e) => setArticleForm({ ...articleForm, category: e.target.value })}
                className="mb-3 bg-gray-800 text-gray-100 placeholder-gray-400 border border-gray-700 focus:border-blue-400"
              />
              <div className="flex gap-2 mb-3 flex-wrap">
                {articleForm.tags.map((t, i) => (
                  <span
                    key={i}
                    className="bg-gradient-to-r from-red-500 to-blue-500 px-2 py-1 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setArticleForm({ ...articleForm, tags: articleForm.tags.filter((tag) => tag !== t) })}
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
                value={articleForm.featured_image}
                onChange={(e) => setArticleForm({ ...articleForm, featured_image: e.target.value })}
                className="mb-3 bg-gray-800 text-gray-100 placeholder-gray-400 border border-gray-700 focus:border-blue-400"
              />

              <div className="flex flex-wrap items-center gap-4 mb-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!articleForm.is_published}
                    onChange={(e) => setArticleForm({ ...articleForm, is_published: !e.target.checked })}
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
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={articleForm.is_featured}
                    onChange={(e) =>
                      setArticleForm({ ...articleForm, is_featured: e.target.checked })
                    }
                    className="form-checkbox h-5 w-5 text-blue-500"
                  />
                  <span>Featured</span>
                </label>
                <span className="ml-auto text-sm text-gray-400">
                  {wordCount} words | {readTime} min read
                </span>
              </div>

              <TipTapEditor
                ref={editorRef}
                initialContent={previewContent}
                onUpdate={handleEditorChange}
              />

              <Button
                className="mt-4 bg-gradient-to-r from-red-500 to-blue-500 hover:from-blue-500 hover:to-red-500 text-white flex items-center gap-2 transition-all duration-300 rounded-[6px]"
                onClick={handleSave}
              >
                <Save size={16} /> Save Article
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Preview */}
        <motion.div className="flex-1" initial="hidden" animate="visible" variants={cardVariants}>
          <Card className={`bg-gray-850 border border-gray-700 rounded-[6px] shadow-md ${glowClass}`}>
            <CardContent>
              <h2 className="font-azonix text-xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-blue-400">
                Live Preview
              </h2>
              {articleForm.featured_image && (
                <img
                  src={articleForm.featured_image}
                  alt="Featured"
                  className="w-full max-h-64 object-cover rounded-[6px] mb-4 shadow-md"
                />
              )}
              <div
                className="prose prose-invert max-w-full overflow-auto border rounded-[6px] p-4 bg-gray-800"
                dangerouslySetInnerHTML={{ __html: previewContent }}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Articles List */}
      <div className="mt-8 space-y-4">
        {draftArticles.length > 0 && (
          <div>
            <Button
              className="w-full text-left bg-gray-800 border border-gray-700 mb-2 px-4 py-2 flex justify-between items-center rounded-[6px]"
              onClick={() => setDraftsVisible(!draftsVisible)}
            >
              <span>Drafts ({draftArticles.length})</span>
              {draftsVisible ? <Eye size={16} /> : <EyeOff size={16} />}
            </Button>

            <AnimatePresence>
              {draftsVisible && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2"
                >
                  {draftArticles.map((article) => (
                    <Card
                      key={article.id}
                      className={`flex justify-between items-center p-4 bg-gray-850 border border-gray-700 rounded-[6px] hover:shadow-lg transition-shadow duration-300 opacity-90 ${glowClass}`}
                    >
                      <div>
                        <h3 className="font-azonix font-semibold text-white">{article.title}</h3>

                        {/* Status / Featured badges */}
                        <div className="flex flex-wrap gap-2 mt-1">
                          {!article.is_published && (
                            <span className="text-xs px-2 py-1 border border-red-500 text-red-500 rounded">
                              Draft
                            </span>
                          )}
                          {article.is_published && (
                            <span className="text-xs px-2 py-1 border border-green-500 text-green-500 rounded">
                              Published
                            </span>
                          )}
                          {article.is_featured && (
                            <span className="text-xs px-2 py-1 border border-yellow-400 text-yellow-400 rounded">
                              Featured
                            </span>
                          )}
                        </div>

                        <div className="text-sm text-gray-400 mt-1">
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
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {publishedArticles.length > 0 && (
          <div>
            <Button
              className="w-full text-left bg-gray-800 border border-gray-700 mb-2 px-4 py-2 flex justify-between items-center rounded-[6px]"
              onClick={() => setPublishedVisible(!publishedVisible)}
            >
              <span>Published ({publishedArticles.length})</span>
              {publishedVisible ? <Eye size={16} /> : <EyeOff size={16} />}
            </Button>

            <AnimatePresence>
              {publishedVisible && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2"
                >
                  {publishedArticles.map((article) => (
                    <Card
                      key={article.id}
                      className={`flex justify-between items-center p-4 bg-gray-850 border border-gray-700 rounded-[6px] hover:shadow-lg transition-shadow duration-300 ${glowClass}`}
                    >
                      <div>
                        <h3 className="font-azonix font-semibold text-white">{article.title}</h3>

                        {/* Status / Featured badges */}
                        <div className="flex flex-wrap gap-2 mt-1">
                          {!article.is_published && (
                            <span className="text-xs px-2 py-1 border border-red-500 text-red-500 rounded">
                              Draft
                            </span>
                          )}
                          {article.is_published && (
                            <span className="text-xs px-2 py-1 border border-green-500 text-green-500 rounded">
                              Published
                            </span>
                          )}
                          {article.is_featured && (
                            <span className="text-xs px-2 py-1 border border-yellow-400 text-yellow-400 rounded">
                              Featured
                            </span>
                          )}
                        </div>

                        <div className="text-sm text-gray-400 mt-1">
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
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

      </div>
    </div>
  );
}

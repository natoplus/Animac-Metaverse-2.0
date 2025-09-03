// src/pages/AdminDashboard.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { fetchArticles, createArticle, updateArticle, deleteArticle } from "../utils/api";
import TipTapEditor from "../components/TipTapEditor";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Trash2, Edit2, Save, Eye, EyeOff } from "lucide-react";

export default function AdminDashboard() {
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
  const editorRef = useRef(null);

  // Fetch articles from backend
  const loadArticles = useCallback(async () => {
    setLoading(true);
    const allArticles = await fetchArticles();
    setArticles(allArticles);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  // Handle selecting an article for editing
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
      editorRef.current.getHTML && editorRef.current.getHTML(article.content);
    }
  };

  // Handle deleting an article
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this article?")) return;
    await deleteArticle(id);
    loadArticles();
  };

  // Handle saving/updating article
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
    setSelectedArticle(null);
    setTitle("");
    setExcerpt("");
    setCategory("");
    setTags([]);
    setFeaturedImage("");
    setIsDraft(true);
    setPreviewContent("");
    loadArticles();
  };

  // Auto-save draft
  useEffect(() => {
    if (!autoSave) return;
    const interval = setInterval(() => {
      if (!selectedArticle) return;
      handleSave();
    }, 30000); // every 30 seconds
    return () => clearInterval(interval);
  }, [autoSave, selectedArticle, title, excerpt, category, tags, featuredImage, previewContent]);

  // Update preview on editor change
  const handleEditorChange = (html) => {
    setPreviewContent(html);
  };

  // Word count / read time
  const wordCount = previewContent?.split(/\s+/).length || 0;
  const readTime = Math.ceil(wordCount / 200);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Editor + Preview */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <Card className="mb-4">
            <CardContent>
              <Input
                placeholder="Article Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mb-2"
              />
              <Input
                placeholder="Excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="mb-2"
              />
              <Input
                placeholder="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mb-2"
              />
              <Input
                placeholder="Tags (comma separated)"
                value={tags.join(", ")}
                onChange={(e) => setTags(e.target.value.split(",").map(t => t.trim()))}
                className="mb-2"
              />
              <Input
                placeholder="Featured Image URL"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                className="mb-2"
              />
              <div className="flex items-center gap-4 mb-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isDraft}
                    onChange={(e) => setIsDraft(e.target.checked)}
                  />
                  Save as Draft
                </label>
                <label className="flex items-center gap-2 ml-auto">
                  <input
                    type="checkbox"
                    checked={autoSave}
                    onChange={(e) => setAutoSave(e.target.checked)}
                  />
                  Auto-save Draft
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

              <Button className="mt-4" onClick={handleSave}>
                <Save size={16} className="inline-block mr-2" /> Save Article
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="flex-1">
          <Card>
            <CardContent>
              <h2 className="text-xl font-bold mb-2">Live Preview</h2>
              <div
                className="prose prose-invert max-w-full overflow-auto border rounded p-4 bg-gray-800"
                dangerouslySetInnerHTML={{ __html: previewContent }}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Articles List */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Articles</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid gap-4">
            {articles.map((article) => (
              <Card key={article.id} className={`flex justify-between items-center p-4 ${!article.is_published ? "bg-gray-800 opacity-80" : ""}`}>
                <div>
                  <h3 className="font-semibold">{article.title}</h3>
                  {!article.is_published && <span className="text-xs text-gray-400">Draft</span>}
                  <div className="text-sm text-gray-400">
                    {article.category} | {article.tags?.join(", ")}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(article)}>
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(article.id)}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// src/pages/AdminDashboard.js
import React, { useEffect, useState, useRef } from "react";
import {
  fetchArticles,
  createArticle,
  updateArticle,
  deleteArticle,
} from "../utils/api";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { motion } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";

import TipTapEditor from "../components/TipTapEditor";
import DOMPurify from "dompurify";
import "../styles/admin.css";

const getInitialForm = () => ({
  title: "",
  content: "<p></p>",
  excerpt: "",
  category: "east",
  tags: "",
  featured_image: "",
  is_featured: true,
  is_published: false,
});

export default function AdminDashboard() {
  const [articles, setArticles] = useState([]);
  const [formData, setFormData] = useState(getInitialForm());
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  // TipTap editor ref
  const editorRef = useRef(null);

  // Local preview state
  const [previewContent, setPreviewContent] = useState(formData.content);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      const data = await fetchArticles();
      if (Array.isArray(data)) {
        const unique = Array.from(new Map(data.map((a) => [a.id, a])).values());
        setArticles(unique);
      } else {
        setArticles([]);
      }
    } catch (err) {
      console.error("Failed to load articles", err);
      toast.error("❌ Failed to load articles");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e, publish = false) => {
    e.preventDefault();
    const editorHTML = editorRef.current?.getHTML() || "<p></p>";

    const tagsArray = formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 10);

    const payload = {
      ...formData,
      content: editorHTML, // only read on submit
      tags: tagsArray,
      is_published: publish,
    };

    try {
      if (isEditing) {
        await updateArticle(editingId, payload);
        toast.success("✅ Article updated!");
      } else {
        await createArticle(payload);
        toast.success(publish ? "✅ Article published!" : "✅ Draft saved!");
      }

      resetForm();
      await loadArticles();
    } catch (err) {
      console.error(err);
      toast.error("❌ Operation failed. Check console.");
    }
  };

  const handleEdit = (article) => {
    setFormData({
      ...article,
      tags: Array.isArray(article.tags) ? article.tags.join(", ") : "",
      content: article.content || "<p></p>",
    });
    setPreviewContent(article.content || "<p></p>");
    setEditingId(article.id);
    setIsEditing(true);
    setPreviewVisible(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this article?"
    );
    if (!confirmed) return;

    try {
      await deleteArticle(id);
      toast.success("🗑️ Article deleted");
      await loadArticles();
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to delete article.");
    }
  };

  const resetForm = () => {
    setFormData(getInitialForm());
    setPreviewContent("<p></p>");
    setIsEditing(false);
    setEditingId(null);
    setPreviewVisible(false);
  };

  const sanitizedBody = DOMPurify.sanitize(previewContent);

  return (
    <>
      <Toaster position="top-center" />
      <Header />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="admin-panel space-y-10 max-w-6xl mx-auto py-10"
      >
        <h1 className="font-azonix text-4xl font-bold text-white text-center">
          ANIMAC Admin Panel
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Form */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="neon-red bg-black border border-red-700 shadow-xl">
              <CardContent className="space-y-4 p-5">
                <h2 className="font-japanese text-2xl font-semibold text-white">
                  {isEditing ? "Edit Article" : "Post New Article"}
                </h2>

                <form className="space-y-4">
                  <Input
                    name="title"
                    placeholder="Title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />

                  <Input
                    name="featured_image"
                    placeholder="Cover Image URL (Imgur link)"
                    value={formData.featured_image}
                    onChange={handleChange}
                  />

                  <Input
                    name="category"
                    placeholder="Category (east/west)"
                    value={formData.category}
                    onChange={handleChange}
                  />

                  <Input
                    name="tags"
                    placeholder="Tags (comma-separated)"
                    value={formData.tags}
                    onChange={handleChange}
                  />

                  {/* TipTap editor */}
                  <div>
                    <label className="text-gray-300 mb-2 block">
                      Article Body
                    </label>
                    <TipTapEditor
                      ref={editorRef}
                      content={formData.content}
                      onChange={(html) => setPreviewContent(html)} // only for dashboard preview
                    />
                  </div>

                  <div className="flex items-center gap-6 text-white">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="is_featured"
                        checked={formData.is_featured}
                        onChange={handleChange}
                      />
                      Featured
                    </label>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      onClick={(e) => handleSubmit(e, false)}
                      className="w-full neon-btn font-azonix font-bold border-white tracking-wider text-lg"
                    >
                      {isEditing ? "Update Draft" : "Save Draft"}
                    </Button>
                    <Button
                      type="button"
                      onClick={(e) => handleSubmit(e, true)}
                      className="w-full neon-btn font-azonix font-bold border-white tracking-wider text-lg"
                    >
                      {isEditing ? "Publish Update" : "Publish"}
                    </Button>
                  </div>

                  {/* Preview toggle */}
                  <div className="mt-4 flex gap-2">
                    <Button
                      type="button"
                      onClick={() => setPreviewVisible(!previewVisible)}
                      className="neon-btn font-azonix text-white"
                    >
                      {previewVisible ? "Hide Preview" : "Show Preview"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right: Preview */}
          {previewVisible && (
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="neon-blue bg-black border border-blue-700 shadow-xl">
                <CardContent className="space-y-4 p-5">
                  <h2 className="font-japanese text-2xl font-semibold text-white">
                    Preview
                  </h2>

                  <div className="bg-white rounded-md overflow-hidden text-black">
                    {formData.featured_image ? (
                      <div className="w-full h-48 overflow-hidden bg-gray-200">
                        <img
                          src={formData.featured_image}
                          alt="cover"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-500">
                        Cover image preview
                      </div>
                    )}

                    <div className="p-6">
                      <h1 className="text-2xl font-bold mb-2">
                        {formData.title || "Article Title"}
                      </h1>
                      <div
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: sanitizedBody }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Existing articles list */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="neon-blue bg-black border border-blue-700 shadow-xl">
            <CardContent className="space-y-4 p-5">
              <h2 className="font-japanese text-2xl font-semibold text-white">
                Existing Articles
              </h2>
              {articles.length === 0 ? (
                <p className="text-gray-400">No articles found.</p>
              ) : (
                <ul className="space-y-4">
                  {articles.map((article) => (
                    <li
                      key={article.id}
                      className="border-b border-gray-700 pb-2 text-white"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <strong>{article.title}</strong> — {article.category} —{" "}
                          {article.is_published ? "✅" : "❌"}
                        </div>
                        <div className="space-x-3">
                          <Button
                            size="sm"
                            onClick={() => handleEdit(article)}
                            className="neon-btn-sm-purple"
                          >
                            ✒️
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(article.id)}
                            className="neon-btn-sm-red"
                          >
                            🗑️
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

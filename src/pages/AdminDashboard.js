// src/pages/AdminDashboard.js
import React, { useEffect, useState, useRef } from "react";
import { fetchArticles, createArticle, updateArticle, deleteArticle } from "../utils/api";
import TipTapEditor from "../components/TipTapEditor";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Pencil, Trash2 } from "lucide-react";

export default function AdminDashboard() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    excerpt: "",
    category: "east",
    featured_image: "",
    content: "",
    is_published: false,
  });
  const editorRef = useRef();

  const getTheme = (category) => {
    const cat = category?.toLowerCase();
    const map = {
      east: ["from-east-900/50 via-netflix-dark to-netflix-black", "neon-glow border-east-400 text-east-300 bg-east-800/20"],
      west: ["from-west-900/50 via-netflix-dark to-netflix-black", "neon-glow border-west-400 text-west-300 bg-west-800/20"],
    };
    return {
      gradient: map[cat]?.[0] || "from-gray-900 via-netflix-dark to-netflix-black",
      badge: map[cat]?.[1] || "neon-glow border-gray-500 text-gray-300 bg-gray-800/20",
    };
  };

  const loadArticles = async () => {
    setLoading(true);
    const data = await fetchArticles({ limit: 50 }); // fetch all including drafts
    setArticles(data);
    setLoading(false);
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDraftToggle = () => {
    setFormData((prev) => ({ ...prev, is_published: !prev.is_published }));
  };

  const handleSubmit = async () => {
    const content = editorRef.current?.getHTML() || "";
    const payload = { ...formData, content };
    if (!formData.title.trim()) return alert("Title required");

    if (formData.id) {
      await updateArticle(formData.id, payload);
    } else {
      await createArticle(payload);
    }
    setFormData({
      id: null,
      title: "",
      excerpt: "",
      category: "east",
      featured_image: "",
      content: "",
      is_published: false,
    });
    loadArticles();
  };

  const handleEdit = (article) => {
    setFormData({ ...article });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this article?")) {
      await deleteArticle(id);
      loadArticles();
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 text-white">Admin Dashboard</h1>

      {/* Article Form */}
      <Card className="mb-8 bg-zinc-900 text-gray-100 border border-gray-700">
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              placeholder="Article Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
            />
            <Input
              placeholder="Excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              placeholder="Featured Image URL"
              name="featured_image"
              value={formData.featured_image}
              onChange={handleInputChange}
            />
            {formData.featured_image && (
              <div className="flex items-center justify-center border rounded-lg overflow-hidden bg-black">
                <img src={formData.featured_image} alt="Preview" className="max-h-40 object-contain" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_published}
                onChange={handleDraftToggle}
              />
              Publish
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="bg-zinc-800 text-white px-2 py-1 rounded"
            >
              <option value="east">East</option>
              <option value="west">West</option>
            </select>
          </div>

          <div className="mb-4">
            <TipTapEditor ref={editorRef} initialContent={formData.content} />
          </div>

          <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
            {formData.id ? "Update Article" : "Create Article"}
          </Button>
        </CardContent>
      </Card>

      {/* Article List */}
      <h2 className="text-2xl font-semibold mb-4 text-white">Articles</h2>
      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : (
        <div className="grid gap-4">
          {articles.map((a) => {
            const theme = getTheme(a.category);
            return (
              <Card key={a.id} className={`flex items-center justify-between p-4 ${theme.badge}`}>
                <div>
                  <h3 className="font-bold text-white">
                    {a.title} {!a.is_published && <span className="text-yellow-300 italic">(Draft)</span>}
                  </h3>
                  <p className="text-gray-300 text-sm">{a.excerpt}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEdit(a)} title="Edit">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => handleDelete(a.id)} title="Delete">
                    <Trash2 size={18} />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

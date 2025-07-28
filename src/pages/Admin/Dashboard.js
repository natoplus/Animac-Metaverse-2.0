import { useEffect, useState } from "react";
import {
  fetchArticles,
  createArticle,
  fetchArticleById,
  updateArticle,
  deleteArticle
} from "../../utils/api";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export default function AdminDashboard() {
  const [articles, setArticles] = useState([]);
  const [formData, setFormData] = useState(initialFormState());
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  function initialFormState() {
    return {
      title: "",
      content: "",
      excerpt: "",
      category: "east",
      tags: "",
      featured_image: "",
      is_featured: true,
      is_published: true,
    };
  }

  const loadArticles = async () => {
    const data = await fetchArticles();
    setArticles(data || []);
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData, tags: formData.tags.split(",").map((t) => t.trim()) };

    try {
      if (isEditing) {
        await updateArticle(editingId, payload);
        alert("✅ Article updated!");
      } else {
        await createArticle(payload);
        alert("✅ Article posted!");
      }
      setFormData(initialFormState());
      setIsEditing(false);
      setEditingId(null);
      loadArticles();
    } catch (err) {
      alert("❌ Operation failed.");
      console.error(err);
    }
  };

  const handleEdit = (article) => {
    setFormData({
      ...article,
      tags: article.tags?.join(", ") || "",
    });
    setEditingId(article.id);
    setIsEditing(true);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this article?")) {
      await deleteArticle(id);
      loadArticles();
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">ANIMAC Admin Panel</h1>

      <Card>
        <CardContent className="space-y-4 p-4">
          <h2 className="text-xl font-semibold">{isEditing ? "Edit Article" : "Post New Article"}</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input name="title" placeholder="Title" value={formData.title} onChange={handleChange} required />
            <Textarea name="excerpt" placeholder="Excerpt" value={formData.excerpt} onChange={handleChange} />
            <Textarea name="content" placeholder="Content" rows={6} value={formData.content} onChange={handleChange} required />
            <Input name="category" placeholder="Category (east/west)" value={formData.category} onChange={handleChange} required />
            <Input name="tags" placeholder="Tags (comma-separated)" value={formData.tags} onChange={handleChange} />
            <Input name="featured_image" placeholder="Featured Image URL" value={formData.featured_image} onChange={handleChange} />
            <div className="flex gap-4">
              <label><input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleChange} /> Featured</label>
              <label><input type="checkbox" name="is_published" checked={formData.is_published} onChange={handleChange} /> Published</label>
            </div>
            <Button type="submit">{isEditing ? "Update" : "Submit"}</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-4">
          <h2 className="text-xl font-semibold">Existing Articles</h2>
          {articles.length === 0 ? (
            <p>No articles found.</p>
          ) : (
            <ul className="space-y-4">
              {articles.map((article) => (
                <li key={article.id} className="border-b py-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <strong>{article.title}</strong> - {article.category} - {article.is_published ? "✅ Published" : "❌ Draft"}
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
    </div>
  );
}

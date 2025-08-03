from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import os
from dotenv import load_dotenv
import uuid
import logging

# ---------- Load Env ----------
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Missing Supabase credentials in .env file")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ---------- Logging ----------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------- FastAPI App ----------
app = FastAPI(title="ANIMAC API")

# ---------- CORS ----------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://animac-metaverse.vercel.app",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Models ----------
class ArticleBase(BaseModel):
    title: str
    content: str
    excerpt: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = []
    featured_image: Optional[str] = None
    author: Optional[str] = "ANIMAC Team"
    is_featured: Optional[bool] = True
    is_published: Optional[bool] = True

class Article(ArticleBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    slug: str = Field(default_factory=str)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ArticleResponse(ArticleBase):
    id: str
    slug: str
    created_at: Optional[str]
    updated_at: Optional[str]

class ArticleUpdate(BaseModel):
    title: Optional[str]
    content: Optional[str]
    excerpt: Optional[str]
    category: Optional[str]
    tags: Optional[List[str]]
    featured_image: Optional[str]
    author: Optional[str]
    is_featured: Optional[bool]
    is_published: Optional[bool]

class CategoryStats(BaseModel):
    category: str
    count: int
    latest_article: Optional[dict] = None

class CommentBase(BaseModel):
    article_id: str
    content: str
    author: Optional[str] = "Anonymous"
    parent_id: Optional[str] = None

class Comment(CommentBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    likes: int = 0

class CommentResponse(CommentBase):
    id: str
    created_at: str
    likes: int
    replies: Optional[List['CommentResponse']] = []
    reply_count: int = 0

CommentResponse.update_forward_refs()

# ---------- Utils ----------
def slugify(text: str) -> str:
    return text.lower().replace(" ", "-").replace(".", "").replace(",", "")

# ---------- Routes ----------
@app.get("/")
async def root():
    return {"message": "Welcome to ANIMAC API"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "ANIMAC Backend"}

# ---------- Article Routes ----------
@app.post("/api/articles", response_model=ArticleResponse)
async def create_article(article: ArticleBase):
    logger.info("📩 Creating article: %s", article.title)
    article_model = Article(**article.dict())
    article_model.slug = slugify(article_model.title)
    if article_model.category:
        article_model.category = article_model.category.lower()
    data = article_model.dict()
    data["created_at"] = article_model.created_at.isoformat()
    data["updated_at"] = article_model.updated_at.isoformat()
    try:
        res = supabase.table("articles").insert(data).execute()
        logger.info("✅ Article created: %s", article_model.id)
        return ArticleResponse(**res.data[0])
    except Exception:
        logger.error("❌ Error creating article", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to create article")

@app.patch("/api/articles/{article_id}", response_model=ArticleResponse)
async def update_article(article_id: str, article_update: ArticleUpdate):
    logger.info("✏️ Updating article ID: %s", article_id)
    updates = {k: v for k, v in article_update.dict().items() if v is not None}
    updates["updated_at"] = datetime.utcnow().isoformat()
    if "title" in updates:
        updates["slug"] = slugify(updates["title"])
    try:
        res = supabase.table("articles").update(updates).eq("id", article_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Article not found")
        logger.info("✅ Article updated: %s", article_id)
        return ArticleResponse(**res.data[0])
    except Exception:
        logger.error("❌ Error updating article", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to update article")
    
@app.patch("/api/articles/{article_id}/publish")
async def publish_article(article_id: str):
    logger.info("🚀 Publishing article ID: %s", article_id)
    try:
        res = supabase.table("articles") \
            .update({"is_published": True, "updated_at": datetime.utcnow().isoformat()}) \
            .eq("id", article_id) \
            .execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Article not found")
        logger.info("✅ Article published: %s", article_id)
        return {"message": "Article published"}
    except Exception:
        logger.error("❌ Failed to publish article", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to publish article")


@app.get("/api/articles", response_model=List[ArticleResponse])
async def get_articles(category: Optional[str] = None, featured: Optional[bool] = None, is_published: Optional[bool] = True, limit: int = 20, skip: int = 0):
    try:
        query = supabase.table("articles").select("*")
        if is_published is not None:
            query = query.eq("is_published", is_published)
        if category:
            query = query.eq("category", category.lower())
        if featured is not None:
            query = query.eq("is_featured", featured)
        res = query.range(skip, skip + limit - 1).order("created_at", desc=True).execute()
        return [ArticleResponse(**item) for item in res.data]
    except Exception:
        logger.error("❌ Error fetching articles", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.get("/api/articles/by-id/{article_id}", response_model=ArticleResponse)
async def get_article_by_id(article_id: str):
    res = supabase.table("articles").select("*").eq("id", article_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Article not found")
    return ArticleResponse(**res.data[0])

@app.get("/api/articles/{slug}", response_model=ArticleResponse)
async def get_article_by_slug(slug: str):
    res = supabase.table("articles").select("*").eq("slug", slug).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Article not found")
    return ArticleResponse(**res.data[0])

@app.get("/api/featured-content", response_model=List[ArticleResponse])
async def get_featured_articles():
    try:
        res = supabase.table("articles") \
            .select("*") \
            .eq("is_featured", True) \
            .eq("is_published", True) \
            .order("created_at", desc=True) \
            .execute()
        return [ArticleResponse(**item) for item in res.data]
    except Exception:
        logger.error("❌ Error fetching featured content", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch featured content")

@app.delete("/api/articles/{article_id}")
async def delete_article(article_id: str):
    try:
        supabase.table("articles").delete().eq("id", article_id).execute()
        logger.info("🗑️ Article deleted: %s", article_id)
        return {"message": "Article deleted"}
    except Exception:
        logger.error("❌ Error deleting article", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to delete article")

# [COMMENTS OMITTED — SAME AS BEFORE]
# You can keep the comments section unchanged unless you want to optimize further

# ---------- Run ----------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

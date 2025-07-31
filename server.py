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
    article_model = Article(**article.dict())
    article_model.slug = slugify(article_model.title)
    if article_model.category:
        article_model.category = article_model.category.lower()
    data = article_model.dict()
    data["created_at"] = article_model.created_at.isoformat()
    data["updated_at"] = article_model.updated_at.isoformat()
    try:
        res = supabase.table("articles").insert(data).execute()
        return ArticleResponse(**res.data[0])
    except Exception:
        logging.error("❌ Error creating article", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to create article")

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
        logging.error("❌ Error fetching articles", exc_info=True)
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
        logging.error("❌ Error fetching featured content", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch featured content")


@app.delete("/api/articles/{article_id}")
async def delete_article(article_id: str):
    try:
        supabase.table("articles").delete().eq("id", article_id).execute()
        return {"message": "Article deleted"}
    except Exception:
        logging.error("❌ Error deleting article", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to delete article")

# ---------- Comment Routes ----------
@app.post("/api/comments", response_model=CommentResponse)
async def create_comment(comment: CommentBase, request: Request):
    comment_model = Comment(**comment.dict())
    if not comment_model.author:
        comment_model.author = "Anonymous"
    data = comment_model.dict()
    data["created_at"] = comment_model.created_at.isoformat()
    try:
        res = supabase.table("comments").insert(data).execute()
        if not res.data:
            raise HTTPException(status_code=500, detail="Insert failed")
        return CommentResponse(**res.data[0], replies=[])
    except Exception:
        logging.error("❌ Error creating comment", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to create comment")

@app.get("/api/comments/{article_id}", response_model=List[CommentResponse])
async def get_comments_for_article(article_id: str):
    try:
        res = supabase.table("comments").select("*").eq("article_id", article_id).order("created_at", desc=False).execute()
        flat_comments = res.data
        comment_map: dict[str, CommentResponse] = {}
        root_comments: List[CommentResponse] = []
        for c in flat_comments:
            comment = CommentResponse(**c, replies=[])
            comment_map[comment.id] = comment
        for c in flat_comments:
            cid = c["id"]
            parent_id = c.get("parent_id")
            if parent_id and parent_id in comment_map:
                comment_map[parent_id].replies.append(comment_map[cid])
            else:
                root_comments.append(comment_map[cid])
        return root_comments
    except Exception:
        logging.error("❌ Error fetching comments", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch comments")

@app.post("/api/comments/{comment_id}/like")
async def like_comment(comment_id: str, request: Request):
    session_id = request.headers.get("X-Session-ID")
    if not session_id:
        raise HTTPException(status_code=400, detail="Missing session identifier")
    try:
        existing = supabase.table("comment_likes").select("id").eq("comment_id", comment_id).eq("session_id", session_id).execute()
        if existing.data:
            raise HTTPException(status_code=403, detail="Already liked by this session")
        supabase.table("comment_likes").insert({
            "comment_id": comment_id,
            "session_id": session_id
        }).execute()
        res = supabase.table("comments").select("likes").eq("id", comment_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Comment not found")
        current_likes = res.data[0].get("likes", 0)
        updated = supabase.table("comments").update({"likes": current_likes + 1}).eq("id", comment_id).execute()
        return {"message": "Comment liked", "likes": updated.data[0]["likes"]}
    except Exception as e:
        logging.error(f"❌ Error liking comment: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to like comment: {str(e)}")
    
@app.post("/api/comments/{comment_id}/unlike")
async def unlike_comment(comment_id: str, request: Request):
    session_id = request.headers.get("X-Session-ID")
    if not session_id:
        raise HTTPException(status_code=400, detail="Missing session identifier")

    try:
        # Check if like exists
        existing = (
            supabase
            .table("comment_likes")
            .select("id")
            .eq("comment_id", comment_id)
            .eq("session_id", session_id)
            .execute()
        )

        if not existing.data:
            raise HTTPException(status_code=404, detail="Like not found")

        # Delete the like
        supabase.table("comment_likes").delete().eq("comment_id", comment_id).eq("session_id", session_id).execute()

        # Decrease likes count
        res = supabase.table("comments").select("likes").eq("id", comment_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Comment not found")

        current_likes = max(res.data[0].get("likes", 1) - 1, 0)
        updated = supabase.table("comments").update({"likes": current_likes}).eq("id", comment_id).execute()

        return {"message": "Comment unliked", "likes": updated.data[0]["likes"]}
    except Exception as e:
        logging.error(f"❌ Error unliking comment: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to unlike comment: {str(e)}")


# ---------- Run ----------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

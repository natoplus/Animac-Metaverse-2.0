from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import os
from dotenv import load_dotenv
from uuid import uuid4
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
    dislikes: int = 0

class CommentCreate(BaseModel):
    article_id: str
    content: str
    guest_name: str
    reply_to: Optional[str] = None

class CommentResponse(BaseModel):
    id: str
    article_id: str
    content: str
    guest_name: str
    created_at: str
    reply_to: Optional[str]
    upvotes: int
    downvotes: int
    reply_count: int


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
    except Exception as e:
        logging.error("❌ Error creating article:", exc_info=True)
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
    except Exception as e:
        logging.error("❌ Error fetching articles:", exc_info=True)
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

@app.put("/api/articles/{article_id}", response_model=ArticleResponse)
async def update_article_full(article_id: str, updated_data: ArticleBase):
    update_dict = updated_data.dict()
    update_dict["updated_at"] = datetime.utcnow().isoformat()

    if "title" in update_dict:
        update_dict["slug"] = slugify(update_dict["title"])
    if "category" in update_dict:
        update_dict["category"] = update_dict["category"].lower()

    res = supabase.table("articles").update(update_dict).eq("id", article_id).execute()
    if res.data:
        return ArticleResponse(**res.data[0])
    raise HTTPException(status_code=404, detail="Article not found")

@app.patch("/api/articles/{article_id}", response_model=ArticleResponse)
async def update_article_partial(article_id: str, updated_data: ArticleBase):
    partial = updated_data.dict(exclude_unset=True)
    partial["updated_at"] = datetime.utcnow().isoformat()

    if "title" in partial:
        partial["slug"] = slugify(partial["title"])
    if "category" in partial:
        partial["category"] = partial["category"].lower()

    res = supabase.table("articles").update(partial).eq("id", article_id).execute()
    if res.data:
        return ArticleResponse(**res.data[0])
    raise HTTPException(status_code=404, detail="Article not found")

@app.delete("/api/articles/{article_id}")
async def delete_article(article_id: str):
    try:
        res = supabase.table("articles").delete().eq("id", article_id).execute()
        if res.data:
            return {"message": "Article deleted successfully"}
        raise HTTPException(status_code=404, detail="Article not found or delete failed")
    except Exception as e:
        logging.error("❌ Error deleting article:", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.get("/api/categories/stats", response_model=List[CategoryStats])
async def get_category_stats():
    all_articles = supabase.table("articles").select("*").execute().data
    stats = {}
    for article in all_articles:
        cat = article["category"]
        if cat not in stats:
            stats[cat] = {"count": 0, "latest": None}
        stats[cat]["count"] += 1
        if not stats[cat]["latest"] or article["created_at"] > stats[cat]["latest"]["created_at"]:
            stats[cat]["latest"] = article

    return [
        CategoryStats(
            category=cat,
            count=data["count"],
            latest_article={
                "id": data["latest"]["id"],
                "title": data["latest"]["title"],
                "excerpt": data["latest"]["excerpt"],
                "created_at": data["latest"]["created_at"]
            }
        )
        for cat, data in stats.items()
    ]

@app.get("/api/featured-content")
async def get_featured_content():
    hero = { "east": None, "west": None }
    recent = {}

    for cat in ["east", "west"]:
        hero_res = supabase.table("articles").select("*").eq("category", cat).eq("is_featured", True).limit(1).execute()
        hero[cat] = hero_res.data[0] if hero_res.data else None

        recent_res = supabase.table("articles").select("*").eq("category", cat).order("created_at", desc=True).limit(6).execute()
        recent[cat] = recent_res.data

    return {
        "hero": hero,
        "recent_content": recent
    }

# -------- COMMENTS --------

@app.get("/api/articles/{article_id}/comments")
def get_comments(article_id: str):
    res = supabase.table("comments").select("*").eq("article_id", article_id).order("created_at", desc=True).execute()
    return res.data

@app.post("/api/comments")
def post_comment(payload: CommentCreate):
    comment_id = str(uuid4())
    comment_data = {
        "id": comment_id,
        "article_id": payload.article_id,
        "content": payload.content,
        "guest_name": payload.guest_name,
        "created_at": datetime.utcnow().isoformat(),
        "parent_id": payload.parent_id,
        "reply_count": 0,
        "upvotes": 0,
        "downvotes": 0
    }

    # Save comment
    supabase.table("comments").insert(comment_data).execute()

    # If it's a reply, increment reply_count on parent
    if payload.parent_id:
        parent = supabase.table("comments").select("*").eq("id", payload.parent_id).single().execute()
        if parent.data:
            reply_count = parent.data.get("reply_count", 0) + 1
            supabase.table("comments").update({"reply_count": reply_count}).eq("id", payload.parent_id).execute()

    return comment_data

# -------- LIKES / DOWNVOTES --------

@app.post("/api/comments/{comment_id}/like")
def like_comment(comment_id: str, payload: LikePayload):
    session_id = payload.session_id
    existing = supabase.table("comment_likes").select("*").eq("comment_id", comment_id).eq("session_id", session_id).single().execute()

    if existing.data:
        raise HTTPException(status_code=403, detail="Already liked by this session")

    supabase.table("comment_likes").insert({
        "comment_id": comment_id,
        "session_id": session_id
    }).execute()

    comment = supabase.table("comments").select("*").eq("id", comment_id).single().execute()
    upvotes = comment.data.get("upvotes", 0) + 1
    supabase.table("comments").update({"upvotes": upvotes}).eq("id", comment_id).execute()

    return {"message": "Liked"}

@app.post("/api/comments/{comment_id}/unlike")
def unlike_comment(comment_id: str, payload: LikePayload):
    session_id = payload.session_id
    supabase.table("comment_likes").delete().eq("comment_id", comment_id).eq("session_id", session_id).execute()

    comment = supabase.table("comments").select("*").eq("id", comment_id).single().execute()
    upvotes = max(0, comment.data.get("upvotes", 0) - 1)
    supabase.table("comments").update({"upvotes": upvotes}).eq("id", comment_id).execute()

    return {"message": "Unliked"}

@app.post("/api/comments/{comment_id}/downvote")
def downvote_comment(comment_id: str, payload: LikePayload):
    session_id = payload.session_id
    existing = supabase.table("comment_downvotes").select("*").eq("comment_id", comment_id).eq("session_id", session_id).single().execute()

    if existing.data:
        raise HTTPException(status_code=403, detail="Already downvoted by this session")

    supabase.table("comment_downvotes").insert({
        "comment_id": comment_id,
        "session_id": session_id
    }).execute()

    comment = supabase.table("comments").select("*").eq("id", comment_id).single().execute()
    downvotes = comment.data.get("downvotes", 0) + 1
    supabase.table("comments").update({"downvotes": downvotes}).eq("id", comment_id).execute()

    return {"message": "Downvoted"}

@app.post("/api/comments/{comment_id}/undownvote")
def undownvote_comment(comment_id: str, payload: LikePayload):
    session_id = payload.session_id
    supabase.table("comment_downvotes").delete().eq("comment_id", comment_id).eq("session_id", session_id).execute()

    comment = supabase.table("comments").select("*").eq("id", comment_id).single().execute()
    downvotes = max(0, comment.data.get("downvotes", 0) - 1)
    supabase.table("comments").update({"downvotes": downvotes}).eq("id", comment_id).execute()

    return {"message": "Downvote removed"}

# ---------- Run ----------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

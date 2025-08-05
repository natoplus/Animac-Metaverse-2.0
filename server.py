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

@app.post("/api/comments", response_model=CommentResponse)
async def create_comment(comment: CommentCreate, request: Request):
    comment_id = str(uuid4())
    now = datetime.utcnow().isoformat()

    new_comment = {
        "id": comment_id,
        "article_id": comment.article_id,
        "content": comment.content,
        "guest_name": comment.guest_name,
        "reply_to": comment.reply_to,
        "created_at": now,
        "upvotes": 0,
        "downvotes": 0,
        "reply_count": 0
    }

    supabase.table("comments").insert(new_comment).execute()

    if comment.reply_to:
        supabase.rpc("increment_reply_count", {"comment_id": comment.reply_to}).execute()

    return new_comment

@app.get("/api/comments", response_model=List[CommentResponse])
async def get_comments_by_article(article_id: str):
    comments = (
        supabase.table("comments")
        .select("*")
        .eq("article_id", article_id)
        .eq("reply_to", None)
        .order("created_at")
        .execute()
        .data
    )
    return comments

@app.get("/api/comments/{comment_id}/replies", response_model=List[CommentResponse])
async def get_replies(comment_id: str):
    replies = (
        supabase.table("comments")
        .select("*")
        .eq("reply_to", comment_id)
        .order("created_at")
        .execute()
        .data
    )
    return replies

@app.post("/api/comments/{comment_id}/like")
async def like_comment(comment_id: str, request: Request):
    session_id = request.client.host
    existing_like = (
        supabase.table("comment_likes")
        .select("*")
        .eq("comment_id", comment_id)
        .eq("session_id", session_id)
        .eq("type", "like")
        .execute().data
    )

    if existing_like:
        supabase.table("comment_likes").delete().eq("id", existing_like[0]["id"]).execute()
        supabase.rpc("decrement_upvotes", {"comment_id": comment_id}).execute()
        return {"status": "unliked"}
    else:
        supabase.table("comment_likes").delete().eq("comment_id", comment_id).eq("session_id", session_id).eq("type", "dislike").execute()
        supabase.table("comment_likes").insert({"comment_id": comment_id, "session_id": session_id, "type": "like"}).execute()
        supabase.rpc("increment_upvotes", {"comment_id": comment_id}).execute()
        return {"status": "liked"}

@app.post("/api/comments/{comment_id}/dislike")
async def dislike_comment(comment_id: str, request: Request):
    session_id = request.client.host
    existing_dislike = (
        supabase.table("comment_likes")
        .select("*")
        .eq("comment_id", comment_id)
        .eq("session_id", session_id)
        .eq("type", "dislike")
        .execute().data
    )

    if existing_dislike:
        supabase.table("comment_likes").delete().eq("id", existing_dislike[0]["id"]).execute()
        supabase.rpc("decrement_downvotes", {"comment_id": comment_id}).execute()
        return {"status": "undisliked"}
    else:
        supabase.table("comment_likes").delete().eq("comment_id", comment_id).eq("session_id", session_id).eq("type", "like").execute()
        supabase.table("comment_likes").insert({"comment_id": comment_id, "session_id": session_id, "type": "dislike"}).execute()
        supabase.rpc("increment_downvotes", {"comment_id": comment_id}).execute()
        return {"status": "disliked"}

# ---------- Run ----------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

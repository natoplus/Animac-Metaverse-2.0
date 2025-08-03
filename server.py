from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from supabase import create_client, Client
from pydantic import BaseModel
from typing import Optional
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
class Article(BaseModel):
    title: str
    content: str
    author: str
    category: str
    image: Optional[str] = None
    published: Optional[bool] = False
    likes: Optional[int] = 0
    bookmarks: Optional[int] = 0
    comments: Optional[int] = 0

class ArticleUpdate(BaseModel):
    title: Optional[str]
    content: Optional[str]
    author: Optional[str]
    category: Optional[str]
    image: Optional[str]
    published: Optional[bool]

class Comment(BaseModel):
    article_id: str
    text: str
    name: Optional[str] = "Guest"
    parent_id: Optional[str] = None

# ---------- Health ----------
@app.get("/")
async def root():
    return {"message": "ANIMAC FastAPI backend is running."}

# ---------- Article Routes ----------
@app.get("/api/articles")
async def get_articles():
    try:
        res = supabase.table("articles").select("*").eq("published", True).order("created_at", desc=True).execute()
        return res.data
    except Exception as e:
        logger.error(f"Error fetching articles: {e}")
        raise HTTPException(status_code=500, detail="Could not fetch articles.")

@app.get("/api/articles/featured")
async def get_featured_articles():
    try:
        res = supabase.table("articles").select("*").eq("published", True).order("likes", desc=True).limit(5).execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/articles/by-id/{article_id}")
async def get_article_by_id(article_id: str):
    try:
        res = supabase.table("articles").select("*").eq("id", article_id).single().execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Article not found")
        return res.data
    except Exception as e:
        raise HTTPException(status_code=404, detail="Article not found")

@app.get("/api/articles/by-category/{category}")
async def get_articles_by_category(category: str):
    try:
        res = supabase.table("articles").select("*").eq("category", category).eq("published", True).order("created_at", desc=True).execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/admin/articles")
async def create_article(article: Article):
    article_data = article.dict()
    article_data["id"] = str(uuid4())
    article_data["created_at"] = datetime.utcnow().isoformat()
    article_data["updated_at"] = article_data["created_at"]
    article_data["likes"] = 0
    article_data["bookmarks"] = 0
    article_data["comments"] = 0
    article_data["published"] = article.published or False

    res = supabase.table("articles").insert(article_data).execute()
    if res.get("status_code") not in [200, 201]:
        raise HTTPException(status_code=500, detail="Failed to create article")
    return {"message": "Article created", "id": article_data["id"]}

@app.put("/api/admin/articles/{article_id}")
async def update_article(article_id: str, article: Article):
    article_data = article.dict()
    article_data["updated_at"] = datetime.utcnow().isoformat()
    res = supabase.table("articles").update(article_data).eq("id", article_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Article not found")
    return {"message": "Article updated"}

@app.patch("/api/admin/articles/{article_id}")
async def patch_article(article_id: str, article: ArticleUpdate):
    try:
        patch_data = article.dict(exclude_unset=True)
        patch_data["updated_at"] = datetime.utcnow().isoformat()
        response = supabase.table("articles").update(patch_data).eq("id", article_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Article not found")
        return {"message": "Article patched", "article": response.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error patching article: {e}")

@app.patch("/api/admin/articles/{article_id}/publish")
async def publish_article(article_id: str):
    res = supabase.table("articles").update({"published": True, "updated_at": datetime.utcnow().isoformat()}).eq("id", article_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Article not found")
    return {"message": "Article published"}

@app.patch("/api/admin/articles/{article_id}/unpublish")
async def unpublish_article(article_id: str):
    res = supabase.table("articles").update({"published": False, "updated_at": datetime.utcnow().isoformat()}).eq("id", article_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Article not found")
    return {"message": "Article unpublished"}

@app.delete("/api/admin/articles/{article_id}")
async def delete_article(article_id: str):
    res = supabase.table("articles").delete().eq("id", article_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Article not found")
    return {"message": "Article deleted"}

# ---------- Comments ----------
@app.get("/api/comments/{article_id}")
async def get_comments(article_id: str):
    try:
        res = supabase.table("comments").select("*").eq("article_id", article_id).order("created_at", asc=True).execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/comments")
async def create_comment(comment: Comment, request: Request):
    comment_data = comment.dict()
    comment_data["id"] = str(uuid4())
    comment_data["created_at"] = datetime.utcnow().isoformat()
    comment_data["likes"] = 0

    try:
        supabase.table("comments").insert(comment_data).execute()
        supabase.rpc("increment_comment_count", {"article_id_input": comment.article_id}).execute()
        return {"message": "Comment added"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/comments/{comment_id}/like")
async def like_comment(comment_id: str, request: Request):
    session_id = request.cookies.get("session_id") or str(uuid4())
    existing = supabase.table("comment_likes").select("*").eq("comment_id", comment_id).eq("session_id", session_id).execute()

    if existing.data:
        raise HTTPException(status_code=403, detail="Already liked by this session")

    supabase.table("comment_likes").insert({
        "comment_id": comment_id,
        "session_id": session_id,
        "created_at": datetime.utcnow().isoformat()
    }).execute()

    supabase.rpc("increment_like_count", {"comment_id_input": comment_id}).execute()

    response = JSONResponse(content={"message": "Comment liked"})
    response.set_cookie(key="session_id", value=session_id, httponly=True)
    return response

@app.post("/api/comments/{comment_id}/unlike")
async def unlike_comment(comment_id: str, request: Request):
    session_id = request.cookies.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="No session found")

    like = supabase.table("comment_likes").select("*").eq("comment_id", comment_id).eq("session_id", session_id).execute()
    if not like.data:
        raise HTTPException(status_code=404, detail="Like not found")

    supabase.table("comment_likes").delete().eq("comment_id", comment_id).eq("session_id", session_id).execute()
    supabase.rpc("decrement_like_count", {"comment_id_input": comment_id}).execute()

    return {"message": "Comment unliked"}

# ---------- Run ----------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

from fastapi import FastAPI, HTTPException, Response, Request, Depends, Security
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
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
    reply_count: int = 0

CommentResponse.update_forward_refs()

# ---------- Utils ----------
def slugify(text: str) -> str:
    return text.lower().replace(" ", "-").replace(".", "").replace(",", "")

# ---------- Admin Auth ----------
def admin_auth(request: Request):
    token = request.headers.get("Authorization")
    if token != "Bearer your-secret-token":
        raise HTTPException(status_code=403, detail="Not authorized")
    return True

# ---------- Routes ----------
@app.get("/")
async def root():
    return {"message": "Welcome to ANIMAC API"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "ANIMAC Backend"}

# ---------- Admin Article Routes ----------
@app.post("/api/admin/articles", response_model=ArticleResponse, dependencies=[Depends(admin_auth)])
async def admin_create_article(article: ArticleBase):
    slug = slugify(article.title)
    now = datetime.utcnow().isoformat()
    new = article.dict()
    new.update({"id": str(uuid.uuid4()), "slug": slug, "created_at": now, "updated_at": now})
    res = supabase.table("articles").insert(new).execute()
    return ArticleResponse(**res.data[0])

@app.put("/api/admin/articles/{article_id}", response_model=ArticleResponse, dependencies=[Depends(admin_auth)])
async def admin_update_article(article_id: str, article: ArticleBase):
    updated = article.dict()
    updated["updated_at"] = datetime.utcnow().isoformat()
    res = supabase.table("articles").update(updated).eq("id", article_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Article not found")
    return ArticleResponse(**res.data[0])

@app.delete("/api/admin/articles/{article_id}", dependencies=[Depends(admin_auth)])
async def admin_delete_article(article_id: str):
    res = supabase.table("articles").delete().eq("id", article_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Article not found or already deleted")
    return {"message": "Deleted"}

@app.post("/api/admin/articles/{article_id}/publish", dependencies=[Depends(admin_auth)])
async def admin_publish(article_id: str):
    res = supabase.table("articles").update({"is_published": True}).eq("id", article_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Article not found")
    return {"message": "Article published"}

@app.post("/api/admin/articles/{article_id}/unpublish", dependencies=[Depends(admin_auth)])
async def admin_unpublish(article_id: str):
    res = supabase.table("articles").update({"is_published": False}).eq("id", article_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Article not found")
    return {"message": "Article unpublished"}

# ---------- Public Article Routes ----------
@app.post("/api/articles", response_model=ArticleResponse)
async def create_article(article: ArticleBase):
    article_model = Article(**article.dict())
    article_model.slug = slugify(article_model.title)
    if article_model.category:
        article_model.category = article_model.category.lower()
    data = article_model.dict()
    data["created_at"] = article_model.created_at.isoformat()
    data["updated_at"] = article_model.updated_at.isoformat()
    res = supabase.table("articles").insert(data).execute()
    return ArticleResponse(**res.data[0])

@app.get("/api/articles", response_model=List[ArticleResponse])
async def get_articles(category: Optional[str] = None, featured: Optional[bool] = None, is_published: Optional[bool] = True, limit: int = 20, skip: int = 0):
    query = supabase.table("articles").select("*")
    if is_published is not None:
        query = query.eq("is_published", is_published)
    if category:
        query = query.eq("category", category.lower())
    if featured is not None:
        query = query.eq("is_featured", featured)
    res = query.range(skip, skip + limit - 1).order("created_at", desc=True).execute()
    return [ArticleResponse(**item) for item in res.data]

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
    res = supabase.table("articles").select("*").eq("is_featured", True).eq("is_published", True).order("created_at", desc=True).execute()
    return [ArticleResponse(**item) for item in res.data]

@app.delete("/api/articles/{article_id}")
async def delete_article(article_id: str):
    supabase.table("articles").delete().eq("id", article_id).execute()
    return {"message": "Article deleted"}

# ---------- Search & Pagination ----------
class SearchParams(BaseModel):
    query: Optional[str] = None
    category: Optional[str] = None
    page: int = 1
    page_size: int = 10

@app.post("/api/articles/search", response_model=Dict[str, Any])
async def search_articles(params: SearchParams):
    q = supabase.table("articles").select("*")
    if params.query:
        q = q.ilike("title", f"%{params.query}%").or_("content.ilike", f"%{params.query}%")
    if params.category:
        q = q.eq("category", params.category.lower())
    q = q.eq("is_published", True)
    start = (params.page - 1) * params.page_size
    res = q.range(start, start + params.page_size - 1).order("created_at", desc=True).execute()
    total = supabase.table("articles").select("id").eq("is_published", True).execute().data
    return {
        "results": [ArticleResponse(**item) for item in res.data],
        "page": params.page,
        "page_size": params.page_size,
        "total": len(total),
    }

# ---------- Comment Routes ----------
@app.post("/api/comments", response_model=CommentResponse)
async def create_comment(comment: CommentBase, request: Request):
    comment_model = Comment(**comment.dict())
    data = comment_model.dict()
    data["created_at"] = comment_model.created_at.isoformat()
    res = supabase.table("comments").insert(data).execute()
    return CommentResponse(**res.data[0], replies=[], reply_count=0)

@app.get("/api/comments/{article_id}", response_model=List[CommentResponse])
async def get_comments_for_article(article_id: str):
    res = supabase.table("comments").select("*").eq("article_id", article_id).order("created_at", desc=False).execute()
    flat_comments = res.data
    comment_map: Dict[str, CommentResponse] = {}
    root_comments: List[CommentResponse] = []

    for c in flat_comments:
        reply_count = sum(1 for r in flat_comments if r.get("parent_id") == c["id"])
        comment = CommentResponse(**c, replies=[], reply_count=reply_count)
        comment_map[comment.id] = comment

    for c in flat_comments:
        cid = c["id"]
        parent_id = c.get("parent_id")
        if parent_id and parent_id in comment_map:
            comment_map[parent_id].replies.append(comment_map[cid])
        else:
            root_comments.append(comment_map[cid])

    return root_comments

@app.post("/api/comments/{comment_id}/like")
async def toggle_like_comment(comment_id: str, request: Request, response: Response):
    session_id = request.cookies.get("session_id")

    # Generate session_id if not present (useful for guests)
    if not session_id:
        session_id = str(uuid.uuid4())
        response.set_cookie(key="session_id", value=session_id, max_age=60*60*24*30, httponly=True)

    # Check if already liked
    existing_like = supabase.table("comment_likes") \
        .select("id") \
        .eq("comment_id", comment_id) \
        .eq("session_id", session_id) \
        .execute()

    # Get current like count safely
    comment_res = supabase.table("comments").select("likes").eq("id", comment_id).execute()
    if not comment_res.data:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    current_likes = comment_res.data[0].get("likes", 0)

    if existing_like.data:
        # Unlike
        supabase.table("comment_likes").delete() \
            .eq("comment_id", comment_id) \
            .eq("session_id", session_id).execute()

        updated_likes = max(current_likes - 1, 0)
        supabase.table("comments").update({"likes": updated_likes}) \
            .eq("id", comment_id).execute()

        return {"message": "Unliked", "likes": updated_likes}
    else:
        # Like
        supabase.table("comment_likes").insert({
            "comment_id": comment_id,
            "session_id": session_id
        }).execute()

        updated_likes = current_likes + 1
        supabase.table("comments").update({"likes": updated_likes}) \
            .eq("id", comment_id).execute()

        return {"message": "Liked", "likes": updated_likes}

# ---------- Run ----------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
# ---------- End of backend/server.py ----------
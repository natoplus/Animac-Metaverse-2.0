from fastapi import FastAPI, HTTPException, Response, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from dotenv import load_dotenv
import uuid
import os

# ---------- Environment ----------
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Supabase credentials missing")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ---------- App ----------
app = FastAPI(title="ANIMAC API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://animac-metaverse.vercel.app", "http://localhost:3000"],
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
    is_featured: Optional[bool] = False
    is_published: Optional[bool] = True

class ArticleResponse(ArticleBase):
    id: str
    slug: str
    created_at: str
    updated_at: str

class CommentBase(BaseModel):
    article_id: str
    content: str
    author: Optional[str] = "Anonymous"
    parent_id: Optional[str] = None

class CommentResponse(CommentBase):
    id: str
    created_at: str
    likes: int
    replies: List["CommentResponse"] = []
    reply_count: int = 0

CommentResponse.update_forward_refs()

class SearchParams(BaseModel):
    query: Optional[str] = None
    category: Optional[str] = None
    page: int = 1
    page_size: int = 10

# ---------- Helpers ----------
def slugify(text: str) -> str:
    return text.lower().replace(" ", "-").replace(".", "").replace(",", "")

def admin_auth(request: Request):
    token = request.headers.get("Authorization")
    if token != "Bearer your-secret-token":
        raise HTTPException(status_code=403, detail="Not authorized")

# ---------- Routes ----------
@app.get("/")
async def root():
    return {"message": "Welcome to ANIMAC API"}

@app.get("/api/health")
async def health():
    return {"status": "healthy"}

# ---------- Article Admin ----------
@app.post("/api/admin/articles", dependencies=[Depends(admin_auth)], response_model=ArticleResponse)
async def admin_create_article(article: ArticleBase):
    data = article.dict()
    now = datetime.utcnow().isoformat()
    data.update({
        "id": str(uuid.uuid4()),
        "slug": slugify(article.title),
        "created_at": now,
        "updated_at": now
    })
    res = supabase.table("articles").insert(data).execute()
    return ArticleResponse(**res.data[0])

@app.put("/api/admin/articles/{article_id}", dependencies=[Depends(admin_auth)], response_model=ArticleResponse)
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
        raise HTTPException(status_code=404, detail="Article not found")
    return {"message": "Deleted"}

@app.post("/api/admin/articles/{article_id}/publish", dependencies=[Depends(admin_auth)])
async def publish(article_id: str):
    res = supabase.table("articles").update({"is_published": True}).eq("id", article_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Article not found")
    return {"message": "Published"}

@app.post("/api/admin/articles/{article_id}/unpublish", dependencies=[Depends(admin_auth)])
async def unpublish(article_id: str):
    res = supabase.table("articles").update({"is_published": False}).eq("id", article_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Article not found")
    return {"message": "Unpublished"}

# ---------- Articles Public ----------
@app.get("/api/articles", response_model=List[ArticleResponse])
async def get_articles(category: Optional[str] = None, featured: Optional[bool] = None, is_published: bool = True, limit: int = 10, skip: int = 0):
    query = supabase.table("articles").select("*").eq("is_published", is_published)
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
async def featured():
    res = supabase.table("articles").select("*").eq("is_featured", True).eq("is_published", True).order("created_at", desc=True).execute()
    return [ArticleResponse(**item) for item in res.data]

@app.post("/api/articles/search", response_model=Dict[str, Any])
async def search_articles(params: SearchParams):
    q = supabase.table("articles").select("*").eq("is_published", True)
    if params.query:
        q = q.ilike("title", f"%{params.query}%").or_("content.ilike", f"%{params.query}%")
    if params.category:
        q = q.eq("category", params.category.lower())
    start = (params.page - 1) * params.page_size
    res = q.range(start, start + params.page_size - 1).order("created_at", desc=True).execute()
    total_count = supabase.table("articles").select("id").eq("is_published", True).execute().data
    return {
        "results": [ArticleResponse(**item) for item in res.data],
        "page": params.page,
        "page_size": params.page_size,
        "total": len(total_count),
    }

# ---------- Comments ----------
@app.post("/api/comments", response_model=CommentResponse)
async def post_comment(comment: CommentBase):
    c = CommentResponse(**comment.dict(), id=str(uuid.uuid4()), created_at=datetime.utcnow().isoformat(), likes=0)
    supabase.table("comments").insert(c.dict()).execute()
    return c

@app.get("/api/comments", response_model=List[CommentResponse])
async def get_comments(article_id: str):
    res = supabase.table("comments").select("*").eq("article_id", article_id).order("created_at").execute()
    flat = res.data
    mapping: Dict[str, CommentResponse] = {}
    roots: List[CommentResponse] = []

    for item in flat:
        comment = CommentResponse(**item, replies=[], reply_count=0)
        mapping[comment.id] = comment

    for item in flat:
        cid = item["id"]
        pid = item.get("parent_id")
        if pid and pid in mapping:
            mapping[pid].replies.append(mapping[cid])
            mapping[pid].reply_count += 1
        else:
            roots.append(mapping[cid])

    return roots

@app.post("/api/comments/{comment_id}/like")
async def toggle_like(comment_id: str, request: Request, response: Response):
    session_id = request.cookies.get("session_id")
    if not session_id:
        session_id = str(uuid.uuid4())
        response.set_cookie("session_id", session_id, max_age=60 * 60 * 24 * 30, httponly=True)

    like_check = supabase.table("comment_likes").select("id").eq("comment_id", comment_id).eq("session_id", session_id).execute()
    current = supabase.table("comments").select("likes").eq("id", comment_id).execute()
    if not current.data:
        raise HTTPException(status_code=404, detail="Comment not found")
    likes = current.data[0]["likes"] or 0

    if like_check.data:
        supabase.table("comment_likes").delete().eq("comment_id", comment_id).eq("session_id", session_id).execute()
        new_likes = max(likes - 1, 0)
        supabase.table("comments").update({"likes": new_likes}).eq("id", comment_id).execute()
        return {"message": "Unliked", "likes": new_likes}
    else:
        supabase.table("comment_likes").insert({"comment_id": comment_id, "session_id": session_id}).execute()
        new_likes = likes + 1
        supabase.table("comments").update({"likes": new_likes}).eq("id", comment_id).execute()
        return {"message": "Liked", "likes": new_likes}

# ---------- Article Likes & Bookmarks ----------
@app.post("/api/articles/{article_id}/like")
async def toggle_article_like(article_id: str, request: Request, response: Response):
    session_id = request.headers.get("X-Session-ID") or str(uuid.uuid4())
    like_check = supabase.table("article_likes").select("id").eq("article_id", article_id).eq("session_id", session_id).execute()

    if like_check.data:
        supabase.table("article_likes").delete().eq("article_id", article_id).eq("session_id", session_id).execute()
        return {"message": "Unliked", "liked": False}
    else:
        supabase.table("article_likes").insert({"article_id": article_id, "session_id": session_id}).execute()
        return {"message": "Liked", "liked": True}

@app.post("/api/articles/{article_id}/bookmark")
async def toggle_article_bookmark(article_id: str, request: Request, response: Response):
    session_id = request.headers.get("X-Session-ID") or str(uuid.uuid4())
    bookmark_check = supabase.table("article_bookmarks").select("id").eq("article_id", article_id).eq("session_id", session_id).execute()

    if bookmark_check.data:
        supabase.table("article_bookmarks").delete().eq("article_id", article_id).eq("session_id", session_id).execute()
        return {"message": "Unbookmarked", "bookmarked": False}
    else:
        supabase.table("article_bookmarks").insert({"article_id": article_id, "session_id": session_id}).execute()
        return {"message": "Bookmarked", "bookmarked": True}

# ---------- Main ----------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

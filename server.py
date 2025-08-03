from fastapi import FastAPI, APIRouter, Request, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from uuid import uuid4
from datetime import datetime
from dotenv import load_dotenv
import os
import logging

# Load .env
load_dotenv()

# Environment Variables
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("❌ Supabase credentials are missing! Check your .env file.")

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Supabase Client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# FastAPI App
app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

router = APIRouter()

# Helpers
def get_session_id(request: Request) -> str:
    return request.headers.get("x-session-id") or str(uuid4())

def require_admin(x_admin_token: str = Header(...)):
    if x_admin_token != ADMIN_TOKEN:
        raise HTTPException(status_code=403, detail="Unauthorized")

# =============================
# Comments
# =============================

@router.post("/api/comments")
async def create_comment(request: Request):
    body = await request.json()
    article_id = body.get("article_id")
    content = body.get("content")
    author = body.get("author", "Guest")
    parent_id = body.get("parent_id")

    if not article_id or not content:
        raise HTTPException(status_code=400, detail="Article ID and content are required")

    comment_data = {
        "id": str(uuid4()),
        "article_id": article_id,
        "content": content,
        "author": author,
        "parent_id": parent_id,
        "created_at": datetime.utcnow().isoformat()
    }

    try:
        supabase.table("comments").insert(comment_data).execute()
        return {"success": True, "comment_id": comment_data["id"]}
    except Exception as e:
        logger.error("Failed to create comment: %s", e)
        raise HTTPException(status_code=500, detail="Failed to create comment")

@router.get("/api/comments/{article_id}")
async def get_comments(article_id: str):
    try:
        comments = supabase.table("comments").select("*").eq("article_id", article_id).order("created_at", desc=False).execute().data or []
        likes = supabase.table("comment_likes").select("comment_id", "session_id").execute().data or []

        like_map = {}
        for like in likes:
            cid = like["comment_id"]
            like_map[cid] = like_map.get(cid, 0) + 1

        comment_dict = {}
        root_comments = []

        for comment in comments:
            comment["likes"] = like_map.get(comment["id"], 0)
            comment["replies"] = []
            comment_dict[comment["id"]] = comment

        for comment in comments:
            if comment["parent_id"]:
                parent = comment_dict.get(comment["parent_id"])
                if parent:
                    parent["replies"].append(comment)
            else:
                root_comments.append(comment)

        return root_comments
    except Exception as e:
        logger.error("Failed to fetch comments: %s", e)
        raise HTTPException(status_code=500, detail="Failed to fetch comments")

@router.post("/api/comments/{comment_id}/like")
async def like_comment(comment_id: str, request: Request):
    session_id = get_session_id(request)
    try:
        existing = supabase.table("comment_likes").select("*").eq("comment_id", comment_id).eq("session_id", session_id).execute().data
        if existing:
            raise HTTPException(status_code=403, detail="Already liked by this session")

        supabase.table("comment_likes").insert({"comment_id": comment_id, "session_id": session_id}).execute()
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to like comment: %s", e)
        raise HTTPException(status_code=500, detail="Failed to like comment")

@router.delete("/api/comments/{comment_id}/like")
async def unlike_comment(comment_id: str, request: Request):
    session_id = get_session_id(request)
    try:
        supabase.table("comment_likes").delete().eq("comment_id", comment_id).eq("session_id", session_id).execute()
        return {"success": True}
    except Exception as e:
        logger.error("Failed to unlike comment: %s", e)
        raise HTTPException(status_code=500, detail="Failed to unlike comment")

# =============================
# Articles
# =============================

@router.get("/api/articles")
async def get_articles(limit: int = 20, skip: int = 0, category: str = None, is_published: bool = True):
    try:
        query = supabase.table("articles").select("*")
        if category:
            query = query.eq("category", category)
        if is_published is not None:
            query = query.eq("is_published", is_published)
        query = query.range(skip, skip + limit - 1).order("created_at", desc=True)

        result = query.execute().data
        return result or []
    except Exception as e:
        logger.error("Failed to get articles: %s", e)
        raise HTTPException(status_code=500, detail="Failed to get articles")

@router.get("/api/articles/by-id/{article_id}")
async def get_article_by_id(article_id: str):
    try:
        result = supabase.table("articles").select("*").eq("id", article_id).single().execute().data
        if not result:
            raise HTTPException(status_code=404, detail="Article not found")
        return result
    except Exception as e:
        logger.error("Failed to fetch article: %s", e)
        raise HTTPException(status_code=500, detail="Failed to fetch article")

@router.get("/api/articles/featured")
async def get_featured_articles():
    try:
        result = supabase.table("articles").select("*").eq("is_featured", True).eq("is_published", True).order("created_at", desc=True).execute().data
        return result or []
    except Exception as e:
        logger.error("Failed to fetch featured articles: %s", e)
        raise HTTPException(status_code=500, detail="Failed to fetch featured articles")

@router.post("/api/articles")
async def create_article(request: Request, x_admin_token: str = Header(...)):
    require_admin(x_admin_token)
    data = await request.json()
    data["id"] = str(uuid4())
    data["created_at"] = datetime.utcnow().isoformat()
    data["updated_at"] = datetime.utcnow().isoformat()

    try:
        supabase.table("articles").insert(data).execute()
        return {"success": True, "id": data["id"]}
    except Exception as e:
        logger.error("Failed to create article: %s", e)
        raise HTTPException(status_code=500, detail="Failed to create article")
    

@router.put("/api/articles/{article_id}")
async def update_article(article_id: str, request: Request, x_admin_token: str = Header(...)):
    require_admin(x_admin_token)
    data = await request.json()
    data["updated_at"] = datetime.utcnow().isoformat()

    try:
        supabase.table("articles").update(data).eq("id", article_id).execute()
        return {"success": True}
    except Exception as e:
        logger.error("Failed to update article: %s", e)
        raise HTTPException(status_code=500, detail="Failed to update article")

@router.delete("/api/articles/{article_id}")
async def delete_article(article_id: str, x_admin_token: str = Header(...)):
    require_admin(x_admin_token)
    try:
        supabase.table("articles").delete().eq("id", article_id).execute()
        return {"success": True}
    except Exception as e:
        logger.error("Failed to delete article: %s", e)
        raise HTTPException(status_code=500, detail="Failed to delete article")

# =============================
# Mount API Routes
# =============================
app.include_router(router)

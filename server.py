from fastapi import FastAPI, APIRouter, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from supabase import create_client, Client
from uuid import uuid4
from datetime import datetime
from dotenv import load_dotenv
import os

# Load .env
load_dotenv()

# Environment Variables
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("❌ Supabase credentials are missing! Check your .env file.")

# Supabase Client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# FastAPI App
app = FastAPI()

# CORS (adjust origins for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router
router = APIRouter()


def get_session_id(request: Request) -> str:
    return request.headers.get("x-session-id") or str(uuid4())


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
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/comments/{article_id}")
async def get_comments(article_id: str):
    try:
        comments_response = supabase.table("comments").select("*").eq("article_id", article_id).order("created_at", desc=False).execute()
        comments = comments_response.data or []

        likes_response = supabase.table("comment_likes").select("comment_id", "session_id").execute()
        like_map = {}
        for like in likes_response.data or []:
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
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/comments/{comment_id}/like")
async def like_comment(comment_id: str, request: Request):
    session_id = get_session_id(request)
    try:
        existing = supabase.table("comment_likes").select("*").eq("comment_id", comment_id).eq("session_id", session_id).execute()
        if existing.data:
            raise HTTPException(status_code=403, detail="Already liked by this session")

        supabase.table("comment_likes").insert({
            "comment_id": comment_id,
            "session_id": session_id
        }).execute()

        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/api/comments/{comment_id}/like")
async def unlike_comment(comment_id: str, request: Request):
    session_id = get_session_id(request)
    try:
        supabase.table("comment_likes").delete().eq("comment_id", comment_id).eq("session_id", session_id).execute()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/articles")
async def get_articles(limit: int = 20, skip: int = 0, category: str = None, is_published: bool = True):
    try:
        query = supabase.table("articles").select("*")
        
        if category:
            query = query.eq("category", category)
        if is_published is not None:
            query = query.eq("is_published", is_published)

        query = query.range(skip, skip + limit - 1).order("created_at", desc=True)
        result = query.execute()
        return result.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



# Mount the API router
app.include_router(router)

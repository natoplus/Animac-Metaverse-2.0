from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List
from uuid import uuid4
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv
import os

load_dotenv()

router = APIRouter()

# Supabase client initialization
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_session_id(request: Request) -> str:
    return request.headers.get("x-session-id") or str(uuid4())

# ------------------------
# Schemas
# ------------------------

class CommentCreate(BaseModel):
    article_id: str
    content: str
    author: Optional[str] = "Guest"
    parent_id: Optional[str] = None


# ------------------------
# Routes
# ------------------------

@router.post("/api/comments")
async def create_comment(request: Request, payload: CommentCreate):
    """
    Create a comment (or a threaded reply if `parent_id` is provided).
    """
    comment_id = str(uuid4())
    timestamp = datetime.utcnow().isoformat()

    comment_data = {
        "id": comment_id,
        "article_id": payload.article_id,
        "content": payload.content,
        "author": payload.author,
        "created_at": timestamp,
        "parent_id": payload.parent_id
    }

    try:
        supabase.table("comments").insert(comment_data).execute()
        return {"success": True, "comment_id": comment_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/comments/{article_id}")
async def get_comments(article_id: str):
    """
    Fetch all comments and threaded replies for an article, with like count.
    """
    try:
        comments_response = supabase \
            .table("comments") \
            .select("*", count="exact") \
            .eq("article_id", article_id) \
            .order("created_at", desc=False) \
            .execute()

        comments = comments_response.data

        likes_response = supabase.table("comment_likes").select("comment_id", "session_id").execute()
        like_map = {}
        for like in likes_response.data:
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
    """
    Like a comment (only once per session).
    """
    session_id = get_session_id(request)
    try:
        existing = supabase \
            .table("comment_likes") \
            .select("*") \
            .eq("comment_id", comment_id) \
            .eq("session_id", session_id) \
            .execute()

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
    """
    Unlike a comment (removes like from session).
    """
    session_id = get_session_id(request)
    try:
        supabase.table("comment_likes") \
            .delete() \
            .eq("comment_id", comment_id) \
            .eq("session_id", session_id) \
            .execute()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

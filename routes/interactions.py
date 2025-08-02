from fastapi import APIRouter, HTTPException, Request
from supabase import create_client, Client
from uuid import uuid4
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

router = APIRouter(prefix="/api/interactions", tags=["Interactions"])


# --- Article Likes ---

@router.post("/articles/{article_id}/like")
async def like_article(article_id: str, request: Request):
    session_id = request.headers.get("x-session-id")
    if not session_id:
        raise HTTPException(status_code=400, detail="Missing session ID")

    existing = supabase.table("article_likes").select("*").eq("article_id", article_id).eq("session_id", session_id).execute()
    if existing.data:
        raise HTTPException(status_code=403, detail="Already liked")

    supabase.table("article_likes").insert({
        "id": str(uuid4()),
        "article_id": article_id,
        "session_id": session_id
    }).execute()

    return {"message": "Article liked"}


@router.post("/articles/{article_id}/unlike")
async def unlike_article(article_id: str, request: Request):
    session_id = request.headers.get("x-session-id")
    if not session_id:
        raise HTTPException(status_code=400, detail="Missing session ID")

    supabase.table("article_likes").delete().eq("article_id", article_id).eq("session_id", session_id).execute()
    return {"message": "Article unliked"}


# --- Article Bookmarks ---

@router.post("/articles/{article_id}/bookmark")
async def bookmark_article(article_id: str, request: Request):
    session_id = request.headers.get("x-session-id")
    if not session_id:
        raise HTTPException(status_code=400, detail="Missing session ID")

    existing = supabase.table("article_bookmarks").select("*").eq("article_id", article_id).eq("session_id", session_id).execute()
    if existing.data:
        raise HTTPException(status_code=403, detail="Already bookmarked")

    supabase.table("article_bookmarks").insert({
        "id": str(uuid4()),
        "article_id": article_id,
        "session_id": session_id
    }).execute()

    return {"message": "Article bookmarked"}


@router.post("/articles/{article_id}/unbookmark")
async def unbookmark_article(article_id: str, request: Request):
    session_id = request.headers.get("x-session-id")
    if not session_id:
        raise HTTPException(status_code=400, detail="Missing session ID")

    supabase.table("article_bookmarks").delete().eq("article_id", article_id).eq("session_id", session_id).execute()
    return {"message": "Article unbookmarked"}


# --- Comment Likes ---

@router.post("/comments/{comment_id}/like")
async def like_comment(comment_id: str, request: Request):
    session_id = request.headers.get("x-session-id")
    if not session_id:
        raise HTTPException(status_code=400, detail="Missing session ID")

    existing = supabase.table("comment_likes").select("*").eq("comment_id", comment_id).eq("session_id", session_id).execute()
    if existing.data:
        raise HTTPException(status_code=403, detail="Already liked")

    supabase.table("comment_likes").insert({
        "id": str(uuid4()),
        "comment_id": comment_id,
        "session_id": session_id
    }).execute()

    return {"message": "Comment liked"}


@router.post("/comments/{comment_id}/unlike")
async def unlike_comment(comment_id: str, request: Request):
    session_id = request.headers.get("x-session-id")
    if not session_id:
        raise HTTPException(status_code=400, detail="Missing session ID")

    supabase.table("comment_likes").delete().eq("comment_id", comment_id).eq("session_id", session_id).execute()
    return {"message": "Comment unliked"}

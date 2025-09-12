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


def _require_session_id(request: Request) -> str:
    session_id = request.headers.get("x-session-id")
    if not session_id:
        raise HTTPException(status_code=400, detail="Missing session ID")
    return session_id


def _increment_article_counter(article_id: str, field: str, delta: int):
    article_res = supabase.table("articles").select(field).eq("id", article_id).single().execute()
    current_value = 0
    if article_res.data and isinstance(article_res.data.get(field), int):
        current_value = article_res.data[field]
    new_value = max(0, current_value + delta)
    supabase.table("articles").update({field: new_value}).eq("id", article_id).execute()


# --- Article Likes ---

@router.post("/articles/{article_id}/like")
async def like_article(article_id: str, request: Request):
    session_id = _require_session_id(request)

    existing = supabase.table("article_likes").select("*").eq("article_id", article_id).eq("session_id", session_id).execute()
    if existing.data:
        raise HTTPException(status_code=403, detail="Already liked")

    supabase.table("article_likes").insert({
        "id": str(uuid4()),
        "article_id": article_id,
        "session_id": session_id
    }).execute()

    _increment_article_counter(article_id, "likes", 1)
    return {"message": "Article liked"}


@router.post("/articles/{article_id}/unlike")
async def unlike_article(article_id: str, request: Request):
    session_id = _require_session_id(request)

    deleted = supabase.table("article_likes").delete().eq("article_id", article_id).eq("session_id", session_id).execute()
    if deleted.data:
        _increment_article_counter(article_id, "likes", -1)
    return {"message": "Article unliked"}


# --- Article Bookmarks ---

@router.post("/articles/{article_id}/bookmark")
async def bookmark_article(article_id: str, request: Request):
    session_id = _require_session_id(request)

    existing = supabase.table("article_bookmarks").select("*").eq("article_id", article_id).eq("session_id", session_id).execute()
    if existing.data:
        raise HTTPException(status_code=403, detail="Already bookmarked")

    supabase.table("article_bookmarks").insert({
        "id": str(uuid4()),
        "article_id": article_id,
        "session_id": session_id
    }).execute()

    _increment_article_counter(article_id, "bookmarks", 1)
    return {"message": "Article bookmarked"}


@router.post("/articles/{article_id}/unbookmark")
async def unbookmark_article(article_id: str, request: Request):
    session_id = _require_session_id(request)

    deleted = supabase.table("article_bookmarks").delete().eq("article_id", article_id).eq("session_id", session_id).execute()
    if deleted.data:
        _increment_article_counter(article_id, "bookmarks", -1)
    return {"message": "Article unbookmarked"}


# --- Article Shares ---

@router.post("/articles/{article_id}/share")
async def share_article(article_id: str, request: Request):
    session_id = _require_session_id(request)

    existing = supabase.table("article_shares").select("id").eq("article_id", article_id).eq("session_id", session_id).execute()
    if existing.data:
        raise HTTPException(status_code=403, detail="Already shared")

    supabase.table("article_shares").insert({
        "id": str(uuid4()),
        "article_id": article_id,
        "session_id": session_id
    }).execute()

    _increment_article_counter(article_id, "shares", 1)
    return {"message": "Article shared"}


# --- Status for current session ---

@router.get("/articles/{article_id}/status")
async def article_status(article_id: str, request: Request):
    session_id = _require_session_id(request)

    liked = supabase.table("article_likes").select("id").eq("article_id", article_id).eq("session_id", session_id).execute()
    bookmarked = supabase.table("article_bookmarks").select("id").eq("article_id", article_id).eq("session_id", session_id).execute()
    shared = supabase.table("article_shares").select("id").eq("article_id", article_id).eq("session_id", session_id).execute()

    return {
        "liked": bool(liked.data),
        "bookmarked": bool(bookmarked.data),
        "shared": bool(shared.data)
    }


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

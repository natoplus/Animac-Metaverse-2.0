# routes/admin.py
from fastapi import APIRouter, HTTPException, Depends, Request
from models import Article, ArticleUpdate
from utils import admin_auth
from supabase_client import supabase
from uuid import uuid4
from datetime import datetime

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.post("/articles")
async def create_article(article: Article, request: Request, token=Depends(admin_auth)):
    article_data = article.dict()
    article_data["id"] = str(uuid4())
    article_data["created_at"] = datetime.utcnow().isoformat()
    article_data["updated_at"] = article_data["created_at"]
    article_data["likes"] = 0
    article_data["bookmarks"] = 0
    article_data["comments"] = 0
    article_data["published"] = False

    res = supabase.table("articles").insert(article_data).execute()
    if res.get("status_code") != 201:
        raise HTTPException(status_code=500, detail="Failed to create article")
    return {"message": "Article created", "id": article_data["id"]}


@router.put("/articles/{article_id}")
async def full_update_article(article_id: str, article: Article, token=Depends(admin_auth)):
    article_data = article.dict()
    article_data["updated_at"] = datetime.utcnow().isoformat()
    res = supabase.table("articles").update(article_data).eq("id", article_id).execute()
    if res.get("status_code") != 200:
        raise HTTPException(status_code=404, detail="Article not found")
    return {"message": "Article fully updated"}


@router.patch("/articles/{article_id}")
async def partial_update_article(article_id: str, article: ArticleUpdate, token=Depends(admin_auth)):
    try:
        update_data = article.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow().isoformat()

        res = supabase.table("articles").update(update_data).eq("id", article_id).execute()
        if len(res.data) == 0:
            raise HTTPException(status_code=404, detail="Article not found")

        return {"message": "Article partially updated", "article": res.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating article: {e}")


@router.delete("/articles/{article_id}")
async def delete_article(article_id: str, token=Depends(admin_auth)):
    res = supabase.table("articles").delete().eq("id", article_id).execute()
    if res.get("status_code") != 200:
        raise HTTPException(status_code=404, detail="Article not found")
    return {"message": "Article deleted"}


@router.patch("/articles/{article_id}/publish")
async def publish_article(article_id: str, token=Depends(admin_auth)):
    res = supabase.table("articles").update({"published": True}).eq("id", article_id).execute()
    if res.get("status_code") != 200:
        raise HTTPException(status_code=404, detail="Article not found")
    return {"message": "Article published"}


@router.patch("/articles/{article_id}/unpublish")
async def unpublish_article(article_id: str, token=Depends(admin_auth)):
    res = supabase.table("articles").update({"published": False}).eq("id", article_id).execute()
    if res.get("status_code") != 200:
        raise HTTPException(status_code=404, detail="Article not found")
    return {"message": "Article unpublished"}

# routes/admin.py

from fastapi import APIRouter, HTTPException, Depends, Request, Body
from models import Article
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

    response = supabase.table("articles").insert(article_data).execute()
    if response.error:
        raise HTTPException(status_code=500, detail=response.error.message)

    return {"message": "Article created", "id": article_data["id"]}


@router.patch("/articles/{article_id}")
async def update_article_partial(article_id: str, data: dict = Body(...), token=Depends(admin_auth)):
    data["updated_at"] = datetime.utcnow().isoformat()

    response = supabase.table("articles").update(data).eq("id", article_id).execute()
    if response.error:
        raise HTTPException(status_code=500, detail=response.error.message)

    return {"message": "Article updated successfully"}


@router.delete("/articles/{article_id}")
async def delete_article(article_id: str, token=Depends(admin_auth)):
    response = supabase.table("articles").delete().eq("id", article_id).execute()
    if response.error:
        raise HTTPException(status_code=404, detail=response.error.message)

    return {"message": "Article deleted"}


@router.patch("/articles/{article_id}/publish")
async def publish_article(article_id: str, token=Depends(admin_auth)):
    response = supabase.table("articles").update({"published": True, "updated_at": datetime.utcnow().isoformat()}).eq("id", article_id).execute()
    if response.error:
        raise HTTPException(status_code=404, detail=response.error.message)

    return {"message": "Article published"}


@router.patch("/articles/{article_id}/unpublish")
async def unpublish_article(article_id: str, token=Depends(admin_auth)):
    response = supabase.table("articles").update({"published": False, "updated_at": datetime.utcnow().isoformat()}).eq("id", article_id).execute()
    if response.error:
        raise HTTPException(status_code=404, detail=response.error.message)

    return {"message": "Article unpublished"}

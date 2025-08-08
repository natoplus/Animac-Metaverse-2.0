from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID
from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

router = APIRouter()

class Article(BaseModel):
    id: Optional[UUID]
    title: str
    content: str
    excerpt: Optional[str] = None
    image: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = []
    is_featured: Optional[bool] = False
    author: Optional[str] = None

@router.get("/api/articles")
def get_articles():
    response = supabase.table("articles").select("*").execute()
    return response.data

@router.get("/api/articles/{article_id}")
def get_article(article_id: str):
    response = supabase.table("articles").select("*").eq("id", article_id).single().execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Article not found")
    return response.data

@router.post("/api/articles")
def create_article(article: Article):
    response = supabase.table("articles").insert(article.dict()).execute()
    return {"message": "✅ Article created", "data": response.data}

@router.put("/api/articles/{article_id}")
def update_article(article_id: str, article: Article):
    response = supabase.table("articles").update(article.dict(exclude_unset=True)).eq("id", article_id).execute()
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to update article")
    return {"message": "✅ Article updated", "data": response.data}

@router.delete("/api/articles/{article_id}")
def delete_article(article_id: str):
    response = supabase.table("articles").delete().eq("id", article_id).execute()
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to delete article")
    return {"message": "🗑️ Article deleted"}

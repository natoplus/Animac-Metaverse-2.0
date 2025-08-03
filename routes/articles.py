from fastapi import APIRouter, HTTPException, Request, status
from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID
import logging

router = APIRouter()

# Pydantic model for article input/output
class Article(BaseModel):
    id: Optional[UUID] = None
    title: str
    content: str
    excerpt: Optional[str] = None
    image: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    is_featured: Optional[bool] = False
    author: Optional[str] = None

# Get all articles
@router.get("/articles", response_model=List[dict])
def get_articles(request: Request):
    supabase = request.app.state.supabase
    response = supabase.table("articles").select("*").order("created_at", desc=True).execute()
    if response.error:
        logging.error("Error fetching articles: %s", response.error.message)
        raise HTTPException(status_code=500, detail="Failed to fetch articles")
    return response.data or []

# Get a single article by ID
@router.get("/articles/{article_id}", response_model=dict)
def get_article(article_id: UUID, request: Request):
    supabase = request.app.state.supabase
    response = supabase.table("articles").select("*").eq("id", str(article_id)).single().execute()
    if response.error or not response.data:
        logging.warning("Article not found: %s", article_id)
        raise HTTPException(status_code=404, detail="Article not found")
    return response.data

# Create an article
@router.post("/articles", status_code=status.HTTP_201_CREATED, response_model=dict)
def create_article(article: Article, request: Request):
    supabase = request.app.state.supabase
    response = supabase.table("articles").insert(article.dict(exclude_unset=True)).execute()
    if response.error or not response.data:
        logging.error("Failed to create article: %s", response.error.message if response.error else "Unknown error")
        raise HTTPException(status_code=400, detail="Failed to create article")
    return {"message": "✅ Article created", "data": response.data[0]}

# Update an article
@router.put("/articles/{article_id}", response_model=dict)
def update_article(article_id: UUID, article: Article, request: Request):
    supabase = request.app.state.supabase
    response = supabase.table("articles").update(article.dict(exclude_unset=True)).eq("id", str(article_id)).execute()
    if response.error:
        logging.error("Failed to update article %s: %s", article_id, response.error.message)
        raise HTTPException(status_code=400, detail="Failed to update article")
    return {"message": "✅ Article updated", "data": response.data[0] if response.data else {}}

# Delete an article
@router.delete("/articles/{article_id}", response_model=dict)
def delete_article(article_id: UUID, request: Request):
    supabase = request.app.state.supabase
    response = supabase.table("articles").delete().eq("id", str(article_id)).execute()
    if response.error:
        logging.error("Failed to delete article %s: %s", article_id, response.error.message)
        raise HTTPException(status_code=400, detail="Failed to delete article")
    return {"message": "🗑️ Article deleted", "data": response.data[0] if response.data else {}}

from fastapi import APIRouter, HTTPException, Request, status
from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID

router = APIRouter()

# Pydantic model
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
        raise HTTPException(status_code=500, detail="Failed to fetch articles")
    return response.data or []

# Get a single article by ID
@router.get("/articles/{article_id}", response_model=dict)
def get_article(article_id: str, request: Request):
    supabase = request.app.state.supabase
    response = supabase.table("articles").select("*").eq("id", article_id).single().execute()
    if response.error or not response.data:
        raise HTTPException(status_code=404, detail="Article not found")
    return response.data

# Create an article
@router.post("/articles", status_code=status.HTTP_201_CREATED)
def create_article(article: Article, request: Request):
    supabase = request.app.state.supabase
    response = supabase.table("articles").insert(article.dict(exclude_unset=True)).execute()
    if response.error or not response.data:
        raise HTTPException(status_code=400, detail="Failed to create article")
    return {"message": "✅ Article created", "data": response.data[0]}

# Update an article
@router.put("/articles/{article_id}")
def update_article(article_id: str, article: Article, request: Request):
    supabase = request.app.state.supabase
    response = supabase.table("articles").update(article.dict(exclude_unset=True)).eq("id", article_id).execute()
    if response.error:
        raise HTTPException(status_code=400, detail="Failed to update article")
    return {"message": "✅ Article updated", "data": response.data[0] if response.data else {}}

# Delete an article
@router.delete("/articles/{article_id}")
def delete_article(article_id: str, request: Request):
    supabase = request.app.state.supabase
    response = supabase.table("articles").delete().eq("id", article_id).execute()
    if response.error:
        raise HTTPException(status_code=400, detail="Failed to delete article")
    return {"message": "🗑️ Article deleted", "data": response.data[0] if response.data else {}}

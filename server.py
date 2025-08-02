# server.py

import os
import uuid
import logging
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Dict

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from supabase import create_client, Client

# ---------- Load Environment Variables ----------
load_dotenv(dotenv_path=Path(".env"))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    logging.error("❌ Supabase credentials are missing! Check your .env file for SUPABASE_URL and SUPABASE_KEY.")
    raise RuntimeError("Supabase credentials not found")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ---------- Logging ----------
logging.basicConfig(level=logging.INFO)

# ---------- FastAPI App ----------
app = FastAPI(title="ANIMAC API")

# ---------- CORS ----------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://animac-metaverse.vercel.app",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Models ----------
class ArticleBase(BaseModel):
    title: str
    content: str
    excerpt: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = []
    featured_image: Optional[str] = None
    author: Optional[str] = "ANIMAC Team"
    is_featured: Optional[bool] = True
    is_published: Optional[bool] = True

    class Config:
        orm_mode = True


class Article(ArticleBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    slug: str = Field(default_factory=str)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ArticleResponse(ArticleBase):
    id: str
    slug: str
    created_at: Optional[str]
    updated_at: Optional[str]


class CategoryStats(BaseModel):
    category: str
    count: int
    latest_article: Optional[dict] = None


class CommentBase(BaseModel):
    article_id: str
    content: str
    author: Optional[str] = "Anonymous"
    parent_id: Optional[str] = None


class Comment(CommentBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    likes: int = 0


class CommentResponse(CommentBase):
    id: str
    created_at: str
    likes: int
    replies: Optional[List["CommentResponse"]] = []

    class Config:
        orm_mode = True


CommentResponse.update_forward_refs()

# ---------- Utils ----------
def slugify(text: str) -> str:
    return (
        text.strip()
        .lower()
        .replace(" ", "-")
        .replace(".", "")
        .replace(",", "")
        .replace(":", "")
        .replace("'", "")
    )

# ---------- Basic Routes ----------
@app.get("/")
async def root():
    return {"message": "Welcome to ANIMAC API"}

@app.get("/api/health")
async def health():
    return {"status": "healthy"}

# ---------- Routers ----------
from routes import admin, articles, comments, interactions

app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(articles.router, prefix="/api", tags=["Articles"])
app.include_router(comments.router, prefix="/api", tags=["Comments"])
app.include_router(interactions.router, prefix="/api", tags=["Interactions"])

# ---------- Entry Point ----------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8001, reload=True)

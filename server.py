from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import os
from dotenv import load_dotenv
import uuid

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Missing Supabase credentials in .env file")

print("Supabase Credentials:")
print("URL:", SUPABASE_URL)
print("KEY:", SUPABASE_KEY[:5] + "..." + SUPABASE_KEY[-5:])

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI(title="ANIMAC API", description="API for ANIMAC streaming culture platform")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class ArticleBase(BaseModel):
    title: str
    content: str
    excerpt: str
    category: str  # 'east' or 'west'
    tags: List[str] = []
    featured_image: Optional[str] = None
    author: str = "ANIMAC Team"
    read_time: int = 5
    is_featured: bool = False

class Article(ArticleBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ArticleResponse(Article):
    pass

class CategoryStats(BaseModel):
    category: str
    count: int
    latest_article: Optional[dict] = None

# Routes
@app.get("/")
async def root():
    return {"message": "Welcome to ANIMAC API - Streaming Culture, Streaming Stories"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "ANIMAC Backend"}

@app.post("/api/articles", response_model=ArticleResponse)
async def create_article(article: ArticleBase):
    article_model = Article(**article.dict())
    data = article_model.dict()
    data["created_at"] = article_model.created_at.isoformat()
    data["updated_at"] = article_model.updated_at.isoformat()

    res = supabase.table("articles").insert(data).execute()
    if res.data:
        return ArticleResponse(**res.data[0])
    raise HTTPException(status_code=400, detail="Failed to create article")

@app.get("/api/articles", response_model=List[ArticleResponse])
async def get_articles(category: Optional[str] = None, featured: Optional[bool] = None, limit: int = 20, skip: int = 0):
    query = supabase.table("articles").select("*")
    if category:
        query = query.eq("category", category.lower())
    if featured is not None:
        query = query.eq("is_featured", featured)
    query = query.range(skip, skip + limit - 1).order("created_at", desc=True)
    res = query.execute()
    return [ArticleResponse(**item) for item in res.data]

@app.get("/api/articles/{article_id}", response_model=ArticleResponse)
async def get_article(article_id: str):
    res = supabase.table("articles").select("*").eq("id", article_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Article not found")
    return ArticleResponse(**res.data[0])

@app.get("/api/categories/stats", response_model=List[CategoryStats])
async def get_category_stats():
    all_articles = supabase.table("articles").select("*").execute().data
    stats = {}
    for article in all_articles:
        cat = article["category"]
        if cat not in stats:
            stats[cat] = {"count": 0, "latest": None}
        stats[cat]["count"] += 1
        if not stats[cat]["latest"] or article["created_at"] > stats[cat]["latest"]["created_at"]:
            stats[cat]["latest"] = article

    return [
        CategoryStats(
            category=cat,
            count=data["count"],
            latest_article={
                "id": data["latest"]["id"],
                "title": data["latest"]["title"],
                "excerpt": data["latest"]["excerpt"],
                "created_at": data["latest"]["created_at"]
            }
        )
        for cat, data in stats.items()
    ]

@app.get("/api/featured-content")
async def get_featured_content():
    hero = { "east": None, "west": None }
    recent = {}

    for cat in ["east", "west"]:
        hero_res = supabase.table("articles").select("*").eq("category", cat).eq("is_featured", True).limit(1).execute()
        hero[cat] = hero_res.data[0] if hero_res.data else None

        recent_res = supabase.table("articles").select("*").eq("category", cat).order("created_at", desc=True).limit(6).execute()
        recent[cat] = recent_res.data

    return {
        "hero": hero,
        "recent_content": recent
    }

@app.on_event("startup")
async def startup_event():
    sample_articles = [
        Article(
            title="A New Dawn in Anime",
            content="Long form content about the evolution of anime...",
            excerpt="Exploring the rise of sci-fi in anime.",
            category="east",
            tags=["anime", "scifi", "mecha"],
            featured_image=None,
            author="ANIMAC Team",
            is_featured=True
        ),
        Article(
            title="Hollywood's Animated Revolution",
            content="Insightful western cartoon trends...",
            excerpt="Western studios are catching up.",
            category="west",
            tags=["cartoons", "animation", "industry"],
            featured_image=None,
            author="ANIMAC Team",
            is_featured=True
        )
    ]

    for a in sample_articles:
      data = a.dict()
      data["body"] = data.pop("content")  # Map 'content' → 'body'
      data["created_at"] = a.created_at.isoformat()
      data["updated_at"] = a.updated_at.isoformat()


    try:
            # prevent duplication
            existing = supabase.table("articles").select("id").eq("title", a.title).execute()
            if not existing.data:
                supabase.table("articles").insert(data).execute()
    except Exception as e:
            print("Error inserting sample article:", e)

    print("✅ Sample articles loaded.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

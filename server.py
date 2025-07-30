from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import os
from dotenv import load_dotenv
import uuid

# ---------- Load Env ----------
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Missing Supabase credentials in .env file")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ---------- FastAPI App ----------
app = FastAPI(title="ANIMAC API")

# ---------- CORS ----------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://animac-metaverse.vercel.app",
        "http://localhost:3000"
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

class Article(ArticleBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    slug: str = Field(default_factory=str)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ArticleResponse(BaseModel):
    id: str
    title: str
    slug: str
    category: str
    content: Optional[str] = None
    excerpt: Optional[str] = None
    created_at: Optional[str] = None

class CategoryStats(BaseModel):
    category: str
    count: int
    latest_article: Optional[dict] = None

# ---------- Utils ----------
def slugify(text: str) -> str:
    return text.lower().replace(" ", "-").replace(".", "").replace(",", "")

# ---------- Routes ----------
@app.get("/")
async def root():
    return {"message": "Welcome to ANIMAC API"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "ANIMAC Backend"}

@app.post("/api/articles", response_model=ArticleResponse)
async def create_article(article: ArticleBase):
    article_model = Article(**article.dict())
    article_model.slug = slugify(article_model.title)
    article_model.category = article_model.category.lower() if article_model.category else None
    data = article_model.dict()
    data["created_at"] = article_model.created_at.isoformat()
    data["updated_at"] = article_model.updated_at.isoformat()

    res = supabase.table("articles").insert(data).execute()
    if res.data:
        return ArticleResponse(**res.data[0])
    raise HTTPException(status_code=400, detail="Failed to create article")

@app.get("/api/articles", response_model=List[ArticleResponse])
async def get_articles(category: Optional[str] = None, featured: Optional[bool] = None, is_published: Optional[bool] = True, limit: int = 20, skip: int = 0):
    try:
        query = supabase.table("articles").select("*")
        if is_published is not None:
            query = query.eq("is_published", is_published)
        if category:
            query = query.eq("category", category.lower())
        if featured is not None:
            query = query.eq("is_featured", featured)

        query = query.range(skip, skip + limit - 1).order("created_at", desc=True)
        res = query.execute()
        return [ArticleResponse(**item) for item in res.data]
    except Exception as e:
        print("❌ Error fetching articles:", e)
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.get("/api/articles/by-id/{article_id}", response_model=ArticleResponse)
async def get_article_by_id(article_id: str):
    res = supabase.table("articles").select("*").eq("id", article_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Article not found")
    return ArticleResponse(**res.data[0])

@app.get("/api/articles/{slug}", response_model=ArticleResponse)
async def get_article_by_slug(slug: str):
    res = supabase.table("articles").select("*").eq("slug", slug).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Article not found")
    return ArticleResponse(**res.data[0])

@app.put("/api/articles/{article_id}", response_model=ArticleResponse)
async def update_article_full(article_id: str, updated_data: ArticleBase):
    update_dict = updated_data.dict()
    update_dict["updated_at"] = datetime.utcnow().isoformat()

    if "title" in update_dict:
        update_dict["slug"] = slugify(update_dict["title"])
    if "category" in update_dict:
        update_dict["category"] = update_dict["category"].lower()

    res = supabase.table("articles").update(update_dict).eq("id", article_id).execute()
    if res.data:
        return ArticleResponse(**res.data[0])
    raise HTTPException(status_code=404, detail="Article not found")

@app.patch("/api/articles/{article_id}", response_model=ArticleResponse)
async def update_article_partial(article_id: str, updated_data: ArticleBase):
    partial = updated_data.dict(exclude_unset=True)
    partial["updated_at"] = datetime.utcnow().isoformat()

    if "title" in partial:
        partial["slug"] = slugify(partial["title"])
    if "category" in partial:
        partial["category"] = partial["category"].lower()

    res = supabase.table("articles").update(partial).eq("id", article_id).execute()
    if res.data:
        return ArticleResponse(**res.data[0])
    raise HTTPException(status_code=404, detail="Article not found")

@app.delete("/api/articles/{article_id}")
async def delete_article(article_id: str):
    res = supabase.table("articles").delete().eq("id", article_id).execute()
    if res.data:
        return {"message": "Article deleted"}
    raise HTTPException(status_code=404, detail="Article not found or delete failed")

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

# ---------- Run Locally ----------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

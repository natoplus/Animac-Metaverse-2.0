from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import os
from dotenv import load_dotenv
import uuid

# Load environment variables
load_dotenv()

app = FastAPI(title="ANIMAC API", description="API for ANIMAC streaming culture platform")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.environ.get("MONGO_URL", "mongodb+srv://natoplusco:XgZryCvOkiT9Rs7P@animacmongodb.oxhmvaw.mongodb.net/?retryWrites=true&w=majority&appName=animacmongodb")
client = AsyncIOMotorClient(MONGO_URL)
database = client["natoplusco"]
from pymongo import MongoClient

uri = "mongodb://natoplusco:XgZryCvOkiT9Rs7P@animacmongodb-shard-00-00.oxhmvaw.mongodb.net:27017,animacmongodb-shard-00-01.oxhmvaw.mongodb.net:27017,animacmongodb-shard-00-02.oxhmvaw.mongodb.net:27017/?ssl=true&replicaSet=atlas-oxhmvaw-shard-0&authSource=admin&retryWrites=true&w=majority"

client = MongoClient(uri)

# ✅ Replace this with your actual DB name (from MongoDB Atlas)
db = client["animac"]
articles_collection = database["articles"]

# Pydantic models
class ArticleBase(BaseModel):
    title: str
    content: str
    excerpt: str
    category: str  # 'east' or 'west'
    tags: List[str] = []
    featured_image: Optional[str] = None
    author: str = "ANIMAC Team"
    read_time: int = 5  # minutes
    is_featured: bool = False

class Article(ArticleBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class ArticleResponse(Article):
    pass

class CategoryStats(BaseModel):
    category: str
    count: int
    latest_article: Optional[dict] = None

# Database operations
async def get_articles_collection():
    return database.articles

# API endpoints
@app.get("/")
async def root():
    return {"message": "Welcome to ANIMAC API - Streaming Culture, Streaming Stories"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "ANIMAC Backend"}

@app.post("/api/articles", response_model=ArticleResponse)
async def create_article(article: ArticleBase):
    """Create a new article"""
    articles_collection = await get_articles_collection()
    
    article_dict = Article(**article.dict()).dict()
    
    result = await articles_collection.insert_one(article_dict)
    if result.inserted_id:
        created_article = await articles_collection.find_one({"id": article_dict["id"]})
        created_article.pop("_id", None)
        return ArticleResponse(**created_article)
    
    raise HTTPException(status_code=400, detail="Failed to create article")

@app.get("/api/articles", response_model=List[ArticleResponse])
async def get_articles(
    category: Optional[str] = None,
    featured: Optional[bool] = None,
    limit: int = 20,
    skip: int = 0
):
    """Get articles with optional filtering"""
    articles_collection = await get_articles_collection()
    
    query = {}
    if category:
        query["category"] = category.lower()
    if featured is not None:
        query["is_featured"] = featured
    
    cursor = articles_collection.find(query, {"_id": 0}).skip(skip).limit(limit).sort("created_at", -1)
    articles = await cursor.to_list(length=limit)
    
    return [ArticleResponse(**article) for article in articles]

@app.get("/api/articles/{article_id}", response_model=ArticleResponse)
async def get_article(article_id: str):
    """Get a specific article by ID"""
    articles_collection = await get_articles_collection()
    
    article = await articles_collection.find_one({"id": article_id}, {"_id": 0})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    return ArticleResponse(**article)

@app.get("/api/categories/stats", response_model=List[CategoryStats])
async def get_category_stats():
    """Get statistics for each category"""
    articles_collection = await get_articles_collection()
    
    # Aggregate statistics
    pipeline = [
        {"$group": {
            "_id": "$category",
            "count": {"$sum": 1},
            "latest_article": {"$first": "$$ROOT"}
        }},
        {"$project": {
            "_id": 0,
            "category": "$_id",
            "count": 1,
            "latest_article": {
                "id": "$latest_article.id",
                "title": "$latest_article.title",
                "excerpt": "$latest_article.excerpt",
                "created_at": "$latest_article.created_at"
            }
        }}
    ]
    
    results = await articles_collection.aggregate(pipeline).to_list(length=None)
    return [CategoryStats(**result) for result in results]

@app.get("/api/featured-content")
async def get_featured_content():
    """Get featured content for homepage hero sections"""
    articles_collection = await get_articles_collection()
    
    # Get featured articles from both categories
    east_featured = await articles_collection.find_one(
        {"category": "east", "is_featured": True}, {"_id": 0}
    )
    west_featured = await articles_collection.find_one(
        {"category": "west", "is_featured": True}, {"_id": 0}
    )
    
    # Get recent articles for content rows
    recent_east = await articles_collection.find(
        {"category": "east"}, {"_id": 0}
    ).sort("created_at", -1).limit(6).to_list(length=6)
    
    recent_west = await articles_collection.find(
        {"category": "west"}, {"_id": 0}
    ).sort("created_at", -1).limit(6).to_list(length=6)
    
    return {
        "hero": {
            "east": east_featured,
            "west": west_featured
        },
        "recent_content": {
            "east": recent_east,
            "west": recent_west
        }
    }

# Initialize with sample data
@app.on_event("startup")
async def startup_event():
    """Initialize database with sample articles"""
    articles_collection = await get_articles_collection()
    
    # Check if we already have articles
    count = await articles_collection.count_documents({})
    if count > 0:
        return
    
    # Sample articles for EAST (Anime)
    east_articles = [
        {
            "title": "Attack on Titan Final Season: The Ultimate Battle Begins",
            "content": "The long-awaited conclusion to Hajime Isayama's masterpiece has arrived...",
            "excerpt": "Eren Yeager's journey reaches its climactic end as humanity faces its greatest threat yet.",
            "category": "east",
            "tags": ["attack-on-titan", "anime", "final-season", "shounen"],
            "author": "ANIMAC East Team",
            "read_time": 8,
            "is_featured": True
        },
        {
            "title": "Studio MAPPA's Animation Revolution",
            "content": "How MAPPA has become the powerhouse of modern anime production...",
            "excerpt": "From Jujutsu Kaisen to Chainsaw Man, MAPPA continues to push animation boundaries.",
            "category": "east",
            "tags": ["mappa", "studio", "animation", "jujutsu-kaisen"],
            "read_time": 6
        },
        {
            "title": "Demon Slayer: The Cultural Phenomenon",
            "content": "Exploring how Demon Slayer broke records and hearts worldwide...",
            "excerpt": "Tanjiro's journey has captivated millions, but what makes it so special?",
            "category": "east",
            "tags": ["demon-slayer", "kimetsu", "shounen", "culture"],
            "read_time": 5
        }
    ]
    
    # Sample articles for WEST (Movies/Cartoons)
    west_articles = [
        {
            "title": "Spider-Verse Animation: Redefining Superhero Movies",
            "content": "How Into the Spider-Verse changed animation forever...",
            "excerpt": "The groundbreaking animation style that influenced a generation of filmmakers.",
            "category": "west",
            "tags": ["spider-verse", "animation", "marvel", "superhero"],
            "author": "ANIMAC West Team",
            "read_time": 7,
            "is_featured": True
        },
        {
            "title": "Avatar: The Last Airbender's Lasting Legacy",
            "content": "Why Avatar remains the gold standard for western animation...",
            "excerpt": "15 years later, Aang's journey continues to inspire new generations.",
            "category": "west",
            "tags": ["avatar", "nickelodeon", "western-animation", "legacy"],
            "read_time": 9
        },
        {
            "title": "The Pixar Formula: Emotion Meets Innovation",
            "content": "Deconstructing what makes Pixar movies so emotionally powerful...",
            "excerpt": "From Toy Story to Soul, Pixar has mastered the art of storytelling.",
            "category": "west",
            "tags": ["pixar", "animation", "disney", "storytelling"],
            "read_time": 6
        }
    ]
    
    # Insert sample articles
    for article_data in east_articles + west_articles:
        article = Article(**article_data)
        await articles_collection.insert_one(article.dict())
    
    print("Sample articles initialized!")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
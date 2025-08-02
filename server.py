# /main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from routes import admin, articles, comments, interactions

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(title="ANIMAC API")

# CORS Middleware
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

# Basic routes
@app.get("/")
async def root():
    return {"message": "Welcome to ANIMAC API"}

@app.get("/api/health")
async def health():
    return {"status": "healthy"}

# Include routers
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(articles.router, prefix="/api", tags=["Articles"])
app.include_router(comments.router, prefix="/api", tags=["Comments"])
app.include_router(interactions.router, prefix="/api", tags=["Interactions"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)

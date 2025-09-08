from fastapi import FastAPI, HTTPException
from fastapi import Request
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime
import os
from dotenv import load_dotenv
import uuid
import logging
import smtplib
from email.message import EmailMessage

# ---------- Load Env ----------
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
# Prefer service role key for server-side operations (bypasses RLS)
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Missing Supabase credentials in .env file")

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
# Newsletter models
class NewsletterSubscribeRequest(BaseModel):
    email: EmailStr
    source: Optional[str] = "footer"

class NewsletterSubscribeResponse(BaseModel):
    status: str
    message: str


class CommentBase(BaseModel):
    article_id: str
    content: str
    author: Optional[str] = "Anonymous"
    parent_id: Optional[str] = None

class Comment(CommentBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    likes: int = 0; dislikes: int = 0

class CommentResponse(BaseModel):
    id: str
    article_id: str
    content: str
    author: Optional[str] = "Anonymous"  # ✅ Add this line
    created_at: datetime
    parent_id: Optional[str] = None
    likes: int = 0
    dislikes: int = 0
    replies: List["CommentResponse"] = []
    liked_by_user: bool = False
    is_liked_by_session: Optional[bool] = False
    is_disliked_by_session: Optional[bool] = False




CommentResponse.update_forward_refs()

# ---------- Utils ----------
def slugify(text: str) -> str:
    return text.lower().replace(" ", "-").replace(".", "").replace(",", "")

def build_comment_tree(comments):
    """Builds a threaded comment tree from a flat list."""
    comment_map = {c["id"]: {**c, "replies": []} for c in comments}
    root_comments = []

    for c in comment_map.values():
        parent_id = c.get("parent_id")
        if parent_id and parent_id in comment_map:
            comment_map[parent_id]["replies"].append(c)
        else:
            root_comments.append(c)

    return root_comments

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
    if article_model.category:
        article_model.category = article_model.category.lower()

    data = article_model.dict()
    data["created_at"] = article_model.created_at.isoformat()
    data["updated_at"] = article_model.updated_at.isoformat()

    try:
        res = supabase.table("articles").insert(data).execute()
        return ArticleResponse(**res.data[0])
    except Exception as e:
        logging.error("❌ Error creating article:", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to create article")

@app.get("/api/articles", response_model=List[ArticleResponse])
async def get_articles(
    category: Optional[str] = None,
    featured: Optional[bool] = None,
    is_published: Optional[bool] = None,  # changed default to None
    limit: int = 20,
    skip: int = 0
):
    try:
        query = supabase.table("articles").select("*")
        
        # Apply filters only if not None
        if is_published is not None:
            query = query.eq("is_published", is_published)
        if category:
            query = query.eq("category", category.lower())
        if featured is not None:
            query = query.eq("is_featured", featured)

        res = query.range(skip, skip + limit - 1).order("created_at", desc=True).execute()
        return [ArticleResponse(**item) for item in res.data]
    except Exception as e:
        logging.error("❌ Error fetching articles:", exc_info=True)
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
    try:
        res = supabase.table("articles").delete().eq("id", article_id).execute()
        if res.data:
            return {"message": "Article deleted successfully"}
        raise HTTPException(status_code=404, detail="Article not found or delete failed")
    except Exception as e:
        logging.error("❌ Error deleting article:", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")

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

@app.post("/api/comments", response_model=CommentResponse)
async def create_comment(comment: CommentBase):
    comment_model = Comment(**comment.dict())
    data = comment_model.dict()
    data["created_at"] = comment_model.created_at.isoformat()
    try:
        res = supabase.table("comments").insert(data).execute()
        return CommentResponse(**res.data[0], replies=[])
    except Exception as e:
        logging.error("❌ Error creating comment", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to create comment: {str(e)}")


# Helper to nest comments
def build_comment_tree(comments, liked_ids, disliked_ids):
    comment_map = {}
    for c in comments:
        comment_map[c["id"]] = {
            "id": c["id"],
            "article_id": c["article_id"],
            "content": c["content"],
            "author": c.get("author", "Anonymous"),
            "created_at": c["created_at"],
            "parent_id": c.get("parent_id"),
            "likes": c.get("likes", 0),
            "dislikes": c.get("dislikes", 0),
            "replies": [],
            "liked_by_user": c["id"] in liked_ids,
            "is_liked_by_session": c["id"] in liked_ids,
            "is_disliked_by_session": c["id"] in disliked_ids
        }

    roots = []
    for cid, obj in comment_map.items():
        parent_id = obj["parent_id"]
        if parent_id and parent_id in comment_map:
            comment_map[parent_id]["replies"].append(obj)
        else:
            roots.append(obj)

    return roots


@app.get("/api/comments/{article_id}", response_model=List[CommentResponse])
async def get_comments_for_article(article_id: str, request: Request):
    session_id = request.headers.get("session-id")
    if not session_id:
        raise HTTPException(status_code=400, detail="Session ID required")

    # 1. Fetch all comments for this article
    res = supabase.table("comments") \
        .select("*") \
        .eq("article_id", article_id) \
        .order("created_at", desc=False) \
        .execute()
    flat_comments = res.data or []

    if not flat_comments:
        return []

    # 2. Fetch likes/dislikes for this session
    liked_res = supabase.table("comment_likes") \
        .select("comment_id") \
        .eq("session_id", session_id) \
        .execute()
    liked_ids = {item["comment_id"] for item in liked_res.data or []}

    disliked_res = supabase.table("comment_dislikes") \
        .select("comment_id") \
        .eq("session_id", session_id) \
        .execute()
    disliked_ids = {item["comment_id"] for item in disliked_res.data or []}

    # 3. Build reply count mapping
    reply_count_map = {}
    for c in flat_comments:
        parent_id = c.get("parent_id")
        if parent_id:
            reply_count_map[parent_id] = reply_count_map.get(parent_id, 0) + 1

    # 4. Attach flags and counts
    for comment in flat_comments:
        comment["liked_by_user"] = comment["id"] in liked_ids
        comment["disliked_by_user"] = comment["id"] in disliked_ids
        comment["reply_count"] = reply_count_map.get(comment["id"], 0)

    # 5. Return nested tree
    return build_comment_tree(flat_comments, liked_ids, disliked_ids)


def build_comment_tree(comments, liked_ids=None, disliked_ids=None):
    """Builds a nested comment tree from a flat list."""
    comment_map = {c["id"]: {**c, "replies": []} for c in comments}

    root_comments = []
    for comment in comments:
        parent_id = comment.get("parent_id")
        if parent_id and parent_id in comment_map:
            comment_map[parent_id]["replies"].append(comment_map[comment["id"]])
        else:
            root_comments.append(comment_map[comment["id"]])

    return root_comments




@app.get("/api/comments", response_model=List[CommentResponse])
async def get_comments_by_query(article_id: str, request: Request):
    return await get_comments_for_article(article_id, request)


@app.post("/api/comments/{comment_id}/like")
async def like_comment(comment_id: str, request: Request):
    try:
        session_id = request.headers.get("session-id")
        if not session_id:
            raise HTTPException(status_code=400, detail="Session ID required")

        liked_res = supabase.table("comment_likes") \
            .select("id") \
            .eq("comment_id", comment_id) \
            .eq("session_id", session_id) \
            .execute()

        comment = supabase.table("comments") \
            .select("likes", "dislikes") \
            .eq("id", comment_id) \
            .single() \
            .execute()

        current_likes = comment.data.get("likes", 0)
        current_dislikes = comment.data.get("dislikes", 0)

        if liked_res.data:
            supabase.table("comment_likes") \
                .delete() \
                .eq("comment_id", comment_id) \
                .eq("session_id", session_id) \
                .execute()
            supabase.table("comments") \
                .update({"likes": max(0, current_likes - 1)}) \
                .eq("id", comment_id) \
                .execute()
            return {"message": "Like removed"}

        supabase.table("comment_likes").insert({
            "comment_id": comment_id,
            "session_id": session_id
        }).execute()
        supabase.table("comments") \
            .update({"likes": current_likes + 1}) \
            .eq("id", comment_id) \
            .execute()

        dislike_res = supabase.table("comment_dislikes") \
            .select("id") \
            .eq("comment_id", comment_id) \
            .eq("session_id", session_id) \
            .execute()
        if dislike_res.data:
            supabase.table("comment_dislikes") \
                .delete() \
                .eq("comment_id", comment_id) \
                .eq("session_id", session_id) \
                .execute()
            supabase.table("comments") \
                .update({"dislikes": max(0, current_dislikes - 1)}) \
                .eq("id", comment_id) \
                .execute()

        return {"message": "Comment liked"}

    except Exception as e:
        logging.error("❌ Error liking/unliking comment", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to like/unlike comment")


@app.post("/api/comments/{comment_id}/dislike")
async def dislike_comment(comment_id: str, request: Request):
    try:
        session_id = request.headers.get("session-id")
        if not session_id:
            raise HTTPException(status_code=400, detail="Session ID required")

        res = supabase.table("comment_dislikes") \
            .select("id") \
            .eq("comment_id", comment_id) \
            .eq("session_id", session_id) \
            .execute()
        already_disliked = bool(res.data)

        comment = supabase.table("comments") \
            .select("likes", "dislikes") \
            .eq("id", comment_id) \
            .single() \
            .execute()
        current_likes = comment.data.get("likes", 0)
        current_dislikes = comment.data.get("dislikes", 0)

        if already_disliked:
            supabase.table("comment_dislikes") \
                .delete() \
                .eq("comment_id", comment_id) \
                .eq("session_id", session_id) \
                .execute()
            supabase.table("comments") \
                .update({"dislikes": max(0, current_dislikes - 1)}) \
                .eq("id", comment_id) \
                .execute()
            return {"message": "Dislike removed"}

        supabase.table("comment_dislikes").insert({
            "comment_id": comment_id,
            "session_id": session_id
        }).execute()
        supabase.table("comments") \
            .update({"dislikes": current_dislikes + 1}) \
            .eq("id", comment_id) \
            .execute()

        like_res = supabase.table("comment_likes") \
            .select("id") \
            .eq("comment_id", comment_id) \
            .eq("session_id", session_id) \
            .execute()
        if like_res.data:
            supabase.table("comment_likes") \
                .delete() \
                .eq("comment_id", comment_id) \
                .eq("session_id", session_id) \
                .execute()
            supabase.table("comments") \
                .update({"likes": max(0, current_likes - 1)}) \
                .eq("id", comment_id) \
                .execute()

        return {"message": "Comment disliked"}

    except Exception as e:
        logging.error(f"❌ Error disliking comment {comment_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to toggle dislike")


@app.post("/api/comments/{comment_id}/undislike")
async def undislike_comment(comment_id: str, request: Request):
    session_id = request.headers.get("session-id")
    if not session_id:
        raise HTTPException(status_code=400, detail="Session ID required")

    supabase.table("comment_dislikes") \
        .delete() \
        .eq("comment_id", comment_id) \
        .eq("session_id", session_id) \
        .execute()

    comment = supabase.table("comments") \
        .select("dislikes") \
        .eq("id", comment_id) \
        .single() \
        .execute()
    if comment and comment.data:
        current = comment.data.get("dislikes", 0)
        supabase.table("comments") \
            .update({"dislikes": max(0, current - 1)}) \
            .eq("id", comment_id) \
            .execute()

    return {"message": "Undisliked successfully"}



# ---------- Run ----------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

# ---------- Newsletter Subscription ----------
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")  # e.g., your Gmail address
SMTP_PASS = os.getenv("SMTP_PASS")  # e.g., App Password
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "iconanimac@gmail.com")
SITE_ORIGIN = os.getenv("SITE_ORIGIN", "https://animac-metaverse.vercel.app")

def send_email(subject: str, to_email: str, html_content: str, text_content: Optional[str] = None, from_email: Optional[str] = None):
    if not (SMTP_USER and SMTP_PASS):
        logging.warning("SMTP credentials not configured; skipping email send")
        return
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = from_email or SMTP_USER
    msg["To"] = to_email
    msg.set_content(text_content or "")
    msg.add_alternative(html_content, subtype="html")
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.send_message(msg)

def build_user_welcome_email(subscriber_email: str) -> str:
    hero_image = f"{SITE_ORIGIN}/assets/animac-preview-logo.svg"
    return f"""
    <div style='background:#0b0b0b;color:#e5e7eb;font-family:Inter,Arial,sans-serif;padding:24px;'>
      <table role='presentation' width='100%' cellpadding='0' cellspacing='0' style='max-width:640px;margin:0 auto;background:#111827;border:1px solid #1f2937;border-radius:16px;overflow:hidden;'>
        <tr>
          <td style='text-align:center;padding:28px 24px 12px;'>
            <img src='{hero_image}' alt='ANIMAC' width='72' height='72' style='display:inline-block;border-radius:12px;border:1px solid #374151' />
            <h1 style='margin:16px 0 0;font-size:24px;letter-spacing:1px;color:#fff;'>Welcome to ANIMAC</h1>
            <p style='margin:8px 0 0;color:#9ca3af;'>You’re officially on the list.</p>
          </td>
        </tr>
        <tr>
          <td style='padding:0 24px 24px;'>
            <div style='background:linear-gradient(135deg,#7c3aed33,#2563eb33);border:1px solid #374151;border-radius:12px;padding:16px;'>
              <p style='margin:0 0 12px;color:#d1d5db;line-height:1.6;'>Thanks for subscribing, <strong>{subscriber_email}</strong>. Expect curated anime drops, west-side features, and culture deep-dives—right in your inbox.</p>
              <p style='margin:0;color:#9ca3af;'>First edition lands soon. Meanwhile, explore the latest on our hub.</p>
            </div>
            <div style='text-align:center;margin-top:24px;'>
              <a href='{SITE_ORIGIN}/buzzfeed' style='display:inline-block;background:linear-gradient(90deg,#ec4899,#6366f1);padding:12px 20px;border-radius:999px;color:white;text-decoration:none;font-weight:600;'>Explore Buzzfeed Hub</a>
            </div>
          </td>
        </tr>
        <tr>
          <td style='text-align:center;padding:16px;color:#6b7280;font-size:12px;border-top:1px solid #1f2937;'>
            You’re receiving this because you subscribed on ANIMAC. <a href='{SITE_ORIGIN}' style='color:#93c5fd;text-decoration:none;'>animac-metaverse</a>
          </td>
        </tr>
      </table>
    </div>
    """

def build_admin_notification_email(subscriber_email: str, source: str) -> str:
    return f"""
    <div style='font-family:Inter,Arial,sans-serif;color:#111'>
      <h2 style='margin:0 0 8px;'>New Newsletter Subscriber</h2>
      <p style='margin:0 0 4px;'>Email: <strong>{subscriber_email}</strong></p>
      <p style='margin:0 0 4px;'>Source: {source}</p>
      <p style='margin:0;'>Timestamp: {datetime.utcnow().isoformat()}Z</p>
    </div>
    """

@app.post("/api/newsletter/subscribe", response_model=NewsletterSubscribeResponse)
async def subscribe_newsletter(payload: NewsletterSubscribeRequest):
    email = payload.email.strip().lower()
    source = (payload.source or "footer").strip().lower()
    try:
        # Upsert into Supabase table 'newsletter_subscribers'
        data = {
            "email": email,
            "source": source,
            "created_at": datetime.utcnow().isoformat(),
        }
        # Ensure table exists in Supabase with a unique constraint on email
        supabase.table("newsletter_subscribers").upsert(data, on_conflict="email").execute()

        # Send admin notification
        send_email(
            subject="ANIMAC: New newsletter subscriber",
            to_email=ADMIN_EMAIL,
            html_content=build_admin_notification_email(email, source),
            text_content=f"New subscriber: {email} (source: {source})",
        )

        # Send user welcome email
        send_email(
            subject="Welcome to ANIMAC • You’re in!",
            to_email=email,
            html_content=build_user_welcome_email(email),
            text_content="Welcome to ANIMAC! You're officially subscribed.",
        )

        return NewsletterSubscribeResponse(status="ok", message="Subscribed successfully")
    except Exception as e:
        logging.error("❌ Newsletter subscribe failed", exc_info=True)
        raise HTTPException(status_code=500, detail="Subscription failed")

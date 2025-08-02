from pydantic import BaseModel, Field
from typing import Optional, List, ForwardRef
from datetime import datetime
from .base import uuid_str, current_time

class CommentBase(BaseModel):
    article_id: str
    content: str
    author: Optional[str] = "Anonymous"
    parent_id: Optional[str] = None

class Comment(CommentBase):
    id: str = Field(default_factory=uuid_str)
    created_at: datetime = Field(default_factory=current_time)
    likes: int = 0

CommentResponse = ForwardRef('CommentResponse')

class CommentResponse(CommentBase):
    id: str
    created_at: str
    likes: int
    replies: Optional[List['CommentResponse']] = []

CommentResponse.update_forward_refs()

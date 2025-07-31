import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const API_BASE = "https://your-api-url.com/api"; // update this

const CommentSection = ({ articleId }) => {
  const [comments, setComments] = useState([]);
  const [replyVisibility, setReplyVisibility] = useState({});
  const [newComment, setNewComment] = useState("");
  const [guestName, setGuestName] = useState("");

  useEffect(() => {
    fetchComments();
  }, [articleId]);

  const fetchComments = async () => {
    try {
      const res = await axios.get(`${API_BASE}/articles/${articleId}/comments`);
      setComments(res.data);
    } catch (err) {
      console.error("Error loading comments", err);
    }
  };

  const handlePostComment = async () => {
    try {
      await axios.post(`${API_BASE}/comments`, {
        article_id: articleId,
        content: newComment,
        guest_name: guestName,
      });
      setNewComment("");
      setGuestName("");
      fetchComments();
    } catch (err) {
      console.error("Error posting comment", err);
    }
  };

  const toggleReplies = (commentId) => {
    setReplyVisibility((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const renderReplies = (parentId) => {
    return comments
      .filter((c) => c.parent_id === parentId)
      .map((reply) => (
        <div key={reply.id} className="ml-6 mt-2 border-l border-gray-600 pl-4">
          <p className="text-sm font-semibold">{reply.guest_name || "Guest"}</p>
          <p className="text-sm">{reply.content}</p>
        </div>
      ));
  };

  const renderComments = () => {
    return comments
      .filter((c) => c.parent_id === null)
      .map((comment) => (
        <div key={comment.id} className="mb-4 border-b border-gray-700 pb-2">
          <p className="font-bold">{comment.guest_name || "Guest"}</p>
          <p>{comment.content}</p>
          <div className="mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleReplies(comment.id)}
            >
              {replyVisibility[comment.id] ? "Hide Replies" : "View Replies"}
            </Button>
          </div>
          {replyVisibility[comment.id] && renderReplies(comment.id)}
        </div>
      ));
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-6">
      <h2 className="text-lg font-bold mb-4">Comments</h2>
      {renderComments()}
      <div className="mt-6 space-y-2">
        <Input
          placeholder="Your name (optional)"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
        />
        <Textarea
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <Button onClick={handlePostComment}>Post Comment</Button>
      </div>
    </div>
  );
};

export default CommentSection;

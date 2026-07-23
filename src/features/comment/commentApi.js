// Mirrors com.streaming.live.comment.CommentController
import request from "../../shared/apiClient";

// GET /api/comments/{videoId} — public
export function getComments(videoId) {
  return request(`/api/comments/${videoId}`, { method: "GET" });
}

// POST /api/comments — auth required, top-level comment
export function postComment(videoId, comment) {
  return request("/api/comments", {
    method: "POST",
    body: JSON.stringify({ videoId, comment }),
  });
}

// POST /api/comments — auth required, reply (same endpoint, parentCommentId set)
export function postReply(videoId, comment, parentCommentId) {
  return request("/api/comments", {
    method: "POST",
    body: JSON.stringify({ videoId, comment, parentCommentId }),
  });
}

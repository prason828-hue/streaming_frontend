// Mirrors com.streaming.live.like.LikeController
import request from "../../shared/apiClient";

// GET /api/videos/{id}/likes — public
export function getLikeStatus(videoId) {
  return request(`/api/videos/${videoId}/likes`, { method: "GET" });
}

// POST /api/videos/{id}/like — auth required, toggles
export function likeVideo(videoId) {
  return request(`/api/videos/${videoId}/like`, { method: "POST" });
}

// POST /api/videos/{id}/dislike — auth required, toggles
export function dislikeVideo(videoId) {
  return request(`/api/videos/${videoId}/dislike`, { method: "POST" });
}

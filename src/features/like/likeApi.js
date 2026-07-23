import request from "../../shared/apiClient";

export function getLikeStatus(videoId) {
  return request(`/api/videos/${videoId}/likes`, { method: "GET" });
}

export function likeVideo(videoId) {
  return request(`/api/videos/${videoId}/like`, { method: "POST" });
}

export function dislikeVideo(videoId) {
  return request(`/api/videos/${videoId}/dislike`, { method: "POST" });
}

import request from "../../shared/apiClient";
import { API_BASE } from "../../shared/config";

export function uploadVideo({
  videoFile,
  thumbnail,
  title,
  description,
  category,
  tags,
}) {
  const formData = new FormData();
  formData.append("video", videoFile);
  if (thumbnail) formData.append("thumbnail", thumbnail);
  formData.append("title", title);
  if (description) formData.append("description", description);
  if (category) formData.append("category", category);
  if (tags) formData.append("tags", tags);
  return request("/api/videos/upload", { method: "POST", body: formData });
}

export function getAllVideos() {
  return request("/api/videos", { method: "GET" });
}

export function getVideo(videoId) {
  return request(`/api/videos/${videoId}`, { method: "GET" });
}

export function getVideosByUser(userId) {
  return request(`/api/videos/user/${userId}`, { method: "GET" });
}

export function deleteVideo(videoId) {
  return request(`/api/videos/${videoId}`, { method: "DELETE" });
}

export function getStreamUrl(videoId) {
  return `${API_BASE}/api/videos/watch/${videoId}`;
}

export async function loadThumbnailBlobUrl(thumbnailUrl) {
  if (!thumbnailUrl) return null;
  const url = thumbnailUrl.startsWith("http")
    ? thumbnailUrl
    : `${API_BASE}${thumbnailUrl}`;
  const res = await fetch(url, {
    headers: { "ngrok-skip-browser-warning": "true" },
  });
  if (!res.ok) throw new Error("Thumbnail not found");
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

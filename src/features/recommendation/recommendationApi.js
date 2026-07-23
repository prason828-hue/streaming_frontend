import request from "../../shared/apiClient";

export function getTrendingVideos(limit = 10) {
  return request(`/api/recommendations/trending?limit=${limit}`, { method: "GET" });
}

export function getSuggestedCreators(limit = 8) {
  return request(`/api/recommendations/creators?limit=${limit}`, { method: "GET" });
}

export function getSuggestedVideos(category, excludeId, limit = 6) {
  const params = new URLSearchParams({ limit });
  if (category) params.set("category", category);
  if (excludeId) params.set("exclude", excludeId);
  return request(`/api/recommendations/videos?${params}`, { method: "GET" });
}

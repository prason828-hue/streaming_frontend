import request from "../../shared/apiClient";
export function searchAll(q) {
  return request(`/api/search?q=${encodeURIComponent(q)}`, { method: "GET" });
}

export function searchVideos(q) {
  return request(`/api/search/videos?q=${encodeURIComponent(q)}`, { method: "GET" });
}

export function searchCreators(q) {
  return request(`/api/search/creators?q=${encodeURIComponent(q)}`, { method: "GET" });
}

export function searchCategories(q) {
  return request(`/api/search/categories?q=${encodeURIComponent(q)}`, { method: "GET" });
}

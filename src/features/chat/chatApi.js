import request from "../../shared/apiClient";

export function getConversations() {
  return request("/api/chat/conversations", { method: "GET" });
}

export function getChatHistory(otherUsername) {
  return request(`/api/chat/history/${otherUsername}`, { method: "GET" });
}

export function markSeen(otherUsername) {
  return request(`/api/chat/seen/${otherUsername}`, { method: "POST" });
}

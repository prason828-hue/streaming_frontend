import request from "../../shared/apiClient";

// GET /api/chat/conversations — list of contacts + last message
export function getConversations() {
  return request("/api/chat/conversations", { method: "GET" });
}

// GET /api/chat/history/{otherUsername}
export function getChatHistory(otherUsername) {
  return request(`/api/chat/history/${otherUsername}`, { method: "GET" });
}

// POST /api/chat/seen/{otherUsername} — mark messages as SEEN
export function markSeen(otherUsername) {
  return request(`/api/chat/seen/${otherUsername}`, { method: "POST" });
}

import request from "../../shared/apiClient";

// GET /api/notifications
export function getNotifications() {
  return request("/api/notifications", { method: "GET" });
}

// GET /api/notifications/unread-count
export function getUnreadCount() {
  return request("/api/notifications/unread-count", { method: "GET" });
}

// POST /api/notifications/{id}/read
export function markRead(id) {
  return request(`/api/notifications/${id}/read`, { method: "POST" });
}

// POST /api/notifications/read-all
export function markAllRead() {
  return request("/api/notifications/read-all", { method: "POST" });
}

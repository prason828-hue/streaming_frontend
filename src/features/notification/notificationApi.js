import request from "../../shared/apiClient";

export function getNotifications() {
  return request("/api/notifications", { method: "GET" });
}

export function getUnreadCount() {
  return request("/api/notifications/unread-count", { method: "GET" });
}

export function markRead(id) {
  return request(`/api/notifications/${id}/read`, { method: "POST" });
}

export function markAllRead() {
  return request("/api/notifications/read-all", { method: "POST" });
}

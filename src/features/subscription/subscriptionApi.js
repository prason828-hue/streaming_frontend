// Mirrors com.streaming.live.subscription.SubscriptionController
import request from "../../shared/apiClient";

// GET /api/subscriptions/{channelId}/status — public
export function getSubscriptionStatus(channelId) {
  return request(`/api/subscriptions/${channelId}/status`, { method: "GET" });
}

// POST /api/subscriptions/{channelId} — auth required
export function subscribe(channelId) {
  return request(`/api/subscriptions/${channelId}`, { method: "POST" });
}

// DELETE /api/subscriptions/{channelId} — auth required
export function unsubscribe(channelId) {
  return request(`/api/subscriptions/${channelId}`, { method: "DELETE" });
}

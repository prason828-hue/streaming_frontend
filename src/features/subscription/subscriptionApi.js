import request from "../../shared/apiClient";
export function getSubscriptionStatus(channelId) {
  return request(`/api/subscriptions/${channelId}/status`, { method: "GET" });
}

export function subscribe(channelId) {
  return request(`/api/subscriptions/${channelId}`, { method: "POST" });
}

export function unsubscribe(channelId) {
  return request(`/api/subscriptions/${channelId}`, { method: "DELETE" });
}

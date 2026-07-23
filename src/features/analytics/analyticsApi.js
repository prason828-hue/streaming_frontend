import request from "../../shared/apiClient";
import { API_BASE } from "../../shared/config";

export function getAnalyticsOverview() {
  return request("/api/analytics/overview", { method: "GET" });
}

export function recordWatchTime(videoId, seconds) {
  return request(`/api/analytics/watch-time/${videoId}`, {
    method: "POST",
    body: JSON.stringify({ seconds }),
  });
}

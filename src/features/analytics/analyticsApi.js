import request from "../../shared/apiClient";
import { API_BASE } from "../../shared/config";

// GET /api/analytics/overview — auth required
export function getAnalyticsOverview() {
  return request("/api/analytics/overview", { method: "GET" });
}

// POST /api/analytics/watch-time/{videoId} — public
// Called periodically as the user watches (every 30 s)
export function recordWatchTime(videoId, seconds) {
  return request(`/api/analytics/watch-time/${videoId}`, {
    method: "POST",
    body: JSON.stringify({ seconds }),
  });
}

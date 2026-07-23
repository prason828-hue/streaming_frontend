// Mirrors com.streaming.live.auth.AuthController
import request from "../../shared/apiClient";

export function registerUser({ username, email, password }) {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });
}

export function loginUser({ username, password }) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

// Send the refresh token in the body so the backend can revoke it.
// The backend also accepts deletion by principal (access token) as a fallback.
export function logoutUser(refreshToken) {
  return request("/api/auth/logout", {
    method: "POST",
    body: JSON.stringify({ refreshToken: refreshToken || null }),
  });
}

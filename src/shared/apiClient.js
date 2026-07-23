import { API_BASE, REFRESH_TOKEN_PATH } from "./config";

// ─── In-memory access token ───────────────────────────────────────────────────
// Lives only for the page lifetime. Lost on refresh — restored via the
// refresh token flow below. Never touches localStorage.
let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function clearAccessToken() {
  accessToken = null;
}

export function getAccessToken() {
  return accessToken;
}

// ─── Persisted refresh token ──────────────────────────────────────────────────
// Stored in localStorage so it survives page refresh AND works in Chrome
// Incognito (where cross-site SameSite=None cookies are blocked entirely).
// Trade-off: localStorage is readable by JS, so it's vulnerable to XSS —
// acceptable here because we're in active development. In production you'd
// want a same-domain backend or a service worker that intercepts the token.
const REFRESH_TOKEN_KEY = "rt";

export function setRefreshToken(token) {
  if (token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function clearRefreshToken() {
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// ─── Core request wrapper ─────────────────────────────────────────────────────

/**
 * Wraps fetch with:
 * - Authorization: Bearer <accessToken> header (in-memory)
 * - JSON / FormData content-type handling
 * - ngrok interstitial bypass header
 * - Silent 401 recovery: sends the stored refresh token in the request body
 *   to /api/auth/refresh-token, then retries the original request once
 */
async function request(path, options = {}, isRetry = false) {
  const isFormData = options.body instanceof FormData;
  const isAuthEndpoint =
    path === REFRESH_TOKEN_PATH || path === "/api/auth/login";

  const headers = {
    "ngrok-skip-browser-warning": "true",
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers,
  });

  if (res.status === 401 && !isRetry && !isAuthEndpoint) {
    const storedRefreshToken = getRefreshToken();
    if (!storedRefreshToken) {
      // Nothing to refresh with — clear state and surface the 401
      clearAccessToken();
      clearRefreshToken();
    } else {
      const refreshRes = await fetch(`${API_BASE}${REFRESH_TOKEN_PATH}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({ refreshToken: storedRefreshToken }),
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json().catch(() => null);
        if (refreshData?.accessToken) setAccessToken(refreshData.accessToken);
        if (refreshData?.refreshToken)
          setRefreshToken(refreshData.refreshToken);
        return request(path, options, true);
      }

      // Refresh failed (expired / revoked) — fully clear session
      clearAccessToken();
      clearRefreshToken();
    }
  }

  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const message =
      (data && data.message) ||
      (typeof data === "string" && data) ||
      `Request failed (${res.status})`;
    const error = new Error(message);
    error.status = res.status;
    error.error = data?.error; // chack the error
    error.data = data;
    throw error;
  }

  return data;
}

export default request;

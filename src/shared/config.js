// Single source of truth for backend wiring.
// Update these as soon as paths are confirmed — everything else in the app
// reads from here, so it's a one-line change.

export const API_BASE = process.env.REACT_APP_API_BASE;

// Phase 1 (auth/RefreshTokenService) — confirm exact path with backend.
export const REFRESH_TOKEN_PATH = "/api/auth/refresh-token";

// Phase 1/2 GAP: there is currently no "who am I" endpoint.
// GET /api/users/{username} is PUBLIC and needs a username, which we don't
// have on a fresh page load (cookies are HttpOnly, so JS can't read them).
// Until auth/ adds something like GET /api/auth/me, session state only
// lives in memory for the lifetime of the tab — refreshing the page logs
// the UI out even though the cookies are still valid. See AuthContext.js.
export const CURRENT_USER_PATH = null;

// user/User.contentType — keep this list in sync with the backend enum.
export const CONTENT_TYPES = [
  "GAMING",
  "EDUCATION",
  "TECHNOLOGY",
  "TRAVEL",
  "MUSIC",
  "COMEDY",
  "FITNESS",
  "OTHER",
];

// Uploaded files (e.g. profile pictures) are served from API_BASE per
// WebConfig's static mapping — build a full <img src> from a stored path.
export function assetUrl(path) {
  if (!path) return null;
  return path.startsWith("http") ? path : `${API_BASE}${path}`;
}

// <img src="..."> can't carry custom headers, so a plain assetUrl() pointed
// straight at an ngrok free-tier URL hits ngrok's browser-warning
// interstitial instead of the actual image (you'll see a broken-image icon
// with the alt text showing). This fetches the bytes ourselves — where we
// CAN set the bypass header — and hands back a local blob URL to render
// instead. Caller is responsible for URL.revokeObjectURL(blobUrl) when done
// with it (e.g. on unmount) to avoid leaking memory.
export async function loadAssetBlobUrl(path) {
  const url = assetUrl(path);
  if (!url) return null;

  const res = await fetch(url, {
    headers: { "ngrok-skip-browser-warning": "true" },
  });
  if (!res.ok) {
    throw new Error("Image not found");
  }
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

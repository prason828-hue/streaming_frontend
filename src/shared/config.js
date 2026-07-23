export const API_BASE = process.env.REACT_APP_API_BASE;

export const REFRESH_TOKEN_PATH = "/api/auth/refresh-token";
export const CURRENT_USER_PATH = null;

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

export function assetUrl(path) {
  if (!path) return null;
  return path.startsWith("http") ? path : `${API_BASE}${path}`;
}

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

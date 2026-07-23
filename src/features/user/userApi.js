// Mirrors com.streamingapp.user.UserController
import request from "../../shared/apiClient";

// PUT /api/users/profile — auth required. Text fields only.
// payload: { name, about, dob, contentType } — contentType as a string
// like "GAMING" (case-insensitive on the backend).
export function updateProfile(payload) {
  return request("/api/users/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// POST /api/users/profile-image — auth required. Multipart, field name "file".
export function uploadProfileImage(file) {
  const formData = new FormData();
  formData.append("file", file);
  return request("/api/users/profile-image", {
    method: "POST",
    body: formData,
  });
}

// GET /api/users/me — auth required. Returns OwnProfileResponse
// (username, email, name, profilePic, about, dob, contentType, subscribers,
// videos, createdAt). This is the "who am I / what's my saved profile" call —
// use this instead of getPublicProfile() whenever you need the logged-in
// user's own data, since it includes fields (email, dob) the public
// endpoint deliberately omits.
export function getMyProfile() {
  return request("/api/users/me", { method: "GET" });
}

// GET /api/users/{username} — public. Returns PublicProfileResponse
// (no password/email). Used for viewing other users' channels.
export function getPublicProfile(username) {
  return request(`/api/users/${username}`, { method: "GET" });
}

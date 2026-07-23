import request from "../../shared/apiClient";

export function updateProfile(payload) {
  return request("/api/users/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function uploadProfileImage(file) {
  const formData = new FormData();
  formData.append("file", file);
  return request("/api/users/profile-image", {
    method: "POST",
    body: formData,
  });
}

export function getMyProfile() {
  return request("/api/users/me", { method: "GET" });
}

export function getPublicProfile(username) {
  return request(`/api/users/${username}`, { method: "GET" });
}

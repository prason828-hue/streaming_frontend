import request from "../../shared/apiClient";

export function getComments(videoId) {
  return request(`/api/comments/${videoId}`, { method: "GET" });
}

export function postComment(videoId, comment) {
  return request("/api/comments", {
    method: "POST",
    body: JSON.stringify({ videoId, comment }),
  });
}

export function postReply(videoId, comment, parentCommentId) {
  return request("/api/comments", {
    method: "POST",
    body: JSON.stringify({ videoId, comment, parentCommentId }),
  });
}

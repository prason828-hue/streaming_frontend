import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { postReply } from "./commentApi";

export default function CommentItem({ comment, videoId, onReplyAdded }) {
  const { user } = useAuth();
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleReplySubmit(e) {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const reply = await postReply(videoId, replyText.trim(), comment.id);
      onReplyAdded(comment.id, reply);
      setReplyText("");
      setShowReplyBox(false);
      setShowReplies(true);
    } catch (err) {
      setError(err.message || "Couldn't post reply");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="comment">
      <div className="comment__header">
        <span className="comment__username">@{comment.username}</span>
        <span className="comment__time">
          {new Date(comment.createdAt).toLocaleDateString()}
        </span>
      </div>
      <p className="comment__text">{comment.comment}</p>

      <div className="comment__actions">
        {user && (
          <button
            className="comment__action-btn"
            onClick={() => setShowReplyBox((v) => !v)}
          >
            Reply
          </button>
        )}
        {comment.replies?.length > 0 && (
          <button
            className="comment__action-btn"
            onClick={() => setShowReplies((v) => !v)}
          >
            {showReplies
              ? "Hide replies"
              : `▼ ${comment.replies.length} repl${
                  comment.replies.length === 1 ? "y" : "ies"
                }`}
          </button>
        )}
      </div>

      {showReplyBox && (
        <form className="comment__reply-form" onSubmit={handleReplySubmit}>
          <input
            className="comment__reply-input"
            type="text"
            placeholder={`Replying to @${comment.username}…`}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            disabled={submitting}
          />
          <button
            className="auth-button"
            type="submit"
            disabled={submitting || !replyText.trim()}
          >
            {submitting ? "Posting…" : "Post"}
          </button>
          {error && <p className="auth-error">{error}</p>}
        </form>
      )}

      {showReplies && comment.replies?.length > 0 && (
        <div className="comment__replies">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="comment comment--reply">
              <div className="comment__header">
                <span className="comment__username">@{reply.username}</span>
                <span className="comment__time">
                  {new Date(reply.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="comment__text">{reply.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

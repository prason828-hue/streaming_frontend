import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getComments, postComment } from "../comment/commentApi";
import { useAuth } from "../auth/AuthContext";
import CommentItem from "../comment/CommentItem";

export default function CommentSection({ videoId, highlightOnLoad = false }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const newestCommentRef = useRef(null);

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [highlightedId, setHighlightedId] = useState(null);
  useEffect(() => {
    if (!videoId) return;
    let cancelled = false;
    setLoading(true);

    getComments(videoId)
      .then((data) => {
        if (!cancelled) setComments(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [videoId]);

  useEffect(() => {
    if (!highlightOnLoad || comments.length === 0) return;

    const newestId = comments[0].id;
    setHighlightedId(newestId);

    const clearTimer = setTimeout(() => setHighlightedId(null), 2500);
    return () => clearTimeout(clearTimer);
  }, [comments.length, highlightOnLoad]);
  useEffect(() => {
    if (!highlightedId) return;
    if (!newestCommentRef.current) return;
    newestCommentRef.current.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [highlightedId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    if (!text.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const newComment = await postComment(videoId, text.trim());
      newComment.replies = [];
      setComments((prev) => [newComment, ...prev]);
      setText("");
    } catch (err) {
      setError(err.message || "Couldn't post comment");
    } finally {
      setSubmitting(false);
    }
  }

  function handleReplyAdded(parentId, reply) {
    setComments((prev) =>
      prev.map((c) =>
        c.id === parentId
          ? {
              ...c,
              replies: [...(c.replies || []), reply],
              replyCount: (c.replyCount || 0) + 1,
            }
          : c
      )
    );
  }

  return (
    <div className="comment-section">
      <h3 className="comment-section__title">
        {comments.length} comment{comments.length !== 1 ? "s" : ""}
      </h3>

      {user ? (
        <form className="comment-section__form" onSubmit={handleSubmit}>
          <input
            className="comment-section__input"
            type="text"
            placeholder="Add a comment…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={submitting}
          />
          <button
            className="auth-button"
            type="submit"
            disabled={submitting || !text.trim()}
          >
            {submitting ? "Posting…" : "Comment"}
          </button>
          {error && <p className="auth-error">{error}</p>}
        </form>
      ) : (
        <p className="comment-section__login-prompt">
          <button className="auth-link" onClick={() => navigate("/login")}>
            Log in
          </button>{" "}
          to comment.
        </p>
      )}

      {loading ? (
        <p className="video-list__loading">Loading comments…</p>
      ) : comments.length === 0 ? (
        <p className="video-list__empty">No comments yet. Be the first!</p>
      ) : (
        <div className="comment-section__list">
          {comments.map((c, i) => (
            <div
              key={c.id}
              ref={i === 0 ? newestCommentRef : null}
              className={highlightedId === c.id ? "comment-highlight" : ""}
            >
              <CommentItem
                comment={c}
                videoId={videoId}
                onReplyAdded={handleReplyAdded}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

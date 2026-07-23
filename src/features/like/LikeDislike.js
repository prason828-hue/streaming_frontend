import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLikeStatus, likeVideo, dislikeVideo } from "./likeApi";
import { useAuth } from "../auth/AuthContext";

export default function LikeDislike({ videoId }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState({
    userAction: null,
    likes: 0,
    dislikes: 0,
  });
  const [working, setWorking] = useState(false);

  useEffect(() => {
    if (!videoId) return;
    let cancelled = false;
    getLikeStatus(videoId)
      .then((data) => {
        if (!cancelled) setStatus(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [videoId]);

  async function handleLike() {
    if (!user) {
      navigate("/login");
      return;
    }
    setWorking(true);
    try {
      setStatus(await likeVideo(videoId));
    } catch (err) {
      console.error(err);
    } finally {
      setWorking(false);
    }
  }

  async function handleDislike() {
    if (!user) {
      navigate("/login");
      return;
    }
    setWorking(true);
    try {
      setStatus(await dislikeVideo(videoId));
    } catch (err) {
      console.error(err);
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="like-dislike">
      <button
        className={`like-dislike__btn${
          status.userAction === "LIKE" ? " like-dislike__btn--active" : ""
        }`}
        onClick={handleLike}
        disabled={working}
      >
        👍 {status.likes.toLocaleString()}
      </button>
      <button
        className={`like-dislike__btn${
          status.userAction === "DISLIKE" ? " like-dislike__btn--active" : ""
        }`}
        onClick={handleDislike}
        disabled={working}
      >
        👎 {status.dislikes.toLocaleString()}
      </button>
    </div>
  );
}

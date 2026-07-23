import { useEffect, useState } from "react";
import { getVideosByUser } from "./videoApi";
import VideoCard from "./VideoCard";

export default function UserVideos({ userId }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    getVideosByUser(userId)
      .then((data) => {
        if (!cancelled) setVideos(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Couldn't load videos");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) return <p className="video-list__loading">Loading videos…</p>;
  if (error) return <p className="auth-error">{error}</p>;
  if (videos.length === 0)
    return <p className="video-list__empty">No videos yet.</p>;

  return (
    <div className="video-list__grid">
      {videos.map((v) => (
        <VideoCard key={v.id} video={v} />
      ))}
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllVideos } from "./videoApi";
import VideoCard from "./VideoCard";

export default function VideoList() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    getAllVideos()
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
  }, []);

  if (loading) {
    return (
      <div className="boot-screen">
        <span className="boot-screen__cursor" />
      </div>
    );
  }

  if (error) {
    return <p className="auth-error">{error}</p>;
  }

  if (videos.length === 0) {
    return (
      <div className="video-list video-list--empty">
        <p>No videos yet.</p>
        <Link className="auth-button" to="/upload">
          Upload the first one
        </Link>
      </div>
    );
  }

  return (
    <div className="video-list">
      <div className="video-list__header">
        <h2 className="video-list__title">Latest videos</h2>
        <Link className="auth-button" to="/upload">
          + Upload
        </Link>
      </div>
      <div className="video-list__grid">
        {videos.map((v) => (
          <VideoCard key={v.id} video={v} />
        ))}
      </div>
    </div>
  );
}

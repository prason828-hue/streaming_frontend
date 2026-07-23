import { useEffect, useState } from "react";
import { getTrendingVideos } from "./recommendationApi";
import VideoCard from "../video/VideoCard";

export default function TrendingSection() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTrendingVideos(10)
      .then(setVideos)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="video-list__loading">Loading trending…</p>;
  if (!videos.length) return null;

  return (
    <section className="trending-section">
      <h2 className="video-list__title">🔥 Trending</h2>
      <div className="video-list__grid">
        {videos.map((v) => <VideoCard key={v.id} video={v} />)}
      </div>
    </section>
  );
}

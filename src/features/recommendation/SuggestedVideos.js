import { useEffect, useState } from "react";
import { getSuggestedVideos } from "./recommendationApi";
import VideoCard from "../video/VideoCard";

export default function SuggestedVideos({ category, excludeId }) {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    getSuggestedVideos(category, excludeId, 6)
      .then(setVideos)
      .catch(() => {});
  }, [category, excludeId]);

  if (!videos.length) return null;

  return (
    <section className="suggested-videos">
      <h2 className="video-list__title">🎯 Up Next</h2>
      <div className="video-list__grid">
        {videos.map((v) => <VideoCard key={v.id} video={v} />)}
      </div>
    </section>
  );
}

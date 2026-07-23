import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { loadThumbnailBlobUrl } from "./videoApi";

export default function VideoCard({ video }) {
  const [thumbSrc, setThumbSrc] = useState(null);
  const blobRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    if (video.thumbnailUrl) {
      loadThumbnailBlobUrl(video.thumbnailUrl)
        .then((blobUrl) => {
          if (!cancelled) {
            blobRef.current = blobUrl;
            setThumbSrc(blobUrl);
          }
        })
        .catch(() => {});
    }

    return () => {
      cancelled = true;
      if (blobRef.current) URL.revokeObjectURL(blobRef.current);
    };
  }, [video.thumbnailUrl]);

  return (
    <Link className="video-card" to={`/videos/${video.id}`}>
      <div className="video-card__thumb">
        {thumbSrc ? (
          <img src={thumbSrc} alt={video.title} />
        ) : (
          <div className="video-card__thumb-placeholder">▶</div>
        )}
      </div>

      <div className="video-card__info">
        <h3 className="video-card__title">{video.title}</h3>
        <p className="video-card__meta">
          {video.views?.toLocaleString()} views
          {video.category ? ` · ${video.category}` : ""}
        </p>
        {video.tags?.length > 0 && (
          <p className="video-card__tags">
            {video.tags.map((t) => `#${t}`).join(" ")}
          </p>
        )}
      </div>
    </Link>
  );
}

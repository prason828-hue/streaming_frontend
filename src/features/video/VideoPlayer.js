import { useEffect, useRef, useState } from "react";
import {
  useParams,
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  getVideo,
  getStreamUrl,
  loadThumbnailBlobUrl,
  deleteVideo,
} from "../video/videoApi";
import LikeDislike from "../like/LikeDislike";
import SubscribeButton from "../subscription/SubscribeButton";
import CommentSection from "../comment/CommentSection";
import { useAuth } from "../auth/AuthContext";
// Phase 6 additions
import { recordWatchTime } from "../analytics/analyticsApi";
import SuggestedVideos from "../recommendation/SuggestedVideos";

function formatDuration(seconds) {
  if (!seconds) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function VideoPlayer() {
  const { videoId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Deep-link params set by notification clicks
  const shouldScrollToComments =
    searchParams.get("scrollToComments") === "true";
  const shouldAutoplay = searchParams.get("autoplay") === "true";

  const videoRef = useRef(null);
  const thumbBlobRef = useRef(null);
  const commentSectionRef = useRef(null);

  // Phase 6: watch-time tracking
  // Accumulates seconds watched; flushes to the backend every 30 s and on unmount/pause
  const watchSecondsRef = useRef(0);
  const watchIntervalRef = useRef(null);

  const [video, setVideo] = useState(null);
  const [thumbnailSrc, setThumbnailSrc] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [buffering, setBuffering] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getVideo(videoId)
      .then(async (data) => {
        if (cancelled) return;
        setVideo(data);
        if (data.thumbnailUrl) {
          try {
            const blobUrl = await loadThumbnailBlobUrl(data.thumbnailUrl);
            if (!cancelled) {
              thumbBlobRef.current = blobUrl;
              setThumbnailSrc(blobUrl);
            }
          } catch {
            /* thumbnail optional */
          }
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Video not found");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [videoId]);

  useEffect(() => {
    if (!video) return;

    if (shouldAutoplay && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }

    if (shouldScrollToComments) {
      setTimeout(() => {
        commentSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 300);
    }
  }, [video, shouldAutoplay, shouldScrollToComments]);

  useEffect(() => {
    return () => {
      if (thumbBlobRef.current) URL.revokeObjectURL(thumbBlobRef.current);
    };
  }, []);

  // Phase 6: attach watch-time listeners once the video element is ready
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !videoId) return;

    function onPlay() {
      watchIntervalRef.current = setInterval(() => {
        watchSecondsRef.current += 1;
        // Flush every 30 s while playing
        if (watchSecondsRef.current % 30 === 0) {
          recordWatchTime(videoId, 30).catch(() => {});
        }
      }, 1000);
    }

    function onPause() {
      clearInterval(watchIntervalRef.current);
      // Flush remaining seconds on pause
      const remaining = watchSecondsRef.current % 30;
      if (remaining > 0) recordWatchTime(videoId, remaining).catch(() => {});
    }

    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);

    return () => {
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      clearInterval(watchIntervalRef.current);
      // Flush on unmount (user navigates away mid-video)
      const remaining = watchSecondsRef.current % 30;
      if (remaining > 0) recordWatchTime(videoId, remaining).catch(() => {});
      watchSecondsRef.current = 0;
    };
  }, [videoId]);

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    try {
      await deleteVideo(videoId);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Could not delete video");
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  const isOwner = user && video && user.id === video.userId;

  if (loading)
    return (
      <div className="boot-screen">
        <span className="boot-screen__cursor" />
      </div>
    );

  if (error)
    return (
      <div className="video-player video-player--error">
        <p>{error}</p>
        <Link className="auth-link" to="/">
          Back to home
        </Link>
      </div>
    );

  return (
    <div className="video-player">
      {buffering && (
        <div className="video-player__spinner">
          <div className="video-spinner"></div>
        </div>
      )}
      <video
        ref={videoRef}
        className="video-player__video"
        controls
        autoPlay
        playsInline
        preload="auto"
        poster={thumbnailSrc || undefined}
        src={getStreamUrl(videoId)}
        onWaiting={() => setBuffering(true)}
        onCanPlay={() => setBuffering(false)}
        onPlaying={() => setBuffering(false)}
        onLoadedData={() => setBuffering(false)}
        onError={() => setError("Could not load video.")}
      />

      <div className="video-player__info">
        <div className="video-player__title-row">
          <h1 className="video-player__title">{video.title}</h1>
          {isOwner && (
            <button
              className={`video-delete-btn${
                confirmDelete ? " video-delete-btn--confirm" : ""
              }`}
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting
                ? "Deleting…"
                : confirmDelete
                ? "Tap again to confirm"
                : "🗑 Delete"}
            </button>
          )}
        </div>

        <div className="video-player__meta">
          <span>{video.views?.toLocaleString()} views</span>
          {video.durationSeconds > 0 && (
            <span>{formatDuration(video.durationSeconds)}</span>
          )}
          {video.category && <span>{video.category}</span>}
        </div>

        <div className="video-player__actions">
          <LikeDislike videoId={videoId} />
          {video.userId && <SubscribeButton channelId={video.userId} />}
        </div>

        {video.tags?.length > 0 && (
          <div className="video-player__tags">
            {video.tags.map((tag) => (
              <span key={tag} className="public-profile__tag">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {video.description && (
          <p className="video-player__description">{video.description}</p>
        )}

        <Link className="auth-link" to="/">
          ← Back to home
        </Link>
      </div>

      {/* ref on this wrapper so scrollIntoView lands at the right place */}
      <div ref={commentSectionRef}>
        <CommentSection
          videoId={videoId}
          highlightOnLoad={shouldScrollToComments}
        />
      </div>

      {/* Phase 6: suggested videos based on same category */}
      <SuggestedVideos category={video.category} excludeId={videoId} />
    </div>
  );
}

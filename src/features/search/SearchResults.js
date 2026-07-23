import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { searchAll } from "./searchApi";
import { loadThumbnailBlobUrl } from "../video/videoApi";

const TABS = ["all", "videos", "creators", "categories"];

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const q = searchParams.get("q") || "";
  const initialTab = searchParams.get("type") || "all";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [results, setResults] = useState({ videos: [], creators: [], categories: [] });
  const [loading, setLoading] = useState(false);
  const [thumbMap, setThumbMap] = useState({});

  useEffect(() => {
    if (!q.trim()) return;
    setLoading(true);
    searchAll(q.trim())
      .then(setResults)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [q]);

  useEffect(() => {
    results.videos?.forEach((v) => {
      if (!v.thumbnailUrl || thumbMap[v.id]) return;
      loadThumbnailBlobUrl(v.thumbnailUrl)
        .then((url) => setThumbMap((prev) => ({ ...prev, [v.id]: url })))
        .catch(() => {});
    });

  }, [results.videos]);

  const showVideos = activeTab === "all" || activeTab === "videos";
  const showCreators = activeTab === "all" || activeTab === "creators";
  const showCategories = activeTab === "all" || activeTab === "categories";

  return (
    <div className="search-results">
      <div className="search-results__header">
        <Link className="auth-link" to="/">← Home</Link>
        <h1 className="search-results__title">Results for "{q}"</h1>
      </div>

      <div className="search-results__tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`search-tab${activeTab === tab ? " search-tab--active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {loading && <p className="video-list__loading">Searching…</p>}

      {!loading && showVideos && results.videos?.length > 0 && (
        <section className="search-results__section">
          <h2 className="search-results__section-title">Videos</h2>
          <div className="video-list__grid">
            {results.videos.map((v) => (
              <Link key={v.id} className="video-card" to={`/videos/${v.id}`}>
                <div className="video-card__thumb">
                  {thumbMap[v.id]
                    ? <img src={thumbMap[v.id]} alt={v.title} />
                    : <div className="video-card__thumb-placeholder">▶</div>}
                </div>
                <div className="video-card__info">
                  <h3 className="video-card__title">{v.title}</h3>
                  <p className="video-card__meta">
                    {v.views?.toLocaleString()} views · {v.category}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {!loading && showCreators && results.creators?.length > 0 && (
        <section className="search-results__section">
          <h2 className="search-results__section-title">Creators</h2>
          <div className="search-creators-grid">
            {results.creators.map((c) => (
              <Link key={c.id} className="creator-card" to={`/u/${c.username}`}>
                <div className="creator-card__avatar">
                  {c.profilePic
                    ? <img src={c.profilePic} alt={c.username} />
                    : <span>{c.username?.[0]?.toUpperCase()}</span>}
                </div>
                <p className="creator-card__name">{c.name || c.username}</p>
                <p className="creator-card__handle">@{c.username}</p>
                <p className="creator-card__sub">{c.subscribers} subscribers</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {!loading && showCategories && results.categories?.length > 0 && (
        <section className="search-results__section">
          <h2 className="search-results__section-title">Categories</h2>
          <div className="search-categories-grid">
            {results.categories.map((c) => (
              <div
                key={c.id}
                className="category-card"
                onClick={() => navigate(`/search?q=${encodeURIComponent(c.category)}&type=videos`)}
              >
                <span className="category-card__name">{c.category}</span>
                <span className="category-card__count">{c.videoCount} videos</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {!loading && !results.videos?.length && !results.creators?.length && !results.categories?.length && (
        <p className="video-list__empty">No results found for "{q}".</p>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAnalyticsOverview } from "./analyticsApi";

function formatSeconds(s) {
  if (!s) return "0m";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function StatCard({ label, value, icon }) {
  return (
    <div className="stat-card">
      <span className="stat-card__icon">{icon}</span>
      <p className="stat-card__value">{value}</p>
      <p className="stat-card__label">{label}</p>
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAnalyticsOverview()
      .then(setData)
      .catch((err) => setError(err.message || "Could not load analytics"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="boot-screen"><span className="boot-screen__cursor" /></div>;

  if (error) return (
    <div className="analytics-page">
      <p className="auth-error">{error}</p>
      <Link className="auth-link" to="/">← Back</Link>
    </div>
  );

  return (
    <div className="analytics-page">
      <div className="analytics-page__header">
        <Link className="auth-link" to="/">← Dashboard</Link>
        <h1 className="analytics-page__title">Channel Analytics</h1>
      </div>

      {/* Overview stat cards */}
      <div className="stat-cards">
        <StatCard label="Total Views" value={data.totalViews?.toLocaleString()} icon="👁️" />
        <StatCard label="Watch Time" value={formatSeconds(data.totalWatchSeconds)} icon="⏱️" />
        <StatCard label="Subscribers" value={data.totalSubscribers?.toLocaleString()} icon="👥" />
        <StatCard label="Total Likes" value={data.totalLikes?.toLocaleString()} icon="👍" />
        <StatCard label="Videos" value={data.videoCount} icon="🎬" />
      </div>

      {/* Per-video breakdown */}
      {data.videos?.length > 0 && (
        <section className="analytics-table-section">
          <h2 className="analytics-page__subtitle">Video Performance</h2>
          <div className="analytics-table-wrapper">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Video</th>
                  <th>Views</th>
                  <th>Watch Time</th>
                  <th>Likes</th>
                </tr>
              </thead>
              <tbody>
                {data.videos.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <Link className="analytics-table__link" to={`/videos/${v.id}`}>
                        {v.title}
                      </Link>
                    </td>
                    <td>{v.views?.toLocaleString()}</td>
                    <td>{formatSeconds(v.totalWatchSeconds)}</td>
                    <td>{v.likes?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

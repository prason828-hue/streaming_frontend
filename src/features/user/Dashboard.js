import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useWebSocket } from "../websocket/WebSocketContext";
import VideoList from "../video/VideoList";
import ChatList from "../chat/ChatList";
import NotificationBell from "../notification/NotificationBell";
import NotificationToast from "../notification/NotificationToast";
import SearchBar from "../search/SearchBar";
import TrendingSection from "../recommendation/TrendingSection";
import SuggestedCreators from "../recommendation/SuggestedCreators";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { connected } = useWebSocket();
  const [showChat, setShowChat] = useState(false);
  const [activeSection, setActiveSection] = useState("latest"); // "latest" | "trending"

  return (
    <div className="dashboard">
      <NotificationToast />

      <header className="dashboard__header">
        <div className="dashboard__brand">
          ⌁ Streamora
          <span
            className={`ws-dot${connected ? " ws-dot--on" : ""}`}
            title={connected ? "Live" : "Connecting…"}
          />
        </div>

        {/* Search bar in the centre of the header */}
        <div className="dashboard__search">
          <SearchBar />
        </div>

        <div className="dashboard__header-actions">
          <NotificationBell />
          <button
            className="auth-button auth-button--ghost"
            onClick={() => setShowChat((v) => !v)}
          >
            💬
          </button>
          <Link className="auth-button auth-button--ghost" to="/analytics">
            📊
          </Link>
          {user?.username && (
            <Link
              className="auth-button auth-button--ghost"
              to={`/u/${user.username}`}
            >
              Profile
            </Link>
          )}
          <Link className="auth-button auth-button--ghost" to="/profile/edit">
            Edit
          </Link>
          <Link className="auth-button" to="/upload">
            + Upload
          </Link>
          <button className="auth-button auth-button--ghost" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      <main className="dashboard__main">
        {showChat && (
          <div className="dashboard__chat-panel">
            <ChatList />
          </div>
        )}

        <div
          className={
            showChat ? "dashboard__feed--with-chat" : "dashboard__feed"
          }
        >
          {/* Section tabs */}
          <div className="dashboard__tabs">
            <button
              className={`dashboard__tab${
                activeSection === "latest" ? " dashboard__tab--active" : ""
              }`}
              onClick={() => setActiveSection("latest")}
            >
              Latest
            </button>
            <button
              className={`dashboard__tab${
                activeSection === "trending" ? " dashboard__tab--active" : ""
              }`}
              onClick={() => setActiveSection("trending")}
            >
              🔥 Trending
            </button>
          </div>

          {activeSection === "latest" && (
            <>
              <SuggestedCreators />
              <VideoList />
            </>
          )}

          {activeSection === "trending" && <TrendingSection />}
        </div>
      </main>
    </div>
  );
}

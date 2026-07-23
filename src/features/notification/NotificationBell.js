import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWebSocket } from "../websocket/WebSocketContext";
import { getNotifications, markAllRead, markRead } from "./notificationApi";

export default function NotificationBell() {
  const navigate = useNavigate();
  const {
    notifications: wsNotifs,
    unreadNotifCount,
    markNotificationsRead,
  } = useWebSocket();
  const [open, setOpen] = useState(false);
  const [allNotifs, setAllNotifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getNotifications()
      .then(setAllNotifs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open]);

  useEffect(() => {
    if (wsNotifs.length === 0) return;
    setAllNotifs((prev) => {
      const existingIds = new Set(prev.map((n) => n.id));
      const fresh = wsNotifs.filter((n) => !existingIds.has(n.id));
      return fresh.length > 0 ? [...fresh, ...prev] : prev;
    });
  }, [wsNotifs]);

  useEffect(() => {
    function handler(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleOpen() {
    setOpen((v) => !v);
    if (!open && unreadNotifCount > 0) {
      markNotificationsRead();
      markAllRead().catch(() => {});
    }
  }
  function handleNotifClick(notif) {
    setOpen(false);

    markRead(notif.id).catch(() => {});
    setAllNotifs((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );

    const ref = notif.referenceId;

    switch (notif.type) {
      case "NEW_MESSAGE":
        navigate(ref ? `/messages?open=${ref}` : "/messages");
        break;
      case "NEW_SUBSCRIBER":
        navigate(ref ? `/u/${ref}` : "/");
        break;
      case "NEW_COMMENT":
        navigate(ref ? `/videos/${ref}?scrollToComments=true` : "/");
        break;
      case "VIDEO_UPLOADED":
        navigate(ref ? `/videos/${ref}?autoplay=true` : "/");
        break;
      default:
        break;
    }
  }

  function notifIcon(type) {
    const icons = {
      NEW_SUBSCRIBER: "👤",
      NEW_COMMENT: "💬",
      NEW_MESSAGE: "✉️",
      VIDEO_UPLOADED: "🎬",
    };
    return icons[type] || "🔔";
  }

  return (
    <div className="notif-bell" ref={panelRef}>
      <button className="notif-bell__btn" onClick={handleOpen}>
        🔔
        {unreadNotifCount > 0 && (
          <span className="notif-bell__count">{unreadNotifCount}</span>
        )}
      </button>

      {open && (
        <div className="notif-panel">
          <div className="notif-panel__header">
            <span>Notifications</span>
          </div>

          {loading ? (
            <p className="notif-panel__empty">Loading…</p>
          ) : allNotifs.length === 0 ? (
            <p className="notif-panel__empty">No notifications yet.</p>
          ) : (
            <ul className="notif-panel__list">
              {allNotifs.map((n) => (
                <li
                  key={n.id}
                  className={`notif-item notif-item--clickable${
                    n.read ? "" : " notif-item--unread"
                  }`}
                  onClick={() => handleNotifClick(n)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && handleNotifClick(n)}
                >
                  <span className="notif-item__icon">{notifIcon(n.type)}</span>
                  <div className="notif-item__body">
                    <p className="notif-item__msg">{n.message}</p>
                    <span className="notif-item__time">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="notif-item__arrow">›</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

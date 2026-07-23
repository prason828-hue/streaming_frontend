import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWebSocket } from "../websocket/WebSocketContext";

function notifIcon(type) {
  const icons = {
    NEW_SUBSCRIBER: "👤",
    NEW_COMMENT: "💬",
    NEW_MESSAGE: "✉️",
    VIDEO_UPLOADED: "🎬",
  };
  return icons[type] || "🔔";
}

function getDeepLink(notif) {
  const ref = notif.referenceId;
  switch (notif.type) {
    case "NEW_MESSAGE":
      return ref ? `/messages?open=${ref}` : "/messages";
    case "NEW_SUBSCRIBER":
      return ref ? `/u/${ref}` : "/";
    case "NEW_COMMENT":
      return ref ? `/videos/${ref}?scrollToComments=true` : "/";
    case "VIDEO_UPLOADED":
      return ref ? `/videos/${ref}?autoplay=true` : "/";
    default:
      return "/";
  }
}

function Toast({ notif, onDismiss }) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  function handleClick() {
    onDismiss(notif.id);
    navigate(getDeepLink(notif));
  }

  function handleClose(e) {
    e.stopPropagation();
    onDismiss(notif.id);
  }

  return (
    <div
      className={`toast${visible ? " toast--visible" : ""}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
    >
      <span className="toast__icon">{notifIcon(notif.type)}</span>
      <span className="toast__msg">{notif.message}</span>
      <button className="toast__close" onClick={handleClose}>
        ✕
      </button>
    </div>
  );
}

export default function NotificationToast() {
  const { notifications } = useWebSocket();
  const [toasts, setToasts] = useState([]);
  const seenIdsRef = { current: new Set() };

  useEffect(() => {
    if (notifications.length === 0) return;

    const latest = notifications[0];
    if (!latest || shownIds.has(latest.id)) return;

    shownIds.add(latest.id);
    const toastEntry = { ...latest, toastId: latest.id };
    setToasts((prev) => [toastEntry, ...prev].slice(0, 4)); 

    const t = setTimeout(() => dismiss(latest.id), 5000);
    return () => clearTimeout(t);
  }, [notifications]);

  function dismiss(id) {
    setToasts((prev) => prev.filter((t) => t.toastId !== id));
  }

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <Toast key={t.toastId} notif={t} onDismiss={dismiss} />
      ))}
    </div>
  );
}

const shownIds = new Set();

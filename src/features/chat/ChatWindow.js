import { useEffect, useRef, useState } from "react";
import { getChatHistory, markSeen } from "../chat/chatApi";
import { useWebSocket } from "../websocket/WebSocketContext";
import { useAuth } from "../auth/AuthContext";

// inline=true → renders as a full panel (MessagesPage)
// inline=false (default) → fixed bottom-right overlay (Dashboard chat bubble)
export default function ChatWindow({
  contactUsername,
  onClose,
  inline = false,
}) {
  const { user } = useAuth();
  const { sendMessage, registerMessageHandler, onlineUsers, chatMessages } =
    useWebSocket();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const isOnline = onlineUsers.has(contactUsername);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setMessages([]);

    getChatHistory(contactUsername)
      .then((hist) => {
        if (!cancelled) {
          setMessages(hist);
          markSeen(contactUsername).catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [contactUsername]);

  // Merge WS messages
  useEffect(() => {
    const wsMessages = chatMessages[contactUsername] || [];
    if (wsMessages.length === 0) return;
    setMessages((prev) => {
      const existingIds = new Set(prev.map((m) => m.id));
      const newOnes = wsMessages.filter((m) => !existingIds.has(m.id));
      return newOnes.length > 0 ? [...prev, ...newOnes] : prev;
    });
  }, [chatMessages, contactUsername]);

  // Register live handler
  useEffect(() => {
    const unregister = registerMessageHandler(contactUsername, (msg) => {
      setMessages((prev) => {
        if (prev.find((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      markSeen(contactUsername).catch(() => {});
    });
    return unregister;
  }, [contactUsername, registerMessageHandler]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend(e) {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(contactUsername, text.trim());
    setText("");
  }

  function formatTime(date) {
    if (!date) return "";
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const wrapperClass = inline
    ? "chat-window chat-window--inline"
    : "chat-window";

  return (
    <div className={wrapperClass}>
      <div className="chat-window__header">
        <div className="chat-window__contact">
          <span
            className={`chat-window__dot${
              isOnline ? " chat-window__dot--online" : ""
            }`}
          />
          <span className="chat-window__contact-name">@{contactUsername}</span>
          <span className="chat-window__status">
            {isOnline ? "Online" : "Offline"}
          </span>
        </div>
        {onClose && (
          <button className="chat-window__close" onClick={onClose}>
            ✕
          </button>
        )}
      </div>

      <div className="chat-window__messages">
        {loading ? (
          <p className="chat-window__hint">Loading…</p>
        ) : messages.length === 0 ? (
          <p className="chat-window__hint">No messages yet. Say hello!</p>
        ) : (
          messages.map((msg) => {
            const mine = msg.senderUsername === user?.username;
            return (
              <div
                key={msg.id}
                className={`chat-bubble${
                  mine ? " chat-bubble--mine" : " chat-bubble--theirs"
                }`}
              >
                <p className="chat-bubble__text">{msg.message}</p>
                <div className="chat-bubble__meta">
                  <span className="chat-bubble__time">
                    {formatTime(msg.createdAt)}
                  </span>
                  {mine && (
                    <span className="chat-bubble__status">
                      {msg.status === "SEEN"
                        ? "✓✓"
                        : msg.status === "DELIVERED"
                        ? "✓✓"
                        : "✓"}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form className="chat-window__input-row" onSubmit={handleSend}>
        <input
          className="chat-window__input"
          type="text"
          placeholder="Type a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="auth-button" type="submit" disabled={!text.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}

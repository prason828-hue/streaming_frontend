import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getConversations } from "../chat/chatApi";
import { useWebSocket } from "../websocket/WebSocketContext";
import ChatWindow from "../chat/ChatWindow";

export default function MessagesPage() {
  const { user } = useAuth();
  const { chatMessages } = useWebSocket();
  const [searchParams] = useSearchParams();

  const [activeChat, setActiveChat] = useState(
    searchParams.get("open") || null
  );
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUsername, setNewUsername] = useState("");
  const [newChatError, setNewChatError] = useState("");

  useEffect(() => {
    getConversations()
      .then(setConversations)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const openParam = searchParams.get("open");
    if (!openParam) return;
    setActiveChat(openParam);
    setConversations((prev) => {
      if (prev.find((c) => c.contactUsername === openParam)) return prev;
      return [
        { contactUsername: openParam, lastMessage: "", unreadCount: 0 },
        ...prev,
      ];
    });
  }, [searchParams]);

  useEffect(() => {
    Object.keys(chatMessages).forEach((contact) => {
      setConversations((prev) => {
        const existing = prev.find((c) => c.contactUsername === contact);
        const msgs = chatMessages[contact];
        const last = msgs[msgs.length - 1];
        if (existing) {
          return prev.map((c) =>
            c.contactUsername === contact
              ? { ...c, lastMessage: last?.message || c.lastMessage }
              : c
          );
        }
        return [
          {
            contactUsername: contact,
            lastMessage: last?.message || "",
            lastMessageAt: last?.createdAt,
            unreadCount: 0,
          },
          ...prev,
        ];
      });
    });
  }, [chatMessages]);

  async function startNewChat(e) {
    e.preventDefault();
    const username = newUsername.trim();
    if (!username) return;
    setNewChatError("");
    try {
      const { getChatHistory } = await import("../chat/chatApi");
      await getChatHistory(username);
      setActiveChat(username);
      setNewUsername("");
      setConversations((prev) => {
        if (prev.find((c) => c.contactUsername === username)) return prev;
        return [
          { contactUsername: username, lastMessage: "", unreadCount: 0 },
          ...prev,
        ];
      });
    } catch (err) {
      setNewChatError(
        err.status === 404 ? `User "@${username}" not found.` : err.message
      );
    }
  }

  return (
    <div className="messages-page">
      <div className="messages-page__sidebar">
        <div className="messages-page__sidebar-header">
          <Link className="auth-link" to="/">
            ← Dashboard
          </Link>
          <h2 className="messages-page__title">Messages</h2>
        </div>

        <form className="chat-list__new" onSubmit={startNewChat}>
          <input
            className="comment-section__input"
            type="text"
            placeholder="Start new chat…"
            value={newUsername}
            onChange={(e) => {
              setNewUsername(e.target.value);
              setNewChatError("");
            }}
          />
          <button className="auth-button" type="submit">
            Go
          </button>
        </form>
        {newChatError && (
          <p className="auth-error" style={{ padding: "0 0.75rem" }}>
            {newChatError}
          </p>
        )}

        {loading ? (
          <p className="video-list__loading">Loading…</p>
        ) : conversations.length === 0 ? (
          <p className="video-list__empty">No conversations yet.</p>
        ) : (
          <ul className="chat-list__items">
            {conversations.map((conv) => (
              <li
                key={conv.contactUsername}
                className={`chat-list__item${
                  activeChat === conv.contactUsername
                    ? " chat-list__item--active"
                    : ""
                }`}
                onClick={() => setActiveChat(conv.contactUsername)}
              >
                <div className="chat-list__item-top">
                  <span className="chat-list__contact">
                    @{conv.contactUsername}
                  </span>
                  {conv.unreadCount > 0 && (
                    <span className="chat-list__badge">{conv.unreadCount}</span>
                  )}
                </div>
                {conv.lastMessage && (
                  <p className="chat-list__preview">{conv.lastMessage}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="messages-page__chat">
        {activeChat ? (
          <ChatWindow
            contactUsername={activeChat}
            onClose={() => setActiveChat(null)}
            inline
          />
        ) : (
          <div className="messages-page__empty">
            <p>Select a conversation or start a new one</p>
          </div>
        )}
      </div>
    </div>
  );
}

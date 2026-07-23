import { useEffect, useState } from "react";
import { getConversations } from "./chatApi";
import { useWebSocket } from "../websocket/WebSocketContext";
import ChatWindow from "./ChatWindow";

export default function ChatList() {
  const { chatMessages } = useWebSocket();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null);
  const [newChatUsername, setNewChatUsername] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatError, setNewChatError] = useState("");

  useEffect(() => {
    getConversations()
      .then(setConversations)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // When a new WS message arrives for a contact not in the list, add them
  useEffect(() => {
    Object.keys(chatMessages).forEach((contact) => {
      setConversations((prev) => {
        if (prev.find((c) => c.contactUsername === contact)) return prev;
        const msgs = chatMessages[contact];
        const last = msgs[msgs.length - 1];
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

  function openChat(username) {
    setActiveChat(username);
    setShowNewChat(false);
  }

  async function startNewChat(e) {
    e.preventDefault();
    const username = newChatUsername.trim();
    if (!username) return;
    setNewChatError("");

    // Check the user exists before opening a chat window
    try {
      const { getChatHistory } = await import("./chatApi");
      await getChatHistory(username);
      openChat(username);
      setNewChatUsername("");
    } catch (err) {
      if (err.status === 404) {
        setNewChatError(`User "@${username}" not found.`);
      } else {
        setNewChatError(err.message || "Something went wrong.");
      }
    }
  }

  return (
    <div className="chat-list">
      <div className="chat-list__header">
        <h3 className="chat-list__title">Messages</h3>
        <button
          className="auth-button auth-button--ghost"
          onClick={() => setShowNewChat((v) => !v)}
        >
          + New
        </button>
      </div>

      {showNewChat && (
        <form className="chat-list__new" onSubmit={startNewChat}>
          <input
            className="comment-section__input"
            type="text"
            placeholder="Enter username…"
            value={newChatUsername}
            onChange={(e) => {
              setNewChatUsername(e.target.value);
              setNewChatError("");
            }}
          />
          <button className="auth-button" type="submit">
            Open
          </button>
          {newChatError && (
            <p className="auth-error" style={{ padding: "0 0.5rem" }}>
              {newChatError}
            </p>
          )}
        </form>
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
              onClick={() => openChat(conv.contactUsername)}
            >
              <div className="chat-list__item-top">
                <span className="chat-list__contact">
                  @{conv.contactUsername}
                </span>
                {conv.unreadCount > 0 && (
                  <span className="chat-list__badge">{conv.unreadCount}</span>
                )}
              </div>
              <p className="chat-list__preview">{conv.lastMessage}</p>
            </li>
          ))}
        </ul>
      )}

      {activeChat && (
        <ChatWindow
          contactUsername={activeChat}
          onClose={() => setActiveChat(null)}
        />
      )}
    </div>
  );
}

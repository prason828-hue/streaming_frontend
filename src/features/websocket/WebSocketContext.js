import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { getAccessToken } from "../../shared/apiClient";
import {
  connectWebSocket,
  disconnectWebSocket,
  sendChatMessage as wsSendMessage,
} from "./wsClient";

const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
  const { user } = useAuth();
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [chatMessages, setChatMessages] = useState({});
  const messageHandlersRef = useRef({});

  useEffect(() => {
    if (!user) {
      disconnectWebSocket();
      setConnected(false);
      return;
    }

    const token = getAccessToken();
    if (!token) return;

    connectWebSocket({
      token,
      onConnect: () => setConnected(true),

      onMessage: (msg) => {
        const contact =
          msg.senderUsername === user.username
            ? msg.receiverUsername
            : msg.senderUsername;

        setChatMessages((prev) => ({
          ...prev,
          [contact]: [...(prev[contact] || []), msg],
        }));

        messageHandlersRef.current[contact]?.(msg);
      },

      onNotification: (notif) => {
        setNotifications((prev) => [notif, ...prev]);
        setUnreadNotifCount((c) => c + 1);
      },

      onOnlineStatus: (event) => {
        setOnlineUsers((prev) => {
          const next = new Set(prev);
          if (event.status === "ONLINE") next.add(event.username);
          else next.delete(event.username);
          return next;
        });
      },

      onSeen: (event) => {

        setChatMessages((prev) => {
          const conv = prev[event.seenBy] || [];
          return {
            ...prev,
            [event.seenBy]: conv.map((m) =>
              m.senderUsername === user.username ? { ...m, status: "SEEN" } : m
            ),
          };
        });
      },
    });

    return () => {
      disconnectWebSocket();
      setConnected(false);
    };

  }, [user]);

  function sendMessage(receiverUsername, text) {
    wsSendMessage(receiverUsername, text);
  }

  function registerMessageHandler(username, handler) {
    messageHandlersRef.current[username] = handler;
    return () => {
      delete messageHandlersRef.current[username];
    };
  }

  function markNotificationsRead() {
    setUnreadNotifCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  const value = {
    connected,
    onlineUsers,
    notifications,
    unreadNotifCount,
    chatMessages,
    sendMessage,
    registerMessageHandler,
    markNotificationsRead,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error("useWebSocket must be inside <WebSocketProvider>");
  return ctx;
}

import { Client } from "@stomp/stompjs";
import { API_BASE } from "../../shared/config";

let client = null;

function toWsUrl(base) {
  return base.replace(/^http/, "ws");
}

export function connectWebSocket({
  token,
  onMessage,
  onNotification,
  onOnlineStatus,
  onSeen,
  onConnect,
}) {
  if (client && client.connected) return;

  const wsUrl = `${toWsUrl(API_BASE)}/ws`;

  client = new Client({
    brokerURL: wsUrl,
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    reconnectDelay: 5000,
    onConnect: () => {
      client.subscribe("/user/queue/messages", (frame) => {
        onMessage && onMessage(JSON.parse(frame.body));
      });

      client.subscribe("/user/queue/notifications", (frame) => {
        onNotification && onNotification(JSON.parse(frame.body));
      });

      client.subscribe("/user/queue/seen", (frame) => {
        onSeen && onSeen(JSON.parse(frame.body));
      });

      client.subscribe("/topic/online-status", (frame) => {
        onOnlineStatus && onOnlineStatus(JSON.parse(frame.body));
      });

      onConnect && onConnect();
    },
    onStompError: (frame) => console.error("STOMP error", frame),
    onWebSocketError: (event) => console.error("WS error", event),
  });

  client.activate();
}

export function sendChatMessage(receiverUsername, message) {
  if (!client || !client.connected) return;
  client.publish({
    destination: "/app/chat.send",
    body: JSON.stringify({ receiverUsername, message }),
  });
}

export function disconnectWebSocket() {
  if (client) {
    client.deactivate();
    client = null;
  }
}

export function isConnected() {
  return !!(client && client.connected);
}

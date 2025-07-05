import { useEffect, useCallback, useRef } from "react";
import { webSocketManager, WebSocketMessage, WebSocketMessageHandler } from "@/lib/websocket";

export function useWebSocket(onMessage?: WebSocketMessageHandler) {
  const handlerRef = useRef<WebSocketMessageHandler | undefined>(onMessage);
  handlerRef.current = onMessage;

  useEffect(() => {
    const messageHandler: WebSocketMessageHandler = (message) => {
      if (handlerRef.current) {
        handlerRef.current(message);
      }
    };

    // Connect to WebSocket with graceful error handling
    webSocketManager.connect().catch(error => {
      console.warn("WebSocket connection unavailable, real-time features disabled");
    });

    // Add message handler
    if (handlerRef.current) {
      webSocketManager.addMessageHandler(messageHandler);
    }

    return () => {
      // Remove message handler
      if (handlerRef.current) {
        webSocketManager.removeMessageHandler(messageHandler);
      }
    };
  }, []);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    return webSocketManager.send(message);
  }, []);

  return {
    sendMessage,
    isConnected: webSocketManager.isConnected,
  };
}

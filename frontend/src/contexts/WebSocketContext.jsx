import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";

const WS_URL = "ws://localhost:3003";

export const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const wsRef = useRef(null);
  const [lastEvent, setLastEvent] = useState(null);

  const connect = useCallback(() => {
    if (wsRef.current) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[WS] Conectado ao notification-service");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("[WS] Evento recebido:", data);
        setLastEvent({ ...data, _ts: Date.now() });
      } catch {
        // ignora mensagens malformadas
      }
    };

    ws.onclose = () => {
      console.log("[WS] Desconectado");
      wsRef.current = null;
    };

    ws.onerror = (err) => {
      console.error("[WS] Erro:", err);
    };
  }, []);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      connect();
    } else {
      disconnect();
    }
    return () => disconnect();
  }, [isAuthenticated, connect, disconnect]);

  return (
    <WebSocketContext.Provider value={{ lastEvent }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  return useContext(WebSocketContext);
}

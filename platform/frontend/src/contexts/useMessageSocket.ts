/**
 * WebSocket hook – connects to the message WebSocket and routes incoming
 * message events to a caller-provided callback.
 */
import { useEffect, useRef, useCallback } from 'react';
import { API_BASE } from '../api/client';
import type { WsEvent } from '../types';

type MessageHandler = (event: WsEvent) => void;

export function useMessageSocket(onEvent: MessageHandler, enabled = true) {
  const wsRef = useRef<WebSocket | null>(null);
  const handlerRef = useRef(onEvent);
  handlerRef.current = onEvent;

  const connect = useCallback(() => {
    const token = localStorage.getItem('access_token');
    if (!token || !enabled) return;

    const wsBase = API_BASE.replace(/^http/, 'ws');
    const ws = new WebSocket(`${wsBase}/messages/ws?token=${token}`);
    wsRef.current = ws;

    let pingInterval: ReturnType<typeof setInterval>;

    ws.onopen = () => {
      pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30_000);
    };

    ws.onmessage = (e) => {
      try {
        const data: WsEvent = JSON.parse(e.data);
        handlerRef.current(data);
      } catch { /* ignore */ }
    };

    ws.onclose = () => {
      clearInterval(pingInterval);
      // Reconnect after 3 s
      setTimeout(connect, 3_000);
    };

    ws.onerror = () => ws.close();
  }, [enabled]);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
    };
  }, [connect]);
}

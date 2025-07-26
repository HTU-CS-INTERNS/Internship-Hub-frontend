'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type WebSocketMessage = {
  type: string;
  payload: any;
};

type WebSocketContextType = {
  send: (type: string, payload: any) => void;
  subscribe: (type: string, callback: (payload: any) => void) => () => void;
  status: 'connected' | 'disconnected';
};

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [status, setStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [listeners, setListeners] = useState<Map<string, Set<(payload: any) => void>>>(new Map());

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    const ws = new WebSocket(`${protocol}${window.location.host}/ws`);

    ws.onopen = () => {
      setStatus('connected');
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        const callbacks = listeners.get(message.type);
        if (callbacks) {
          callbacks.forEach(callback => callback(message.payload));
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      setStatus('disconnected');
      setTimeout(() => {
        setSocket(new WebSocket(`${protocol}${window.location.host}/ws`));
      }, 5000);
    };

    return () => {
      ws.close();
    };
  }, [listeners]);

  const send = (type: string, payload: any) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type, payload }));
    }
  };

  const subscribe = (type: string, callback: (payload: any) => void) => {
    setListeners(prev => {
      const newListeners = new Map(prev);
      const callbacks = newListeners.get(type) || new Set();
      callbacks.add(callback);
      newListeners.set(type, callbacks);
      return newListeners;
    });

    return () => {
      setListeners(prev => {
        const newListeners = new Map(prev);
        const callbacks = newListeners.get(type);
        if (callbacks) {
          callbacks.delete(callback);
          if (callbacks.size === 0) {
            newListeners.delete(type);
          }
        }
        return newListeners;
      });
    };
  };

  return (
    <WebSocketContext.Provider value={{ send, subscribe, status }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}
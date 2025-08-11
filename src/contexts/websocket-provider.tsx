'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

type RealtimeMessage = {
  type: string;
  payload: any;
  timestamp: Date;
};

type RealtimeContextType = {
  subscribe: (event: string, callback: (payload: any) => void) => () => void;
  broadcast: (event: string, payload: any) => void;
  status: 'connected' | 'disconnected' | 'connecting';
  messages: RealtimeMessage[];
};

const RealtimeContext = createContext<RealtimeContextType | null>(null);

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const [listeners, setListeners] = useState<Map<string, Set<(payload: any) => void>>>(new Map());
  const [messages, setMessages] = useState<RealtimeMessage[]>([]);

  useEffect(() => {
    setStatus('connecting');

    // Create a channel for real-time communication
    const realtimeChannel = supabase.channel('global-updates', {
      config: {
        broadcast: { self: true },
        presence: { key: 'user-presence' }
      }
    });

    realtimeChannel
      .on('broadcast', { event: '*' }, (payload) => {
        const message: RealtimeMessage = {
          type: payload.event,
          payload: payload.payload,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev.slice(-99), message]); // Keep last 100 messages
        
        // Notify listeners
        const eventListeners = listeners.get(payload.event);
        if (eventListeners) {
          eventListeners.forEach(callback => callback(payload.payload));
        }
      })
      .on('presence', { event: 'sync' }, () => {
        console.log('Presence sync');
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe((status) => {
        setStatus(status === 'SUBSCRIBED' ? 'connected' : 'disconnected');
        if (status === 'SUBSCRIBED') {
          setChannel(realtimeChannel);
        }
      });

    return () => {
      realtimeChannel.unsubscribe();
      setChannel(null);
      setStatus('disconnected');
    };
  }, []);

  const subscribe = (event: string, callback: (payload: any) => void) => {
    setListeners(prev => {
      const newListeners = new Map(prev);
      if (!newListeners.has(event)) {
        newListeners.set(event, new Set());
      }
      newListeners.get(event)!.add(callback);
      return newListeners;
    });

    // Return unsubscribe function
    return () => {
      setListeners(prev => {
        const newListeners = new Map(prev);
        const eventListeners = newListeners.get(event);
        if (eventListeners) {
          eventListeners.delete(callback);
          if (eventListeners.size === 0) {
            newListeners.delete(event);
          }
        }
        return newListeners;
      });
    };
  };

  const broadcast = (event: string, payload: any) => {
    if (channel && status === 'connected') {
      channel.send({
        type: 'broadcast',
        event,
        payload
      });
    }
  };

  const value = {
    subscribe,
    broadcast,
    status,
    messages,
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
}

// Convenience hooks for common real-time events
export function useRealtimeNotifications() {
  const { subscribe } = useRealtime();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = subscribe('notification', (payload) => {
      setNotifications(prev => [payload, ...prev.slice(0, 49)]); // Keep last 50 notifications
    });

    return unsubscribe;
  }, [subscribe]);

  return notifications;
}

export function useRealtimeUserStatus() {
  const { subscribe, broadcast } = useRealtime();
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = subscribe('user-status', (payload) => {
      if (payload.status === 'online') {
        setOnlineUsers(prev => [...new Set([...prev, payload.userId])]);
      } else if (payload.status === 'offline') {
        setOnlineUsers(prev => prev.filter(id => id !== payload.userId));
      }
    });

    return unsubscribe;
  }, [subscribe]);

  const updateStatus = (status: 'online' | 'offline', userId: string) => {
    broadcast('user-status', { status, userId });
  };

  return { onlineUsers, updateStatus };
}
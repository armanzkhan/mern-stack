'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import realtimeNotificationService from '@/services/realtimeNotificationService';

interface RealtimeNotification {
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: string;
  data?: any;
}

interface UseRealtimeNotificationsReturn {
  notifications: RealtimeNotification[];
  isConnected: boolean;
  connectionStatus: {
    isConnected: boolean;
    reconnectAttempts: number;
    maxReconnectAttempts: number;
  };
  clearNotifications: () => void;
  markAsRead: (index: number) => void;
}

export const useRealtimeNotifications = (): UseRealtimeNotificationsReturn => {
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const lastNotificationKeyRef = useRef<string | null>(null);

  const handleNotification = useCallback(async (notification: RealtimeNotification) => {
    const key = `${notification.type}|${notification.title}|${notification.timestamp}`;
    if (lastNotificationKeyRef.current === key) {
      return;
    }
    lastNotificationKeyRef.current = key;

    setNotifications(prev => {
      // Add new notification at the beginning
      const newNotifications = [notification, ...prev];
      return newNotifications.slice(0, 50);
    });

    // Show browser notification if permission is granted and supported
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          tag: notification.type,
          requireInteraction: notification.priority === 'urgent' || notification.priority === 'high'
        });
      } catch (error) {
        console.warn('Browser notification failed:', error);
      }
    }
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const markAsRead = useCallback((index: number) => {
    setNotifications(prev => 
      prev.map((notification, i) => 
        i === index ? { ...notification, read: true } : notification
      )
    );
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // Add notification listener
    realtimeNotificationService.addListener(handleNotification);

    // Connect to WebSocket
    realtimeNotificationService.connect();

    // Check connection status periodically
    const statusInterval = setInterval(() => {
      const status = realtimeNotificationService.getConnectionStatus();
      setIsConnected(prev => (prev === status.isConnected ? prev : status.isConnected));
    }, 10000);

    return () => {
      realtimeNotificationService.removeListener(handleNotification);
      clearInterval(statusInterval);
    };
  }, [handleNotification, isClient]);

  const connectionStatus = realtimeNotificationService.getConnectionStatus();

  return {
    notifications,
    isConnected,
    connectionStatus,
    clearNotifications,
    markAsRead
  };
};

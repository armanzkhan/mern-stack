'use client';

import { useEffect, useState, useCallback } from 'react';
import realtimeNotificationService from '@/services/realtimeNotificationService';

interface RealtimeNotification {
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: string;
  data?: any;
}
import { getAuthHeaders } from '@/lib/auth';

interface User {
  _id: string;
  user_id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
  department?: string;
  company_id: string;
  isActive?: boolean;
  isSuperAdmin?: boolean;
  isCompanyAdmin?: boolean;
  isCustomer?: boolean;
  isManager?: boolean;
  customerProfile?: {
    customer_id: string;
    companyName: string;
    customerType: string;
    assignedManager?: {
      manager_id: string;
      assignedBy: string;
      assignedAt: string;
      isActive: boolean;
    };
    preferences?: {
      preferredCategories: string[];
      notificationPreferences: {
        orderUpdates: boolean;
        statusChanges: boolean;
        newProducts: boolean;
      };
    };
  };
  managerProfile?: {
    manager_id: string;
    assignedCategories: string[];
    managerLevel: string;
    canAssignCategories: boolean;
    notificationPreferences: {
      orderUpdates: boolean;
      stockAlerts: boolean;
      statusChanges: boolean;
      newOrders: boolean;
      lowStock: boolean;
      categoryReports: boolean;
    };
  };
  createdAt?: string;
  updatedAt?: string;
}

interface UseRealtimeUsersReturn {
  users: User[];
  isConnected: boolean;
  refreshUsers: () => Promise<void>;
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  removeUser: (userId: string) => void;
}

export const useRealtimeUsers = (): UseRealtimeUsersReturn => {
  const [users, setUsers] = useState<User[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/users?compact=1', {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(Array.isArray(data) ? data : []);
      } else {
        const errBody = await response.text();
        console.error('❌ Users API error:', response.status, errBody);
        setUsers([]);
        // 401 = not logged in or wrong company; backend filters by logged-in user's company_id
        if (response.status === 401) {
          console.warn('💡 Log in with a user whose company_id matches the users you expect (e.g. RESSICHEM).');
        }
      }
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      setUsers([]);
    }
  }, []);

  // Handle real-time notifications for user updates
  const handleRealtimeNotification = useCallback((notification: RealtimeNotification) => {
    // Check if this is a user-related notification
    if (notification.data?.entityType === 'user') {
      const action = notification.data?.action || 'updated';
      // Refresh users list when user data changes
      fetchUsers();
      
      // Show a toast notification
      if (typeof window !== 'undefined' && 'Notification' in window) {
        try {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico',
            tag: `user_${action}`,
          });
        } catch (error) {
          console.log('Browser notification failed:', error);
        }
      }
    }
    
    // Also handle customer-related notifications since customers are also users
    if (notification.data?.entityType === 'customer') {
      // Refresh users list when customer data changes (since customers are users)
      fetchUsers();
    }
  }, [fetchUsers]);

  // Add user to local state
  const addUser = useCallback((user: User) => {
    setUsers(prev => [user, ...prev]);
  }, []);

  // Update user in local state
  const updateUser = useCallback((updatedUser: User) => {
    setUsers(prev => 
      prev.map(user => 
        user._id === updatedUser._id ? updatedUser : user
      )
    );
  }, []);

  // Remove user from local state
  const removeUser = useCallback((userId: string) => {
    setUsers(prev => prev.filter(user => user._id !== userId));
  }, []);

  // Initialize client-side state
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Set up real-time connection and listeners
  useEffect(() => {
    if (!isClient) return;
    
    // Add notification listener for user updates
    realtimeNotificationService.addListener(handleRealtimeNotification);
    
    // Connect to WebSocket
    realtimeNotificationService.connect();
    
    // Check connection status periodically
    const statusInterval = setInterval(() => {
      const status = realtimeNotificationService.getConnectionStatus();
      setIsConnected(prev => (prev === status.isConnected ? prev : status.isConnected));
    }, 10000);

    // Initial fetch
    fetchUsers();

    return () => {
      realtimeNotificationService.removeListener(handleRealtimeNotification);
      clearInterval(statusInterval);
    };
  }, [isClient, handleRealtimeNotification, fetchUsers]);

  return {
    users,
    isConnected,
    refreshUsers: fetchUsers,
    addUser,
    updateUser,
    removeUser
  };
};

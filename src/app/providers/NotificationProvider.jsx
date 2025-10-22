import React, { useCallback, useEffect, useState } from 'react';
import { apiClient } from '../../features/shared/lib/apiClient';
import { toast } from '../../features/shared/lib/toast';
import { useAuth } from './AuthProvider';
import { NotificationContext } from './NotificationContext';

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch notifications
  const fetchNotifications = useCallback(
    async (page = 1, limit = 10) => {
      if (!user) return;
      try {
        setLoading(true);
        const response = await apiClient.get(
          `/api/notifications?page=${page}&limit=${limit}`
        );
        if (response.success) {
          setNotifications(response.data.notifications);
          return response.data;
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const response = await apiClient.get('/api/notifications/unread-count');
      if (response.success) {
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
      // Silent error handling - no toasts, no redirects
    }
  }, [user]);

  // Mark notification as read
  const markAsRead = async id => {
    try {
      const response = await apiClient.put(`/api/notifications/${id}/read`);
      if (response.success) {
        setNotifications(prev =>
          prev.map(notification =>
            notification.id === id
              ? {
                  ...notification,
                  read: true,
                  readAt: new Date().toISOString(),
                }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        return response.data.notification;
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const response = await apiClient.put('/api/notifications/read-all');
      if (response.success) {
        setNotifications(prev =>
          prev.map(notification => ({
            ...notification,
            read: true,
            readAt: new Date().toISOString(),
          }))
        );
        setUnreadCount(0);
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  // Delete notification
  const deleteNotification = async id => {
    try {
      const response = await apiClient.delete(`/api/notifications/${id}`);
      if (response.success) {
        setNotifications(prev =>
          prev.filter(notification => notification.id !== id)
        );
        // Update unread count if the deleted notification was unread
        const deletedNotification = notifications.find(n => n.id === id);
        if (deletedNotification && !deletedNotification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        toast.success('Notification deleted');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  // Delete all notifications
  const deleteAllNotifications = async () => {
    try {
      const response = await apiClient.delete('/api/notifications');
      if (response.success) {
        setNotifications([]);
        setUnreadCount(0);
        toast.success('All notifications deleted');
      }
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      toast.error('Failed to delete all notifications');
    }
  };

  // Poll for unread count and fetch notifications periodically
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    fetchUnreadCount();
    fetchNotifications(1, 5); // Fetch first 5 notifications for bell dropdown
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      fetchUnreadCount();
      fetchNotifications(1, 5); // Refresh notifications every 30 seconds
    }, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [user]);

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

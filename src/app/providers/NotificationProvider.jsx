import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../../features/shared/lib/apiClient';
import { toast } from 'sonner';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider'
    );
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch notifications
  const fetchNotifications = async (page = 1, limit = 10) => {
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
      toast.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const response = await apiClient.get('/api/notifications/unread-count');
      if (response.success) {
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

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

  // Poll for unread count periodically
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

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

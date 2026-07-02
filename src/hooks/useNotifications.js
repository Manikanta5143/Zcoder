import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from './useAuthContext';

export const useNotifications = () => {
  const { user, isAuthenticated } = useAuthContext();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated || !user || !user._id) return;
    try {
      const response = await fetch(`/api/notifications/${user._id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      const data = await response.json();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (err) {
      setError(err.message);
    }
  }, [user, isAuthenticated]);

  const markAllAsRead = async () => {
    if (!isAuthenticated || !user || !user._id) return;
    try {
      const response = await fetch(`/api/notifications/${user._id}/read`, {
        method: 'PUT',
      });
      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Failed to mark notifications as read', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user && user._id) {
      setLoading(true);
      fetchNotifications().finally(() => setLoading(false));

      // Poll notifications every 30 seconds for live updates
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, isAuthenticated, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAllAsRead,
    refreshNotifications: fetchNotifications
  };
};

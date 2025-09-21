import { useState, useCallback } from 'react';
import api from '../api';


export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationAnchor, setNotificationAnchor] = useState(null);

  const loadNotifications = useCallback(async () => {
    try {
      const response = await api.get("notifications/");
      const notificationsData = response.data?.data || response.data;
      const validNotifications = Array.isArray(notificationsData) ? notificationsData : [];
      setNotifications(validNotifications);
      const unreadAmount = validNotifications.filter(notification => !notification.read).length;
      setUnreadCount(unreadAmount);
    } catch (error) {
      console.error("Error loading notifications:", error);
      setNotifications([]);
      setUnreadCount(0);
    }
  }, []);

  const handleNotificationClick = useCallback(async (event) => {
    setNotificationAnchor(event.currentTarget);

    try {
      const response = await api.get("notifications/");
      const notificationsData = response.data?.data || response.data;
      const freshNotifications = Array.isArray(notificationsData) ? notificationsData : [];
      const unreadNotifications = freshNotifications.filter(notification => !notification.read);

      if (unreadNotifications.length > 0) {
        await Promise.all(
          unreadNotifications.map(notification =>
            api.patch(`notifications/${notification.id}/`, { read: true })
          )
        );
        await loadNotifications();
      }
    } catch (error) {

    }
  }, [loadNotifications]);

  const handleNotificationClose = useCallback(() => {
    setNotificationAnchor(null);
  }, []);

  const markNotificationAsRead = useCallback(async (notificationId) => {
    try {
      await api.patch(`notifications/${notificationId}/`, { read: true });
      await loadNotifications();
    } catch (error) {

    }
  }, [loadNotifications]);

  return {
    notifications,
    unreadCount,
    notificationAnchor,
    loadNotifications,
    handleNotificationClick,
    handleNotificationClose,
    markNotificationAsRead
  };
};
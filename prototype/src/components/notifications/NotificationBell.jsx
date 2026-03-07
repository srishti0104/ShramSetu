/**
 * Notification Bell Component
 * 
 * @fileoverview Shows notification count and dropdown with recent notifications
 */

import { useState, useEffect } from 'react';
import notificationService from '../../services/notificationService';
import './NotificationBell.css';

/**
 * Notification Bell Component
 */
export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Initial load
    setUnreadCount(notificationService.getUnreadCount());
    setNotifications(notificationService.getNotifications({ limit: 10 }));

    // Subscribe to updates
    const unsubscribe = notificationService.subscribe((data) => {
      setUnreadCount(data.unreadCount);
      setNotifications(notificationService.getNotifications({ limit: 10 }));
    });

    return unsubscribe;
  }, []);

  /**
   * Handle notification click
   */
  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      notificationService.markAsRead(notification.id);
    }
    
    // Handle navigation based on notification type
    if (notification.type === 'job_application') {
      // In real app, navigate to applications page
      console.log('Navigate to application:', notification.data.applicationId);
    }
    
    setIsOpen(false);
  };

  /**
   * Mark all as read
   */
  const handleMarkAllRead = () => {
    notificationService.markAllAsRead();
  };

  /**
   * Format time ago
   */
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="notification-bell">
      <button
        className="notification-bell__button"
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-bell__badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="notification-bell__overlay" 
            onClick={() => setIsOpen(false)}
          />
          <div className="notification-bell__dropdown">
            <div className="notification-bell__header">
              <h3>Notifications</h3>
              {unreadCount > 0 && (
                <button
                  className="notification-bell__mark-all"
                  onClick={handleMarkAllRead}
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="notification-bell__list">
              {notifications.length === 0 ? (
                <div className="notification-bell__empty">
                  <div className="empty-icon">🔕</div>
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`notification-item ${
                      !notification.isRead ? 'notification-item--unread' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="notification-item__icon">
                      {notification.type === 'job_application' ? '📋' : '🔔'}
                    </div>
                    <div className="notification-item__content">
                      <h4 className="notification-item__title">
                        {notification.title}
                      </h4>
                      <p className="notification-item__message">
                        {notification.message}
                      </p>
                      <span className="notification-item__time">
                        {formatTimeAgo(notification.timestamp)}
                      </span>
                    </div>
                    {!notification.isRead && (
                      <div className="notification-item__unread-dot" />
                    )}
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="notification-bell__footer">
                <button
                  className="notification-bell__view-all"
                  onClick={() => {
                    setIsOpen(false);
                    // In real app, navigate to full notifications page
                    console.log('Navigate to all notifications');
                  }}
                >
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
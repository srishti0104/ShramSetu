/**
 * Notification Service
 * 
 * Handles in-app notifications and alerts
 */

class NotificationService {
  constructor() {
    this.notifications = [];
    this.listeners = [];
    this.unreadCount = 0;
    
    // Load notifications from localStorage
    this.loadNotifications();
  }

  /**
   * Add a new notification
   * @param {Object} notification - Notification data
   */
  addNotification(notification) {
    const newNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      isRead: false,
      ...notification
    };

    this.notifications.unshift(newNotification);
    this.unreadCount++;
    
    // Keep only last 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }

    this.saveNotifications();
    this.notifyListeners();

    console.log('🔔 New notification added:', newNotification);
    return newNotification;
  }

  /**
   * Create job application notification
   * @param {Object} applicationData - Application data
   */
  createJobApplicationNotification(applicationData) {
    const notification = {
      type: 'job_application',
      title: 'New Job Application',
      message: `${applicationData.applicantProfile.name} applied for ${applicationData.jobDetails.title}`,
      data: {
        applicationId: applicationData.applicationId,
        jobId: applicationData.jobId,
        applicantName: applicationData.applicantProfile.name,
        jobTitle: applicationData.jobDetails.title,
        location: applicationData.jobDetails.location
      },
      priority: 'high',
      category: 'applications'
    };

    return this.addNotification(notification);
  }

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   */
  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification && !notification.isRead) {
      notification.isRead = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
      this.saveNotifications();
      this.notifyListeners();
    }
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead() {
    this.notifications.forEach(notification => {
      notification.isRead = true;
    });
    this.unreadCount = 0;
    this.saveNotifications();
    this.notifyListeners();
  }

  /**
   * Get all notifications
   * @param {Object} options - Filter options
   * @returns {Array} Notifications
   */
  getNotifications(options = {}) {
    let filtered = [...this.notifications];

    if (options.category) {
      filtered = filtered.filter(n => n.category === options.category);
    }

    if (options.unreadOnly) {
      filtered = filtered.filter(n => !n.isRead);
    }

    if (options.limit) {
      filtered = filtered.slice(0, options.limit);
    }

    return filtered;
  }

  /**
   * Get unread count
   * @returns {number} Unread count
   */
  getUnreadCount() {
    return this.unreadCount;
  }

  /**
   * Subscribe to notification updates
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners
   */
  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback({
          notifications: this.notifications,
          unreadCount: this.unreadCount
        });
      } catch (error) {
        console.error('Error in notification listener:', error);
      }
    });
  }

  /**
   * Clear all notifications
   */
  clearAll() {
    this.notifications = [];
    this.unreadCount = 0;
    this.saveNotifications();
    this.notifyListeners();
  }

  /**
   * Remove specific notification
   * @param {string} notificationId - Notification ID
   */
  removeNotification(notificationId) {
    const index = this.notifications.findIndex(n => n.id === notificationId);
    if (index > -1) {
      const notification = this.notifications[index];
      if (!notification.isRead) {
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      }
      this.notifications.splice(index, 1);
      this.saveNotifications();
      this.notifyListeners();
    }
  }

  /**
   * Save notifications to localStorage
   */
  saveNotifications() {
    try {
      const data = {
        notifications: this.notifications,
        unreadCount: this.unreadCount,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('shram_setu_notifications', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  }

  /**
   * Load notifications from localStorage
   */
  loadNotifications() {
    try {
      const saved = localStorage.getItem('shram_setu_notifications');
      if (saved) {
        const data = JSON.parse(saved);
        this.notifications = data.notifications || [];
        this.unreadCount = data.unreadCount || 0;
        
        // Recalculate unread count to ensure accuracy
        this.unreadCount = this.notifications.filter(n => !n.isRead).length;
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      this.notifications = [];
      this.unreadCount = 0;
    }
  }

  /**
   * Show browser notification (if permission granted)
   * @param {Object} notification - Notification data
   */
  showBrowserNotification(notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id
      });
    }
  }

  /**
   * Request browser notification permission
   */
  async requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }
}

export default new NotificationService();
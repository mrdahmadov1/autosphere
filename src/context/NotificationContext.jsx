import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';

// Generate unique IDs for notifications
const generateId = () => `notification-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
};

// Create notification context
export const NotificationContext = createContext();

// Use notification hook
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  // Create a notification
  const addNotification = useCallback(
    (message, type = NOTIFICATION_TYPES.INFO, duration = 5000) => {
      const id = generateId();

      setNotifications((prev) => [
        ...prev,
        {
          id,
          message,
          type,
          duration,
          createdAt: Date.now(),
        },
      ]);

      return id;
    },
    []
  );

  // Remove a notification by ID
  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);

  // Shorthand methods for different notification types
  const success = useCallback(
    (message, duration) => {
      return addNotification(message, NOTIFICATION_TYPES.SUCCESS, duration);
    },
    [addNotification]
  );

  const error = useCallback(
    (message, duration) => {
      return addNotification(message, NOTIFICATION_TYPES.ERROR, duration);
    },
    [addNotification]
  );

  const info = useCallback(
    (message, duration) => {
      return addNotification(message, NOTIFICATION_TYPES.INFO, duration);
    },
    [addNotification]
  );

  const warning = useCallback(
    (message, duration) => {
      return addNotification(message, NOTIFICATION_TYPES.WARNING, duration);
    },
    [addNotification]
  );

  // Auto-remove notifications after their duration
  useEffect(() => {
    if (notifications.length === 0) return;

    const timeouts = notifications.map((notification) => {
      return setTimeout(() => {
        removeNotification(notification.id);
      }, notification.duration);
    });

    // Clean up timeouts on unmount
    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [notifications, removeNotification]);

  // Notification component
  const Notification = ({ notification }) => {
    const { id, message, type } = notification;

    // Define styling based on notification type
    const getTypeStyles = () => {
      switch (type) {
        case NOTIFICATION_TYPES.SUCCESS:
          return 'bg-green-100 border-green-400 text-green-700';
        case NOTIFICATION_TYPES.ERROR:
          return 'bg-red-100 border-red-400 text-red-700';
        case NOTIFICATION_TYPES.WARNING:
          return 'bg-yellow-100 border-yellow-400 text-yellow-700';
        case NOTIFICATION_TYPES.INFO:
        default:
          return 'bg-blue-100 border-blue-400 text-blue-700';
      }
    };

    return (
      <div
        className={`flex justify-between items-center ${getTypeStyles()} p-4 mb-3 rounded-lg border shadow-sm`}
        role="alert"
      >
        <span>{message}</span>
        <button
          onClick={() => removeNotification(id)}
          className="ml-4 text-current opacity-70 hover:opacity-100 focus:outline-none"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    );
  };

  // Notifications container
  const NotificationsContainer = () => {
    if (notifications.length === 0) return null;

    return (
      <div className="fixed top-6 right-6 z-50 w-full max-w-sm flex flex-col items-end">
        {notifications.map((notification) => (
          <Notification key={notification.id} notification={notification} />
        ))}
      </div>
    );
  };

  const value = {
    addNotification,
    removeNotification,
    success,
    error,
    info,
    warning,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationsContainer />
    </NotificationContext.Provider>
  );
}

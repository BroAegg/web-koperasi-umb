import { useState, useCallback } from 'react';
import { NotificationProps } from '@/components/ui/toast';

export const useToast = () => {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  const addNotification = useCallback((notification: Omit<NotificationProps, 'id' | 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: NotificationProps = {
      ...notification,
      id,
      onClose: () => {},
    };
    
    // Clear existing notifications and show new one
    setNotifications([newNotification]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const success = useCallback((title: string, message: string) => {
    addNotification({ type: 'success', title, message, duration: 2500 });
  }, [addNotification]);

  const error = useCallback((title: string, message: string) => {
    addNotification({ type: 'error', title, message, duration: 4000 });
  }, [addNotification]);

  const warning = useCallback((title: string, message: string) => {
    addNotification({ type: 'warning', title, message, duration: 3500 });
  }, [addNotification]);

  return {
    notifications,
    toasts: notifications, // Keep for backward compatibility
    addNotification,
    removeNotification,
    removeToast: removeNotification, // Keep for backward compatibility
    success,
    error,
    warning,
  };
};
"use client";

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export interface NotificationProps {
  id: string;
  type: 'success' | 'error' | 'warning';
  title: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

export const Notification = ({ id, type, title, message, duration = 2000, onClose }: NotificationProps) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
      // Wait for animation to complete before calling onClose
      setTimeout(() => onClose(id), 300);
    }, duration);

    return () => clearTimeout(exitTimer);
  }, [id, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-yellow-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 ${isExiting ? 'animate-slide-out-right' : 'animate-slide-in-right'}`}>
      <div className={`${getBgColor()} border rounded-lg shadow-lg p-4 max-w-sm w-full min-w-[320px]`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              {title}
            </h4>
            <p className="text-sm text-gray-600">
              {message}
            </p>
          </div>
          <button
            onClick={() => onClose(id)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const NotificationContainer = ({ notifications, onClose }: { 
  notifications: NotificationProps[], 
  onClose: (id: string) => void 
}) => {
  // Only show the latest notification
  const latestNotification = notifications[notifications.length - 1];
  
  if (!latestNotification) return null;

  return <Notification {...latestNotification} onClose={onClose} />;
};

// Keep the old exports for backward compatibility
export const Toast = Notification;
export const ToastContainer = NotificationContainer;
export type ToastProps = NotificationProps;
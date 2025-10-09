"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { NotificationContainer, NotificationProps } from '@/components/ui/toast';
import { ConfirmationDialog, ConfirmationDialogProps } from '@/components/ui/confirmation-dialog';

interface ConfirmationOptions {
  title: string;
  message: string;
  type?: 'danger' | 'warning' | 'info';
  confirmText?: string;
  cancelText?: string;
}

interface NotificationContextType {
  success: (title: string, message: string) => void;
  error: (title: string, message: string) => void;
  warning: (title: string, message: string) => void;
  info: (title: string, message: string) => void;
  confirm: (options: ConfirmationOptions) => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);
  const [confirmationState, setConfirmationState] = useState<{
    isOpen: boolean;
    options: ConfirmationOptions;
    resolver: ((value: boolean) => void) | null;
  }>({
    isOpen: false,
    options: { title: '', message: '' },
    resolver: null,
  });

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
    addNotification({ 
      type: 'success', 
      title, 
      message, 
      duration: 2500 
    });
  }, [addNotification]);

  const error = useCallback((title: string, message: string) => {
    addNotification({ 
      type: 'error', 
      title, 
      message, 
      duration: 4000 
    });
  }, [addNotification]);

  const warning = useCallback((title: string, message: string) => {
    addNotification({ 
      type: 'warning', 
      title, 
      message, 
      duration: 3500 
    });
  }, [addNotification]);

  const info = useCallback((title: string, message: string) => {
    addNotification({ 
      type: 'warning', // Using warning style for info
      title, 
      message, 
      duration: 3000 
    });
  }, [addNotification]);

  const confirm = useCallback((options: ConfirmationOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmationState({
        isOpen: true,
        options,
        resolver: resolve,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (confirmationState.resolver) {
      confirmationState.resolver(true);
    }
    setConfirmationState({
      isOpen: false,
      options: { title: '', message: '' },
      resolver: null,
    });
  }, [confirmationState.resolver]);

  const handleCancel = useCallback(() => {
    if (confirmationState.resolver) {
      confirmationState.resolver(false);
    }
    setConfirmationState({
      isOpen: false,
      options: { title: '', message: '' },
      resolver: null,
    });
  }, [confirmationState.resolver]);

  const contextValue: NotificationContextType = {
    success,
    error,
    warning,
    info,
    confirm,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <NotificationContainer 
        notifications={notifications} 
        onClose={removeNotification} 
      />
      <ConfirmationDialog
        isOpen={confirmationState.isOpen}
        title={confirmationState.options.title}
        message={confirmationState.options.message}
        type={confirmationState.options.type}
        confirmText={confirmationState.options.confirmText}
        cancelText={confirmationState.options.cancelText}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
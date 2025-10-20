/**
 * LoadingSpinner Component
 * Consistent loading state for supplier pages
 */

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md',
  message = 'Loading...',
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-12 h-12 border-2',
    lg: 'w-16 h-16 border-3',
  };

  const containerClasses = fullScreen 
    ? 'flex items-center justify-center min-h-screen'
    : 'flex items-center justify-center py-12';

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div className={`animate-spin rounded-full border-b-blue-600 border-gray-200 mx-auto ${sizeClasses[size]}`} />
        {message && <p className="mt-4 text-gray-600">{message}</p>}
      </div>
    </div>
  );
};

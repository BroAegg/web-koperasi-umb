/**
 * StatusBadge Component
 * Reusable status badge with consistent styling
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatusBadgeProps {
  label: string;
  color: string;
  icon: LucideIcon;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  label, 
  color, 
  icon: Icon,
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <span 
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${color} ${sizeClasses[size]}`}
    >
      <Icon className={iconSizes[size]} />
      {label}
    </span>
  );
};

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
              <Icon className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {title}
          </h3>
          <p className="text-gray-600 mb-6">
            {description}
          </p>
          {(actionLabel || secondaryActionLabel) && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {actionLabel && onAction && (
                <Button onClick={onAction} className="w-full sm:w-auto">
                  {actionLabel}
                </Button>
              )}
              {secondaryActionLabel && onSecondaryAction && (
                <Button onClick={onSecondaryAction} variant="outline" className="w-full sm:w-auto">
                  {secondaryActionLabel}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function InlineEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: Omit<EmptyStateProps, 'secondaryActionLabel' | 'onSecondaryAction'>) {
  return (
    <div className="text-center py-12 px-6">
      <div className="flex justify-center mb-4">
        <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
          <Icon className="h-6 w-6 text-gray-400" />
        </div>
      </div>
      <h4 className="text-sm font-medium text-gray-900 mb-1">
        {title}
      </h4>
      <p className="text-sm text-gray-600 mb-4">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" variant="outline">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function TableEmptyState({
  icon: Icon,
  message,
}: {
  icon: LucideIcon;
  message: string;
}) {
  return (
    <div className="text-center py-12">
      <Icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600">{message}</p>
    </div>
  );
}

"use client";

import * as React from "react";
import { HelpCircle, Info, X } from "lucide-react";

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
  icon?: "help" | "info";
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function Tooltip({ 
  content, 
  children, 
  icon = "help",
  position = "top",
  className = ""
}: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2"
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent",
    left: "left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent",
    right: "right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent"
  };

  const IconComponent = icon === "help" ? HelpCircle : Info;

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {children || (
        <button
          type="button"
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
          onFocus={() => setIsVisible(true)}
          onBlur={() => setIsVisible(false)}
          onClick={(e) => {
            e.preventDefault();
            setIsVisible(!isVisible);
          }}
          className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded-full"
          aria-label="Help"
        >
          <IconComponent className="w-4 h-4" />
        </button>
      )}
      
      {isVisible && (
        <>
          <div
            className={`absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap max-w-xs ${positionClasses[position]}`}
            role="tooltip"
          >
            {content}
            <div
              className={`absolute w-0 h-0 border-4 border-gray-900 ${arrowClasses[position]}`}
            />
          </div>
          {/* Backdrop for mobile to close on tap outside */}
          <div
            className="fixed inset-0 z-40 md:hidden"
            onClick={() => setIsVisible(false)}
          />
        </>
      )}
    </div>
  );
}

interface InfoBannerProps {
  title: string;
  message: string;
  type?: "info" | "warning" | "success" | "tip";
  icon?: React.ReactNode;
  onDismiss?: () => void;
}

export function InfoBanner({ 
  title, 
  message, 
  type = "info",
  icon,
  onDismiss 
}: InfoBannerProps) {
  const [isVisible, setIsVisible] = React.useState(true);

  if (!isVisible) return null;

  const typeStyles = {
    info: "bg-blue-50 border-blue-200 text-blue-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    success: "bg-green-50 border-green-200 text-green-800",
    tip: "bg-purple-50 border-purple-200 text-purple-800"
  };

  const typeIcons = {
    info: <Info className="w-5 h-5" />,
    warning: <HelpCircle className="w-5 h-5" />,
    success: <Info className="w-5 h-5" />,
    tip: <HelpCircle className="w-5 h-5" />
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border-2 ${typeStyles[type]}`}>
      <div className="flex-shrink-0 mt-0.5">
        {icon || typeIcons[type]}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm mb-1">{title}</h4>
        <p className="text-sm opacity-90">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

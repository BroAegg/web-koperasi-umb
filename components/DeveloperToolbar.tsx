"use client";

import React from 'react';
import { useDeveloper } from '@/contexts/DeveloperContext';
import { usePathname } from 'next/navigation';

/**
 * Minimal Developer Badge
 * Shows a subtle indicator in the top-right corner
 * Clean, doesn't interfere with existing UI
 */
export function DeveloperToolbar() {
  const { isDeveloper, isProduction, activeRole } = useDeveloper();
  const pathname = usePathname();

  // Don't show if not a developer
  if (!isDeveloper) {
    return null;
  }

  // Don't show on login page or non-koperasi pages
  if (!pathname?.startsWith('/koperasi')) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
      {/* Active Role Badge */}
      <div className="bg-blue-600 text-white px-3 py-1.5 rounded-lg shadow-lg text-xs font-medium flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
        <span>Role: {activeRole}</span>
      </div>

      {/* Environment Badge */}
      <div
        className={`px-3 py-1.5 rounded-lg shadow-lg text-xs font-bold ${
          isProduction
            ? 'bg-red-600 text-white'
            : 'bg-green-600 text-white'
        }`}
      >
        {isProduction ? '🔴 PROD' : '🟢 DEV'}
      </div>
    </div>
  );
}

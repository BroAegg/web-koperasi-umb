"use client";

import React from 'react';
import { useDeveloper } from '@/contexts/DeveloperContext';
import { Wrench, Activity, Database, Code, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Persistent Developer Toolbar
 * Floats at the top of the screen when user is a developer
 * Shows current role, environment mode, and quick access to dev tools
 * Visible regardless of active role
 */
export function DeveloperToolbar() {
  const { isDeveloper, isProduction, activeRole, developerSession } = useDeveloper();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const pathname = usePathname();

  // Don't show if not a developer
  if (!isDeveloper) {
    return null;
  }

  // Don't show on login page or non-koperasi pages
  if (!pathname?.startsWith('/koperasi')) {
    return null;
  }

  const quickLinks = [
    {
      name: 'Dev Dashboard',
      href: '/koperasi/developer-dashboard',
      icon: Wrench,
    },
    {
      name: 'Activity Logs',
      href: '/koperasi/developer/activity-logs',
      icon: Activity,
    },
    {
      name: 'Data Management',
      href: '/koperasi/developer/data-management',
      icon: Database,
    },
    {
      name: 'API Tester',
      href: '/koperasi/developer/api-tester',
      icon: Code,
    },
  ];

  return (
    <>
      {/* Fixed Toolbar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg">
        {/* Compact Header - Always Visible */}
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Developer Badge */}
            <div className="flex items-center space-x-2">
              <Wrench className="w-4 h-4 text-white" />
              <span className="text-white font-semibold text-sm">Developer Mode</span>
            </div>

            {/* Role Badge */}
            <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              <span className="text-white text-xs font-medium">
                Active Role: <span className="font-bold">{activeRole}</span>
              </span>
            </div>

            {/* Environment Badge */}
            <div
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                isProduction
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-green-500 text-white'
              }`}
            >
              {isProduction ? '🔴 PRODUCTION' : '🟢 DEVELOPMENT'}
            </div>
          </div>

          {/* Expand/Collapse Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
            title={isExpanded ? 'Collapse' : 'Expand Quick Links'}
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Expanded Quick Links */}
        {isExpanded && (
          <div className="border-t border-white/20 bg-white/10 backdrop-blur-sm px-4 py-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                      isActive
                        ? 'bg-white text-indigo-600 shadow-md'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{link.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Session Info */}
            {developerSession && (
              <div className="mt-3 pt-3 border-t border-white/20">
                <div className="text-xs text-white/80">
                  Actual Role: DEVELOPER | Switched at:{' '}
                  {new Date(developerSession.switchedAt).toLocaleTimeString('id-ID')}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Spacer to prevent content from being hidden under fixed toolbar */}
      <div className={isExpanded ? 'h-32' : 'h-12'} />
    </>
  );
}

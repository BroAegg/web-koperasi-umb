"use client";

import { ThemeProvider } from '@/contexts/ThemeContext';
import { SessionProvider } from 'next-auth/react';

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
          {children}
        </div>
      </ThemeProvider>
    </SessionProvider>
  );
}

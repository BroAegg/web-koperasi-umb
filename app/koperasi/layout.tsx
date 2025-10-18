"use client";
import { NotificationProvider } from '@/lib/notification-context';

export default function KoperasiLayout({ children }: { children: React.ReactNode }) {
  // Parent layout - no auth check here
  // Each child route (/admin, /super-admin, /supplier) has its own layout with auth
  return (
    <NotificationProvider>
      {children}
    </NotificationProvider>
  );
}

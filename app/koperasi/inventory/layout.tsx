"use client";

import { useAuth } from "@/lib/use-auth";

// Define required roles as constant to prevent re-creation
const INVENTORY_REQUIRED_ROLES = ["SUPER_ADMIN", "ADMIN", "KASIR"];

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, authorized } = useAuth(INVENTORY_REQUIRED_ROLES);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}

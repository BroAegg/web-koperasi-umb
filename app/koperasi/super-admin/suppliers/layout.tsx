"use client";

import { useAuth } from "@/lib/use-auth";

export default function SuppliersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, authorized } = useAuth(["SUPER_ADMIN"]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!authorized) {
    return null; // useAuth hook already redirects
  }

  return <>{children}</>;
}

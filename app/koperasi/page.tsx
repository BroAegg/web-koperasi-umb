"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/use-auth";

export default function KoperasiHomePage() {
  const router = useRouter();
  const { user, loading } = useAuth(["ADMIN", "SUPER_ADMIN"]);

  useEffect(() => {
    if (!loading && user) {
      // Redirect to dashboard
      router.push("/koperasi/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return null;
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

interface User {
  id: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "ADMIN" | "SUPPLIER" | "USER" | "DEVELOPER";
}

export function useAuth(requiredRole?: string[]) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Wait for session to load
    if (status === "loading") {
      setLoading(true);
      return;
    }

    // Not authenticated
    if (status === "unauthenticated" || !session?.user) {
      router.push("/login");
      setLoading(false);
      return;
    }

    // Session loaded successfully
    if (status === "authenticated" && session?.user) {
      const userData: User = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role as any,
      };
      
      setUser(userData);

      // Check role authorization
      if (requiredRole && requiredRole.length > 0) {
        if (requiredRole.includes(userData.role)) {
          setAuthorized(true);
        } else {
          // Redirect based on role
          if (userData.role === "SUPPLIER") {
            router.push("/koperasi/supplier");
          } else if (userData.role === "ADMIN" || userData.role === "SUPER_ADMIN") {
            router.push("/koperasi/dashboard");
          } else if (userData.role === "DEVELOPER") {
            router.push("/koperasi/developer-dashboard");
          } else {
            router.push("/koperasi/dashboard");
          }
        }
      } else {
        setAuthorized(true);
      }
      
      setLoading(false);
    }
  }, [session, status]);

  const logout = async () => {
    console.log('[useAuth] Logging out...');
    await signOut({ redirect: true, callbackUrl: "/login" });
  };

  return { user, loading, authorized, logout };
}

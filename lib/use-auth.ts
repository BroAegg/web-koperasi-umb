"use client";

import { useEffect, useState, useMemo } from "react";
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

  // Stabilize requiredRole array to prevent infinite loops
  const requiredRoleKey = useMemo(() => {
    return requiredRole ? requiredRole.sort().join(',') : '';
  }, [requiredRole?.join(',')]);

  useEffect(() => {
    // Wait for session to load
    if (status === "loading") {
      setLoading(true);
      return;
    }

    // Not authenticated - redirect to login
    if (status === "unauthenticated" || !session?.user) {
      setLoading(false);
      setAuthorized(false);
      router.push("/login");
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
      
      // Only update user state if it actually changed
      setUser(prevUser => {
        if (prevUser?.id === userData.id && prevUser?.role === userData.role) {
          return prevUser;
        }
        return userData;
      });

      // Check role authorization
      if (requiredRole && requiredRole.length > 0) {
        const isAuthorized = requiredRole.includes(userData.role);
        setAuthorized(isAuthorized);
        
        if (!isAuthorized) {
          // Redirect based on user role
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
  }, [session, status, router, requiredRoleKey]);

  const logout = async () => {
    await signOut({ redirect: true, callbackUrl: "/login" });
  };

  return { user, loading, authorized, logout };
}

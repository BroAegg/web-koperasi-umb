"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "ADMIN" | "KASIR" | "SUPPLIER" | "USER" | "DEVELOPER";
}

export function useAuth(requiredRole?: string[]) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  
  // Store requiredRole in ref to prevent mutation issues
  // Initialize once and never update to prevent mutation from external sources
  const requiredRoleRef = useRef<string[] | undefined>(undefined);
  
  // Only set ref on first render
  if (requiredRoleRef.current === undefined && requiredRole) {
    requiredRoleRef.current = [...requiredRole];
  }

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
      const currentRequiredRoles = requiredRoleRef.current;
      if (currentRequiredRoles && currentRequiredRoles.length > 0) {
        const isAuthorized = currentRequiredRoles.includes(userData.role);
        
        setAuthorized(isAuthorized);
        
        if (!isAuthorized) {
          // Redirect to unauthorized page instead of role-specific pages
          router.push("/unauthorized");
        }
      } else {
        setAuthorized(true);
      }
      
      setLoading(false);
    }
  }, [session, status, router]);

  const logout = async () => {
    await signOut({ redirect: true, callbackUrl: "/login" });
  };

  return { user, loading, authorized, logout };
}

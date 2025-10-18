"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "ADMIN" | "SUPPLIER" | "USER";
}

export function useAuth(requiredRole?: string[]) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    // Prevent multiple fetches
    if (hasFetched.current) {
      return;
    }
    
    hasFetched.current = true;
    
    const token = localStorage.getItem("token");
    
    if (!token) {
      router.push("/login");
      setLoading(false);
      return;
    }

    // Fetch current user
    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        console.log('Auth me response:', data); // Debug log
        
        if (data.success && data.data) {
          setUser(data.data);
          
          // Check role authorization
          if (requiredRole && requiredRole.length > 0) {
            if (requiredRole.includes(data.data.role)) {
              setAuthorized(true);
            } else {
              // Redirect based on role to unified dashboard
              if (data.data.role === "SUPPLIER") {
                router.push("/koperasi/supplier");
              } else if (data.data.role === "ADMIN" || data.data.role === "SUPER_ADMIN") {
                router.push("/koperasi/dashboard");
              } else {
                router.push("/koperasi/dashboard");
              }
            }
          } else {
            setAuthorized(true);
          }
        } else {
          console.error('Auth failed:', data);
          localStorage.removeItem("token");
          router.push("/login");
        }
      })
      .catch((err) => {
        console.error('Auth error:', err);
        localStorage.removeItem("token");
        router.push("/login");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []); // Empty dependency array - only run once

  const logout = () => {
    console.log('[useAuth] Logging out...');
    localStorage.removeItem("token");
    // Use hard navigation for logout to ensure clean state
    window.location.href = "/login";
  };

  return { user, loading, authorized, logout };
}

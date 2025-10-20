"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

/**
 * Developer Session Interface
 * Tracks current developer mode state globally across the app
 */
interface DeveloperSession {
  actualRole: 'DEVELOPER';
  activeRole: 'ADMIN' | 'SUPER_ADMIN' | 'SUPPLIER' | 'USER' | 'DEVELOPER';
  isProduction: boolean;
  switchedAt: string;
}

interface DeveloperContextType {
  developerSession: DeveloperSession | null;
  isProduction: boolean;
  activeRole: string | null;
  isDeveloper: boolean;
  updateSession: (session: DeveloperSession) => void;
  clearSession: () => void;
}

const DeveloperContext = createContext<DeveloperContextType | undefined>(undefined);

interface DeveloperProviderProps {
  children: ReactNode;
}

/**
 * Developer Context Provider
 * Provides global state management for developer mode across the entire app
 * 
 * Usage:
 * - Wrap your app with <DeveloperProvider>
 * - Access state with useDeveloper() hook
 * - Automatically syncs with JWT token from localStorage
 */
export function DeveloperProvider({ children }: DeveloperProviderProps) {
  const [developerSession, setDeveloperSession] = useState<DeveloperSession | null>(null);
  const [isProduction, setIsProduction] = useState<boolean>(true);
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [isDeveloper, setIsDeveloper] = useState<boolean>(false);

  // Decode JWT token and extract developer session
  const decodeToken = (token: string): DeveloperSession | null => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.developerSession || null;
    } catch (error) {
      console.error('[DeveloperContext] Failed to decode token:', error);
      return null;
    }
  };

  // Initialize session from localStorage token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setDeveloperSession(null);
      setIsProduction(true);
      setActiveRole(null);
      setIsDeveloper(false);
      return;
    }

    const session = decodeToken(token);
    if (session) {
      setDeveloperSession(session);
      setIsProduction(session.isProduction);
      setActiveRole(session.activeRole);
      setIsDeveloper(session.actualRole === 'DEVELOPER');
    }
  }, []);

  // Listen for token changes (e.g., after role switch or env toggle)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' && e.newValue) {
        const session = decodeToken(e.newValue);
        if (session) {
          setDeveloperSession(session);
          setIsProduction(session.isProduction);
          setActiveRole(session.activeRole);
          setIsDeveloper(session.actualRole === 'DEVELOPER');
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateSession = (session: DeveloperSession) => {
    setDeveloperSession(session);
    setIsProduction(session.isProduction);
    setActiveRole(session.activeRole);
    setIsDeveloper(session.actualRole === 'DEVELOPER');
  };

  const clearSession = () => {
    setDeveloperSession(null);
    setIsProduction(true);
    setActiveRole(null);
    setIsDeveloper(false);
  };

  return (
    <DeveloperContext.Provider
      value={{
        developerSession,
        isProduction,
        activeRole,
        isDeveloper,
        updateSession,
        clearSession,
      }}
    >
      {children}
    </DeveloperContext.Provider>
  );
}

/**
 * useDeveloper Hook
 * Access developer context from any component
 * 
 * @example
 * const { isProduction, activeRole, isDeveloper } = useDeveloper();
 * 
 * if (!isProduction) {
 *   console.log('Running in DEVELOPMENT mode');
 * }
 */
export function useDeveloper() {
  const context = useContext(DeveloperContext);
  if (context === undefined) {
    throw new Error('useDeveloper must be used within a DeveloperProvider');
  }
  return context;
}

/**
 * withDeveloperCheck HOC
 * Wrap components that should only be accessible to developers
 * 
 * @example
 * export default withDeveloperCheck(DeveloperOnlyComponent);
 */
export function withDeveloperCheck<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return function DeveloperOnlyComponent(props: P) {
    const { isDeveloper } = useDeveloper();

    if (!isDeveloper) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
            <p className="text-slate-600">This feature is only available to developers.</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

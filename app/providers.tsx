/**
 * App Providers
 * 
 * Client-side providers for NextAuth session management
 */

'use client'

import { SessionProvider } from 'next-auth/react'

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}

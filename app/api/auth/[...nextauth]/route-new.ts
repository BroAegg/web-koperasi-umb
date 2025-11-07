/**
 * NextAuth Route Handler
 * 
 * Imports authOptions from separate config file (@/lib/auth-options)
 * to avoid Next.js type errors with route exports
 */

import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth-options'

// Re-export authOptions for backward compatibility with other files that import it
export { authOptions } from '@/lib/auth-options'

// Create NextAuth handler
const handler = NextAuth(authOptions)

// Export GET and POST handlers
export { handler as GET, handler as POST }

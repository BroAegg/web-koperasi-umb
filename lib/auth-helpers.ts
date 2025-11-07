/**
 * Authentication Helpers
 * 
 * Server-side helpers for checking authentication and authorization
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { Role } from '@prisma/client'
import { redirect } from 'next/navigation'

/**
 * Get current session (server component)
 * Returns session or null if not authenticated
 */
export async function getSession() {
  return await getServerSession(authOptions)
}

/**
 * Require authentication
 * Redirects to login if not authenticated
 */
export async function requireAuth() {
  const session = await getSession()
  
  if (!session || !session.user) {
    redirect('/login')
  }
  
  return session
}

/**
 * Require specific role
 * Redirects to unauthorized page if role doesn't match
 */
export async function requireRole(allowedRoles: Role[]) {
  const session = await requireAuth()
  
  if (!allowedRoles.includes(session.user.role as Role)) {
    redirect('/unauthorized')
  }
  
  return session
}

/**
 * Check if user has role
 */
export async function hasRole(role: Role) {
  const session = await getSession()
  return session?.user?.role === role
}

/**
 * Check if user is super admin
 */
export async function isSuperAdmin() {
  return await hasRole('SUPER_ADMIN')
}

/**
 * Check if user is admin (kasir)
 */
export async function isAdmin() {
  return await hasRole('ADMIN')
}

/**
 * Check if user is developer
 */
export async function isDeveloper() {
  return await hasRole('DEVELOPER')
}

/**
 * Get current user ID
 */
export async function getCurrentUserId() {
  const session = await getSession()
  return session?.user?.id || null
}

/**
 * Get current user role
 */
export async function getCurrentUserRole() {
  const session = await getSession()
  return session?.user?.role || null
}

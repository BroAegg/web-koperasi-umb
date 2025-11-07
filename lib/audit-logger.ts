/**
 * Audit Logger
 * 
 * Tracks important user actions for accountability and debugging
 * Records: WHO did WHAT, WHEN, and WHERE (IP address)
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export type AuditAction = 
  | 'LOGIN'
  | 'LOGOUT'
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'VOID'
  | 'EXPORT'
  | 'IMPORT'
  | 'BACKUP'
  | 'RESTORE'

export type AuditEntity = 
  | 'USER'
  | 'PRODUCT'
  | 'TRANSACTION'
  | 'INVENTORY'
  | 'CATEGORY'
  | 'MEMBER'
  | 'SUPPLIER'
  | 'SETTING'

interface AuditLogData {
  userId: string
  action: AuditAction
  entity: AuditEntity
  entityId?: string
  oldData?: any
  newData?: any
  ipAddress?: string
  userAgent?: string
  metadata?: Record<string, any>
}

/**
 * Create audit log entry
 */
export async function createAuditLog(data: AuditLogData) {
  try {
    // Generate unique ID
    const id = `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Serialize data (convert objects to JSON)
    const oldDataStr = data.oldData ? JSON.stringify(data.oldData) : null
    const newDataStr = data.newData ? JSON.stringify(data.newData) : null

    // Create log entry
    const log = await prisma.audit_logs.create({
      data: {
        id,
        userId: data.userId,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId || null,
        oldData: oldDataStr,
        newData: newDataStr,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
        createdAt: new Date()
      }
    })

    return log
  } catch (error) {
    // Don't throw - audit log failure should not break app
    console.error('Failed to create audit log:', error)
    return null
  }
}

/**
 * Get audit logs for specific entity
 */
export async function getAuditLogs(
  entity: AuditEntity,
  entityId?: string,
  limit: number = 50
) {
  try {
    const logs = await prisma.audit_logs.findMany({
      where: {
        entity,
        ...(entityId && { entityId })
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })

    return logs
  } catch (error) {
    console.error('Failed to get audit logs:', error)
    return []
  }
}

/**
 * Get audit logs for specific user
 */
export async function getUserAuditLogs(userId: string, limit: number = 50) {
  try {
    const logs = await prisma.audit_logs.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })

    return logs
  } catch (error) {
    console.error('Failed to get user audit logs:', error)
    return []
  }
}

/**
 * Get recent audit logs (for admin dashboard)
 */
export async function getRecentAuditLogs(limit: number = 100) {
  try {
    const logs = await prisma.audit_logs.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })

    return logs
  } catch (error) {
    console.error('Failed to get recent audit logs:', error)
    return []
  }
}

/**
 * Helper: Extract IP address from request
 */
export function getIpFromRequest(request: Request): string | undefined {
  // Check headers in order of preference
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // Fallback (usually not available in Next.js)
  return undefined
}

/**
 * Helper: Extract user agent from request
 */
export function getUserAgentFromRequest(request: Request): string | undefined {
  return request.headers.get('user-agent') || undefined
}

/**
 * Convenience wrapper for common operations
 */

export async function auditCreate(
  userId: string,
  entity: AuditEntity,
  entityId: string,
  data: any,
  request?: Request
) {
  return createAuditLog({
    userId,
    action: 'CREATE',
    entity,
    entityId,
    newData: data,
    ipAddress: request ? getIpFromRequest(request) : undefined,
    userAgent: request ? getUserAgentFromRequest(request) : undefined
  })
}

export async function auditUpdate(
  userId: string,
  entity: AuditEntity,
  entityId: string,
  oldData: any,
  newData: any,
  request?: Request
) {
  return createAuditLog({
    userId,
    action: 'UPDATE',
    entity,
    entityId,
    oldData,
    newData,
    ipAddress: request ? getIpFromRequest(request) : undefined,
    userAgent: request ? getUserAgentFromRequest(request) : undefined
  })
}

export async function auditDelete(
  userId: string,
  entity: AuditEntity,
  entityId: string,
  data: any,
  request?: Request
) {
  return createAuditLog({
    userId,
    action: 'DELETE',
    entity,
    entityId,
    oldData: data,
    ipAddress: request ? getIpFromRequest(request) : undefined,
    userAgent: request ? getUserAgentFromRequest(request) : undefined
  })
}

export async function auditVoid(
  userId: string,
  entity: AuditEntity,
  entityId: string,
  reason?: string,
  request?: Request
) {
  return createAuditLog({
    userId,
    action: 'VOID',
    entity,
    entityId,
    metadata: { reason },
    ipAddress: request ? getIpFromRequest(request) : undefined,
    userAgent: request ? getUserAgentFromRequest(request) : undefined
  })
}

export async function auditExport(
  userId: string,
  entity: AuditEntity,
  filters?: Record<string, any>,
  request?: Request
) {
  return createAuditLog({
    userId,
    action: 'EXPORT',
    entity,
    metadata: filters,
    ipAddress: request ? getIpFromRequest(request) : undefined,
    userAgent: request ? getUserAgentFromRequest(request) : undefined
  })
}

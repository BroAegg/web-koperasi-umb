/**
 * DEVELOPER HELPER UTILITIES
 * Reusable functions for developer mode features
 */

import { prisma } from './prisma';

/**
 * Activity Log Types
 */
export type ActivityAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'ENVIRONMENT_SWITCH'
  | 'ROLE_SWITCH'
  | 'EXPORT'
  | 'IMPORT';

export type ActivityModule =
  | 'POS'
  | 'INVENTORY'
  | 'MEMBER'
  | 'FINANCIAL'
  | 'SUPPLIER'
  | 'BROADCAST'
  | 'SETTINGS'
  | 'DEVELOPER_TOOLS'
  | 'AUTH';

import { Role } from '@prisma/client';

interface CreateActivityLogParams {
  userId: string;
  userRole: Role | string;
  action: ActivityAction;
  module: ActivityModule;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  isProduction?: boolean;
}

/**
 * Create activity log entry
 * 
 * @example
 * await createActivityLog({
 *   userId: user.id,
 *   userRole: 'ADMIN',
 *   action: 'CREATE',
 *   module: 'POS',
 *   description: 'Created new transaction',
 *   metadata: { transactionId: 123, amount: 50000 }
 * });
 */
export async function createActivityLog(params: CreateActivityLogParams) {
  try {
    const id = `activity-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    await prisma.activity_logs.create({
      data: {
        id,
        userId: params.userId,
        userRole: params.userRole as Role,
        action: params.action,
        module: params.module,
        description: params.description,
        metadata: params.metadata || {},
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        // Always log to production for audit trail (unless explicitly set)
        isProduction: params.isProduction !== undefined ? params.isProduction : true,
      },
    });

    return { success: true, id };
  } catch (error) {
    console.error('[createActivityLog] Error:', error);
    return { success: false, error };
  }
}

/**
 * Get activity logs with pagination and filtering
 * 
 * @example
 * const logs = await getActivityLogs({
 *   userId: '1',
 *   module: 'POS',
 *   page: 1,
 *   limit: 50
 * });
 */
export async function getActivityLogs(params: {
  userId?: string;
  userRole?: string;
  module?: ActivityModule;
  action?: ActivityAction;
  isProduction?: boolean;
  page?: number;
  limit?: number;
  startDate?: Date;
  endDate?: Date;
}) {
  try {
    const {
      userId,
      userRole,
      module,
      action,
      isProduction = true,
      page = 1,
      limit = 50,
      startDate,
      endDate,
    } = params;

    const where: any = { isProduction };

    if (userId) where.userId = userId;
    if (userRole) where.userRole = userRole;
    if (module) where.module = module;
    if (action) where.action = action;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [logs, total] = await Promise.all([
      prisma.activity_logs.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          users: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.activity_logs.count({ where }),
    ]);

    return {
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('[getActivityLogs] Error:', error);
    return { success: false, error };
  }
}

/**
 * Get activity log statistics
 * 
 * @example
 * const stats = await getActivityLogStats({ userId: '1' });
 * // Returns: { totalActions: 150, byModule: {...}, byAction: {...} }
 */
export async function getActivityLogStats(params: {
  userId?: string;
  isProduction?: boolean;
  startDate?: Date;
  endDate?: Date;
}) {
  try {
    const { userId, isProduction = true, startDate, endDate } = params;

    const where: any = { isProduction };
    if (userId) where.userId = userId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [totalActions, byModule, byAction] = await Promise.all([
      prisma.activity_logs.count({ where }),
      prisma.activity_logs.groupBy({
        by: ['module'],
        where,
        _count: true,
      }),
      prisma.activity_logs.groupBy({
        by: ['action'],
        where,
        _count: true,
      }),
    ]);

    return {
      success: true,
      data: {
        totalActions,
        byModule: Object.fromEntries(byModule.map(m => [m.module, m._count])),
        byAction: Object.fromEntries(byAction.map(a => [a.action, a._count])),
      },
    };
  } catch (error) {
    console.error('[getActivityLogStats] Error:', error);
    return { success: false, error };
  }
}

/**
 * Check if user is in developer mode
 * Extract from JWT token
 */
export function isDeveloperMode(token: string): boolean {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return payload.developerSession?.actualRole === 'DEVELOPER';
  } catch {
    return false;
  }
}

/**
 * Get current environment mode from token
 */
export function getEnvironmentMode(token: string): 'PRODUCTION' | 'DEVELOPMENT' {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return payload.developerSession?.isProduction ? 'PRODUCTION' : 'DEVELOPMENT';
  } catch {
    return 'PRODUCTION';
  }
}

/**
 * Format activity log metadata for display
 */
export function formatActivityMetadata(metadata: any): string {
  if (!metadata || Object.keys(metadata).length === 0) {
    return '-';
  }

  try {
    return JSON.stringify(metadata, null, 2);
  } catch {
    return String(metadata);
  }
}

/**
 * Get color for activity action
 */
export function getActionColor(action: ActivityAction): string {
  const colors: Record<ActivityAction, string> = {
    CREATE: 'text-green-600 bg-green-50',
    UPDATE: 'text-blue-600 bg-blue-50',
    DELETE: 'text-red-600 bg-red-50',
    LOGIN: 'text-purple-600 bg-purple-50',
    LOGOUT: 'text-gray-600 bg-gray-50',
    ENVIRONMENT_SWITCH: 'text-orange-600 bg-orange-50',
    ROLE_SWITCH: 'text-indigo-600 bg-indigo-50',
    EXPORT: 'text-teal-600 bg-teal-50',
    IMPORT: 'text-cyan-600 bg-cyan-50',
  };

  return colors[action] || 'text-gray-600 bg-gray-50';
}

/**
 * Get icon for activity module
 */
export function getModuleIcon(module: ActivityModule): string {
  const icons: Record<ActivityModule, string> = {
    POS: '🛒',
    INVENTORY: '📦',
    MEMBER: '👥',
    FINANCIAL: '💰',
    SUPPLIER: '🏪',
    BROADCAST: '📢',
    SETTINGS: '⚙️',
    DEVELOPER_TOOLS: '🔧',
    AUTH: '🔐',
  };

  return icons[module] || '📋';
}

/**
 * Clean development data
 * Delete all records with isProduction = false
 * 
 * ⚠️ DANGEROUS OPERATION - USE WITH CAUTION
 */
export async function cleanDevelopmentData() {
  try {
    const results = await prisma.$transaction([
      prisma.transaction_items.deleteMany({
        where: { isProduction: false },
      }),
      prisma.transactions.deleteMany({
        where: { isProduction: false },
      }),
      prisma.stock_movements.deleteMany({
        where: { isProduction: false },
      }),
      prisma.consignment_sales.deleteMany({
        where: { isProduction: false },
      }),
    ]);

    const totalDeleted = results.reduce((sum, r) => sum + r.count, 0);

    return {
      success: true,
      deleted: {
        transaction_items: results[0].count,
        transactions: results[1].count,
        stock_movements: results[2].count,
        consignment_sales: results[3].count,
        total: totalDeleted,
      },
    };
  } catch (error) {
    console.error('[cleanDevelopmentData] Error:', error);
    return { success: false, error };
  }
}

/**
 * Get data statistics (dev vs prod)
 */
export async function getDataStatistics() {
  try {
    const [transactions, stockMovements, consignmentSales] = await Promise.all([
      prisma.transactions.groupBy({
        by: ['isProduction'],
        _count: true,
      }),
      prisma.stock_movements.groupBy({
        by: ['isProduction'],
        _count: true,
      }),
      prisma.consignment_sales.groupBy({
        by: ['isProduction'],
        _count: true,
      }),
    ]);

    const formatCounts = (data: any[]) => ({
      production: data.find(d => d.isProduction)?._count || 0,
      development: data.find(d => !d.isProduction)?._count || 0,
    });

    return {
      success: true,
      data: {
        transactions: formatCounts(transactions),
        stockMovements: formatCounts(stockMovements),
        consignmentSales: formatCounts(consignmentSales),
      },
    };
  } catch (error) {
    console.error('[getDataStatistics] Error:', error);
    return { success: false, error };
  }
}

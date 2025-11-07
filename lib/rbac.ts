/**
 * Role-Based Access Control (RBAC)
 * 
 * Permission matrix and helper functions for checking user permissions
 */

import { Role } from '@prisma/client'

// Permission types
export type Permission = 
  | 'users:create'
  | 'users:read'
  | 'users:update'
  | 'users:delete'
  | 'users:assign-role'
  | 'products:create'
  | 'products:read'
  | 'products:update'
  | 'products:delete'
  | 'products:import'
  | 'products:export'
  | 'transactions:create'
  | 'transactions:read'
  | 'transactions:read-all'
  | 'transactions:update'
  | 'transactions:delete'
  | 'transactions:export'
  | 'inventory:create'
  | 'inventory:read'
  | 'inventory:update'
  | 'inventory:export'
  | 'reports:sales'
  | 'reports:profit'
  | 'reports:cashier'
  | 'reports:inventory'
  | 'reports:export'
  | 'reports:dashboard'
  | 'settings:general'
  | 'settings:backup'
  | 'settings:restore'
  | 'settings:audit'
  | 'developer:sql'
  | 'developer:logs'
  | 'developer:impersonate'
  | 'developer:maintenance'

// Permission matrix
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  // Super Admin - Full access except checkout
  SUPER_ADMIN: [
    'users:create',
    'users:read',
    'users:update',
    'users:delete',
    'users:assign-role',
    'products:create',
    'products:read',
    'products:update',
    'products:delete',
    'products:import',
    'products:export',
    'transactions:read-all',
    'transactions:delete',
    'transactions:export',
    'inventory:create',
    'inventory:read',
    'inventory:update',
    'inventory:export',
    'reports:sales',
    'reports:profit',
    'reports:cashier',
    'reports:inventory',
    'reports:export',
    'reports:dashboard',
    'settings:general',
    'settings:backup',
    'settings:restore',
    'settings:audit',
  ],

  // Admin (Kasir) - Transaksi + view only
  ADMIN: [
    'products:read',
    'transactions:create',
    'transactions:read', // Own transactions only
    'transactions:export', // Own transactions only
    'inventory:read',
    'reports:sales', // Own sales only
    'reports:cashier', // Own performance only
  ],

  // Supplier - Manage own products and POs (Skip for pilot)
  SUPPLIER: [
    'products:read',
    'inventory:read',
  ],

  // User - Minimal access (members)
  USER: [
    'transactions:read', // Own transactions only
  ],

  // Developer - God mode
  DEVELOPER: [
    'users:create',
    'users:read',
    'users:update',
    'users:delete',
    'users:assign-role',
    'products:create',
    'products:read',
    'products:update',
    'products:delete',
    'products:import',
    'products:export',
    'transactions:create',
    'transactions:read',
    'transactions:read-all',
    'transactions:update',
    'transactions:delete',
    'transactions:export',
    'inventory:create',
    'inventory:read',
    'inventory:update',
    'inventory:export',
    'reports:sales',
    'reports:profit',
    'reports:cashier',
    'reports:inventory',
    'reports:export',
    'reports:dashboard',
    'settings:general',
    'settings:backup',
    'settings:restore',
    'settings:audit',
    'developer:sql',
    'developer:logs',
    'developer:impersonate',
    'developer:maintenance',
  ],
}

/**
 * Check if user has permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || []
  return permissions.includes(permission)
}

/**
 * Check multiple permissions (AND logic)
 */
export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(role, permission))
}

/**
 * Check multiple permissions (OR logic)
 */
export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(role, permission))
}

/**
 * Get all permissions for role
 */
export function getRolePermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] || []
}

/**
 * Shorthand permission checkers
 */

// Users
export const canCreateUser = (role: Role) => hasPermission(role, 'users:create')
export const canReadUser = (role: Role) => hasPermission(role, 'users:read')
export const canUpdateUser = (role: Role) => hasPermission(role, 'users:update')
export const canDeleteUser = (role: Role) => hasPermission(role, 'users:delete')
export const canAssignRole = (role: Role) => hasPermission(role, 'users:assign-role')

// Products
export const canCreateProduct = (role: Role) => hasPermission(role, 'products:create')
export const canReadProduct = (role: Role) => hasPermission(role, 'products:read')
export const canUpdateProduct = (role: Role) => hasPermission(role, 'products:update')
export const canDeleteProduct = (role: Role) => hasPermission(role, 'products:delete')
export const canImportProduct = (role: Role) => hasPermission(role, 'products:import')
export const canExportProduct = (role: Role) => hasPermission(role, 'products:export')

// Transactions
export const canCreateTransaction = (role: Role) => hasPermission(role, 'transactions:create')
export const canReadTransaction = (role: Role) => hasPermission(role, 'transactions:read')
export const canReadAllTransactions = (role: Role) => hasPermission(role, 'transactions:read-all')
export const canUpdateTransaction = (role: Role) => hasPermission(role, 'transactions:update')
export const canDeleteTransaction = (role: Role) => hasPermission(role, 'transactions:delete')
export const canExportTransaction = (role: Role) => hasPermission(role, 'transactions:export')

// Inventory
export const canCreateInventory = (role: Role) => hasPermission(role, 'inventory:create')
export const canReadInventory = (role: Role) => hasPermission(role, 'inventory:read')
export const canUpdateInventory = (role: Role) => hasPermission(role, 'inventory:update')
export const canExportInventory = (role: Role) => hasPermission(role, 'inventory:export')

// Reports
export const canViewSalesReport = (role: Role) => hasPermission(role, 'reports:sales')
export const canViewProfitReport = (role: Role) => hasPermission(role, 'reports:profit')
export const canViewCashierReport = (role: Role) => hasPermission(role, 'reports:cashier')
export const canViewInventoryReport = (role: Role) => hasPermission(role, 'reports:inventory')
export const canExportReport = (role: Role) => hasPermission(role, 'reports:export')
export const canViewDashboard = (role: Role) => hasPermission(role, 'reports:dashboard')

// Settings
export const canManageSettings = (role: Role) => hasPermission(role, 'settings:general')
export const canManageBackup = (role: Role) => hasPermission(role, 'settings:backup')
export const canRestoreBackup = (role: Role) => hasPermission(role, 'settings:restore')
export const canViewAuditLog = (role: Role) => hasPermission(role, 'settings:audit')

// Developer tools
export const canExecuteSQL = (role: Role) => hasPermission(role, 'developer:sql')
export const canViewLogs = (role: Role) => hasPermission(role, 'developer:logs')
export const canImpersonate = (role: Role) => hasPermission(role, 'developer:impersonate')
export const canMaintenance = (role: Role) => hasPermission(role, 'developer:maintenance')

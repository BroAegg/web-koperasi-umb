import { PrismaClient } from '@prisma/client';
import { NextRequest } from 'next/server';
import { getUserFromToken } from './auth';

const prisma = new PrismaClient();

interface LogActivityParams {
  userId: string;
  userRole: string;
  action: string;
  module: string;
  description: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  isProduction?: boolean;
}

/**
 * Log user activity to activity_logs table
 * Automatically logs all activities from non-DEVELOPER users in PRODUCTION mode
 */
export async function logActivity(params: LogActivityParams) {
  try {
    await prisma.activity_logs.create({
      data: {
        id: crypto.randomUUID(),
        userId: params.userId,
        userRole: params.userRole as any,
        action: params.action,
        module: params.module,
        description: params.description,
        metadata: params.metadata || {},
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null,
        isProduction: params.isProduction !== undefined ? params.isProduction : true,
        createdAt: new Date(),
      },
    });
  } catch (error) {
    // Don't fail the main operation if logging fails
    console.error('[Activity Logger] Failed to log activity:', error);
  }
}

/**
 * Extract request metadata (IP, User Agent)
 */
export function extractRequestMetadata(req: NextRequest) {
  return {
    ipAddress: req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               'unknown',
    userAgent: req.headers.get('user-agent') || 'unknown',
  };
}

/**
 * Helper function to log from API routes with session user
 */
export async function logFromApi(
  user: { id: string; role: string },
  action: string,
  module: string,
  description: string,
  metadata?: any,
  req?: NextRequest
) {
  const requestMetadata = req ? extractRequestMetadata(req) : {};
  
  await logActivity({
    userId: user.id,
    userRole: user.role,
    action,
    module,
    description,
    metadata,
    ...requestMetadata,
  });
}

/**
 * Helper to extract user from NextRequest and log activity
 */
export async function logFromRequest(
  req: NextRequest,
  action: string,
  module: string,
  description: string,
  metadata?: any
) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      console.warn('[Activity Logger] No token found in request');
      return;
    }
    
    const user = await getUserFromToken(token);
    if (!user) {
      console.warn('[Activity Logger] No user found from token');
      return;
    }
    
    await logFromApi(
      { id: user.id, role: user.role },
      action,
      module,
      description,
      metadata,
      req
    );
  } catch (error) {
    console.error('[Activity Logger] Failed to log from request:', error);
  }
}

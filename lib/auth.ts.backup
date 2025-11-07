import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { SessionUser, DeveloperSession } from './types/developer';

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_in_env';
const JWT_EXPIRES_IN = '7d';

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string) {
  return await bcrypt.compare(password, hash);
}

export function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string) {
  try {
    const result = jwt.verify(token, JWT_SECRET) as any;
    return result;
  } catch (err) {
    // Only log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[verifyToken] Failed:', err instanceof Error ? err.message : 'Unknown error');
    }
    return null;
  }
}

/**
 * Create a token specifically for developer sessions that includes developerSession metadata
 */
export function signDeveloperToken(userId: string, role: string, developerSession?: DeveloperSession) {
  const payload: any = { userId, role };
  if (developerSession) payload.developerSession = developerSession;
  return signToken(payload);
}

export async function getUserFromToken(token?: string) {
  if (!token) return null;
  
  const data = verifyToken(token);
  
  if (!data || !data.userId) return null;

  // If developerSession present in token and activeRole set, use activeRole when returning user-like object
  if (data.developerSession && data.developerSession.activeRole && data.developerSession.actualRole === 'DEVELOPER') {
    // First, get the actual developer user from database for email and name
    // @ts-ignore - Prisma types at runtime
    const developerUser = await prisma.users.findUnique({ where: { id: data.userId } });
    if (!developerUser) return null;

    // If activeRole is SUPPLIER, try unified suppliers table
    const activeRole = data.developerSession.activeRole;
    if (activeRole === 'SUPPLIER') {
      // @ts-ignore
      const supplier = await prisma.suppliers.findUnique({
        where: { id: data.userId },
        select: { id: true, businessName: true, email: true, status: true }
      });
      if (!supplier) return null;
      return {
        id: supplier.id,
        email: supplier.email,
        name: supplier.businessName,
        role: 'SUPPLIER' as const,
        developerSession: data.developerSession as DeveloperSession
      } as any;
    }

    // For non-supplier active roles, return user data with activeRole
    return {
      id: developerUser.id,
      name: developerUser.name,
      email: developerUser.email,
      role: data.developerSession.activeRole,
      developerSession: data.developerSession as DeveloperSession
    } as SessionUser;
  }

  // Default behavior: lookup in users table
  // @ts-ignore - Prisma types at runtime
  const user = await prisma.users.findUnique({ where: { id: data.userId } });
  
  if (user) return user;

  // If role is SUPPLIER, try unified suppliers table
  if (data.role === 'SUPPLIER') {
    // @ts-ignore
    const supplier = await prisma.suppliers.findUnique({
      where: { id: data.userId },
      select: { id: true, businessName: true, email: true, status: true }
    });
    if (!supplier) return null;
    return {
      id: supplier.id,
      email: supplier.email,
      name: supplier.businessName,
      role: 'SUPPLIER' as const,
    } as any;
  }

  return null;
}

export function requireRole(...allowed: Array<'SUPER_ADMIN' | 'ADMIN' | 'SUPPLIER' | 'USER' | 'DEVELOPER'>) {
  return async (req: Request) => {
    try {
      const auth = (req as any).headers?.get?.('authorization') || (req as any).headers?.authorization;
      const token = auth?.toString().replace?.(/^Bearer\s+/i, '');
      const user = await getUserFromToken(token);
      if (!user) return { status: 401, body: { success: false, error: 'Unauthorized' } };
      if (!allowed.includes(user.role as any)) return { status: 403, body: { success: false, error: 'Forbidden' } };
      return { status: 200, user };
    } catch (err) {
      return { status: 401, body: { success: false, error: 'Unauthorized' } };
    }
  };
}

export default {};

import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (err) {
    return null;
  }
}

export async function getUserFromToken(token?: string) {
  if (!token) return null;
  const data = verifyToken(token);
  if (!data || !data.userId) return null;
  const user = await prisma.users.findUnique({ where: { id: data.userId } });
  return user;
}

export function requireRole(...allowed: Array<'SUPER_ADMIN' | 'ADMIN' | 'SUPPLIER' | 'USER'>) {
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

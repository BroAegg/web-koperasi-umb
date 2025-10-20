import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, signDeveloperToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization') || '';
    const token = auth.replace(/^Bearer\s+/i, '');
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    if (payload.role !== 'DEVELOPER' && !(payload.developerSession && payload.developerSession.actualRole === 'DEVELOPER')) {
      return NextResponse.json({ error: 'Unauthorized: Only developers' }, { status: 403 });
    }

    const body = await req.json();
    const { targetRole } = body;
    const allowed = ['ADMIN', 'SUPER_ADMIN', 'SUPPLIER', 'USER', 'DEVELOPER'];
    if (!allowed.includes(targetRole)) return NextResponse.json({ error: 'Invalid target role' }, { status: 400 });

    // Build updated developerSession
    const devSession = {
      actualRole: 'DEVELOPER',
      activeRole: targetRole,
      isProduction: payload.developerSession?.isProduction ?? false,
      switchedAt: new Date().toISOString(),
    };

    // Issue a new token including developerSession
    const newToken = signDeveloperToken(payload.userId, payload.role, devSession as any);

    return NextResponse.json({ success: true, token: newToken, developerSession: devSession });
  } catch (err) {
    console.error('switch-role error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

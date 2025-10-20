import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, signDeveloperToken } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization') || '';
    const token = auth.replace(/^Bearer\s+/i, '');
    const payload: any = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    if (payload.role !== 'DEVELOPER' && !(payload.developerSession && payload.developerSession.actualRole === 'DEVELOPER')) {
      return NextResponse.json({ error: 'Unauthorized: Only developers' }, { status: 403 });
    }

    const body = await req.json();
    const isProduction = !!body.isProduction;

    // Build updated developerSession
    const devSession = {
      actualRole: 'DEVELOPER',
      activeRole: payload.developerSession?.activeRole ?? 'DEVELOPER',
      isProduction,
      switchedAt: new Date().toISOString(),
    };

    // Log to activity_logs as production activity
    await prisma.activity_logs.create({
      data: {
        id: `activity-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        userId: payload.userId,
        userRole: 'DEVELOPER',
        action: 'ENVIRONMENT_SWITCH',
        module: 'DEVELOPER',
        description: `Switched to ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} mode`,
        metadata: { isProduction },
        isProduction: true,
      },
    });

    const newToken = signDeveloperToken(payload.userId, payload.role, devSession as any);

    return NextResponse.json({ success: true, token: newToken, developerSession: devSession });
  } catch (err) {
    console.error('toggle-environment error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

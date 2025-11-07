import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

/**
 * POST /api/errors/log
 * Log frontend errors to database for monitoring
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { error, errorInfo, timestamp, userAgent } = body;

    // Store error in database (reuse audit_logs table)
    await prisma.audit_logs.create({
      data: {
        id: randomUUID(),
        userId: null, // Frontend errors may not have user context
        action: 'FRONTEND_ERROR',
        entity: 'ERROR',
        entityId: null,
        oldData: JSON.stringify({
          error: error?.substring(0, 500), // Limit size
          errorInfo: errorInfo?.substring(0, 1000),
          userAgent: userAgent?.substring(0, 200),
          timestamp,
          url: request.url,
        }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to log frontend error:', error);
    // Don't fail - just log server-side
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

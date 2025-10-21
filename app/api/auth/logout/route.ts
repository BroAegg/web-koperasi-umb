import { NextRequest, NextResponse } from 'next/server';
import { withActivityLog } from '@/lib/with-activity-log';
import { getUserFromToken } from '@/lib/auth';

/**
 * POST /api/auth/logout
 * Log user logout activity
 */
async function handleLogout(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Activity logging handled by middleware
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('[Logout Error]', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}

export const POST = withActivityLog({
  module: 'AUTH',
  action: 'LOGOUT',
  getDescription: (req) => {
    // User info will be extracted in middleware
    return 'User logged out';
  },
})(handleLogout);

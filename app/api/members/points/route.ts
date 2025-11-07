import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { 
  redeemPoints, 
  getMemberPointsHistory,
  calculatePointsValue,
  DEFAULT_POINTS_CONFIG
} from '@/lib/member-points';

/**
 * POST /api/members/points/redeem
 * Redeem member points for cash discount
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { memberId, points, description, transactionId } = body;

    if (!memberId || !points) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await redeemPoints(
      memberId,
      points,
      description || `Penukaran ${points} poin`,
      transactionId
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Points redeemed successfully',
      data: {
        pointsRedeemed: points,
        cashValue: result.cashValue,
        newBalance: result.newBalance,
      },
    });
  } catch (error) {
    console.error('Error redeeming points:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/members/points/history?memberId=xxx
 * Get member points transaction history
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json(
        { success: false, error: 'Missing memberId parameter' },
        { status: 400 }
      );
    }

    const history = await getMemberPointsHistory(memberId);

    return NextResponse.json({
      success: true,
      data: history,
      config: DEFAULT_POINTS_CONFIG,
    });
  } catch (error) {
    console.error('Error fetching points history:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import {
  calculateSettlement,
  getSuppliersWithPendingSettlements,
  getCurrentMonthRange,
  getPreviousMonthRange,
} from '@/lib/settlement-calculator';

/**
 * GET /api/consignment/settlements
 * Get settlement report for a supplier or all suppliers
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
    const supplierId = searchParams.get('supplierId');
    const period = searchParams.get('period') || 'current'; // current, previous, custom
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');

    // Determine date range
    let startDate: Date;
    let endDate: Date;

    if (period === 'custom' && startDateStr && endDateStr) {
      startDate = new Date(startDateStr);
      endDate = new Date(endDateStr);
    } else if (period === 'previous') {
      const range = getPreviousMonthRange();
      startDate = range.startDate;
      endDate = range.endDate;
    } else {
      // Default to current month
      const range = getCurrentMonthRange();
      startDate = range.startDate;
      endDate = range.endDate;
    }

    // If supplierId provided, get specific supplier settlement
    if (supplierId) {
      const settlement = await calculateSettlement(supplierId, startDate, endDate);
      
      return NextResponse.json({
        success: true,
        data: settlement,
      });
    }

    // Otherwise, get all suppliers with pending settlements
    const suppliers = await getSuppliersWithPendingSettlements(startDate, endDate);

    return NextResponse.json({
      success: true,
      data: {
        period: {
          startDate,
          endDate,
        },
        suppliers,
        totalSuppliers: suppliers.length,
        totalPendingAmount: suppliers.reduce((sum, s) => sum + s.pendingAmount, 0),
      },
    });
  } catch (error) {
    console.error('Error fetching settlements:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

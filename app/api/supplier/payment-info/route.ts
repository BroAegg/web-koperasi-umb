import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';

// GET /api/supplier/payment-info - Get payment information
export async function GET(request: NextRequest) {
  try {
    // Get user from token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await getUserFromToken(token);
    if (!user || user.role !== 'SUPPLIER') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Supplier only' },
        { status: 403 }
      );
    }

    // Get supplier profile
    const supplier = await prisma.supplier_profiles.findFirst({
      where: { email: user.email },
      select: {
        monthlyFee: true,
        paymentStatus: true,
        lastPaymentDate: true,
        nextPaymentDue: true,
        isPaymentActive: true,
      },
    });

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    console.error('Error fetching payment info:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

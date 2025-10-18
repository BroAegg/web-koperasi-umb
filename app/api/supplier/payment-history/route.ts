import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';

// GET /api/supplier/payment-history - Get payment history
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
    });

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier profile not found' },
        { status: 404 }
      );
    }

    // Get payment history
    const payments = await prisma.supplier_payments.findMany({
      where: { supplierProfileId: supplier.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        amount: true,
        paymentProof: true,
        status: true,
        note: true,
        createdAt: true,
        verifiedAt: true,
      },
    });

    // Convert Decimal to number for JSON
    const paymentsData = payments.map(p => ({
      ...p,
      amount: Number(p.amount),
      verificationStatus: p.status, // Alias for frontend compatibility
    }));

    return NextResponse.json({
      success: true,
      data: paymentsData,
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

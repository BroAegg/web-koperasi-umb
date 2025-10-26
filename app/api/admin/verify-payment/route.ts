// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await getUserFromToken(token);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Super Admin only' },
        { status: 401 }
      );
    }

    const { supplierId, approve } = await request.json();

    if (!supplierId || typeof approve !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields: supplierId and approve' },
        { status: 400 }
      );
    }

    // Find the supplier
    const supplier = await prisma.suppliers.findUnique({
      where: { id: supplierId },
      include: {
        supplier_payments: {
          where: { status: 'PENDING' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!supplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      );
    }

    if (supplier.supplier_payments.length === 0) {
      return NextResponse.json(
        { error: 'No pending payment found' },
        { status: 404 }
      );
    }

    const payment = supplier.supplier_payments[0];
    const now = new Date();

    // Update payment record
    await prisma.supplier_payments.update({
      where: { id: payment.id },
      data: {
        status: approve ? 'VERIFIED' : 'REJECTED',
        verifiedBy: user.id,
        verifiedAt: now,
        updatedAt: now,
      },
    });

    // Update supplier status
    const newPaymentStatus = approve ? 'PAID_APPROVED' : 'PAID_REJECTED';
    await prisma.suppliers.update({
      where: { id: supplierId },
      data: {
        paymentStatus: newPaymentStatus,
        updatedAt: now,
      },
    });

    return NextResponse.json({
      success: true,
      message: approve
        ? 'Payment approved successfully'
        : 'Payment rejected',
      paymentStatus: newPaymentStatus,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}

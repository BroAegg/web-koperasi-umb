// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';
import { randomUUID } from 'crypto';

// POST /api/supplier/monthly-payment - Submit monthly payment proof
export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json();
    const { proofImageUrl } = body;

    if (!proofImageUrl) {
      return NextResponse.json(
        { success: false, error: 'Bukti pembayaran diperlukan' },
        { status: 400 }
      );
    }

    // Get supplier
    const supplier = await prisma.suppliers.findFirst({
      where: { email: user.email },
    });

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier not found' },
        { status: 404 }
      );
    }

    // Create supplier payment record for admin approval
    const paymentId = `spay-${Date.now()}-${randomUUID().substring(0, 8)}`;
    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    await prisma.supplier_payments.create({
      data: {
        id: paymentId,
        supplierId: supplier.id,
        amount: supplier.monthlyFee,
        paymentDate: now,
        paymentMethod: 'TRANSFER',
        paymentProof: proofImageUrl,
        periodStart: now,
        periodEnd: nextMonth,
        status: 'PENDING', // Admin needs to verify
        note: 'Pembayaran biaya bulanan',
        createdAt: now,
        updatedAt: now,
      },
    });

    // Update supplier payment status to PAID_PENDING_APPROVAL (waiting admin verification)
    await prisma.suppliers.update({
      where: { id: supplier.id },
      data: {
        paymentStatus: 'PAID_PENDING_APPROVAL', // Will be changed to PAID_APPROVED by admin after verification
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Bukti pembayaran berhasil dikirim. Menunggu verifikasi admin.',
      data: {
        paymentId,
        status: 'PAID_PENDING_APPROVAL',
      },
    });
  } catch (error) {
    console.error('Error submitting monthly payment:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * API: Admin Payment Verification
 * GET /api/admin/payments/verify - Get all pending payments
 * PATCH /api/admin/payments/verify - Verify/Reject payment
 */

import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all payments with supplier info
    const payments = await prisma.supplier_payments.findMany({
      include: {
        suppliers: {
          select: {
            id: true,
            code: true,
            businessName: true,
            ownerName: true,
            email: true,
            phone: true,
            status: true,
            paymentStatus: true,
            nextPaymentDue: true,
          },
        },
      },
      orderBy: {
        paymentDate: 'desc',
      },
    });

    const summary = {
      total: payments.length,
      pending: payments.filter((p: any) => p.status === 'PENDING').length,
      verified: payments.filter((p: any) => p.status === 'VERIFIED').length,
      rejected: payments.filter((p: any) => p.status === 'REJECTED').length,
    };

    return NextResponse.json({
      success: true,
      data: {
        payments,
        summary,
      },
    });
  } catch (error) {
    console.error('Get payments error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { paymentId, action, note } = body;

    if (!paymentId || !action) {
      return NextResponse.json(
        { success: false, error: 'paymentId and action required' },
        { status: 400 }
      );
    }

    if (action !== 'VERIFY' && action !== 'REJECT') {
      return NextResponse.json(
        { success: false, error: 'action must be VERIFY or REJECT' },
        { status: 400 }
      );
    }

    // Get payment
    const payment = await prisma.supplier_payments.findUnique({
      where: { id: paymentId },
      include: {
        suppliers: true,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    if (payment.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, error: 'Payment already processed' },
        { status: 400 }
      );
    }

    // Get verifier (current user)
    const verifier = await prisma.users.findUnique({
      where: { email: session.user.email },
    });

    if (!verifier) {
      return NextResponse.json(
        { success: false, error: 'Verifier not found' },
        { status: 404 }
      );
    }

    const now = new Date();

    if (action === 'VERIFY') {
      // Update payment status
      await prisma.supplier_payments.update({
        where: { id: paymentId },
        data: {
          status: 'VERIFIED',
          verifiedBy: verifier.id,
          verifiedAt: now,
          note: note || null,
        },
      });

      // Calculate next payment due (1st of next month)
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      // Update supplier status to ACTIVE if APPROVED
      await prisma.suppliers.update({
        where: { id: payment.supplierId },
        data: {
          status: payment.suppliers.status === 'APPROVED' ? 'ACTIVE' : payment.suppliers.status,
          paymentStatus: 'PAID_APPROVED',
          isActive: payment.suppliers.status === 'APPROVED' ? true : payment.suppliers.isActive,
          isPaymentActive: true,
          lastPaymentDate: now,
          nextPaymentDue: nextMonth,
          isSuspendedForPayment: false,
          suspendedAt: null,
          suspensionReason: null,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Pembayaran berhasil diverifikasi',
        data: { payment, nextDue: nextMonth },
      });
    } else {
      // REJECT
      await prisma.supplier_payments.update({
        where: { id: paymentId },
        data: {
          status: 'REJECTED',
          verifiedBy: verifier.id,
          verifiedAt: now,
          note: note || null,
        },
      });

      // Update supplier payment status - back to UNPAID so supplier can re-upload
      await prisma.suppliers.update({
        where: { id: payment.supplierId },
        data: {
          paymentStatus: 'UNPAID',
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Pembayaran ditolak',
        data: { payment },
      });
    }
  } catch (error) {
    console.error('Verify payment error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

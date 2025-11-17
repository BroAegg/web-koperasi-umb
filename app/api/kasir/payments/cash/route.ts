import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// POST /api/kasir/payments/cash - Input cash payment by kasir
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['KASIR', 'ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { supplierId, amount, note } = body;

    // Validation
    if (!supplierId || !amount) {
      return NextResponse.json(
        { success: false, error: 'supplierId dan amount wajib diisi' },
        { status: 400 }
      );
    }

    if (parseFloat(amount) <= 0) {
      return NextResponse.json(
        { success: false, error: 'Jumlah pembayaran harus lebih dari 0' },
        { status: 400 }
      );
    }

    // Get supplier
    const supplier = await prisma.suppliers.findUnique({
      where: { id: supplierId },
    });

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier tidak ditemukan' },
        { status: 404 }
      );
    }

    // Only allow payment for APPROVED suppliers (waiting for payment)
    if (supplier.status !== 'APPROVED') {
      return NextResponse.json(
        {
          success: false,
          error: 'Supplier harus dalam status APPROVED untuk melakukan pembayaran aktivasi',
        },
        { status: 400 }
      );
    }

    // Create payment record
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1); // 1st of next month

    // Get current user as verifier
    const verifier = await prisma.users.findUnique({
      where: { email: session.user.email },
    });

    const payment = await prisma.supplier_payments.create({
      data: {
        id: `PAY-CASH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        supplierId: supplier.id,
        amount: parseFloat(amount),
        paymentMethod: 'CASH',
        paymentDate: now,
        periodStart: now,
        periodEnd: nextMonth,
        status: 'VERIFIED', // Auto-verified for cash payment by admin
        verifiedBy: verifier?.id,
        verifiedAt: now,
        note: `${note || ''} | Diinput oleh ${session.user.role}: ${session.user.name}`,
        paymentProof: null, // No proof for cash payment
        createdAt: now,
        updatedAt: now,
      },
    });

    // Update supplier to ACTIVE immediately (cash payment is instant)
    await prisma.suppliers.update({
      where: { id: supplier.id },
      data: {
        status: 'ACTIVE',
        paymentStatus: 'PAID_APPROVED',
        isActive: true,
        isPaymentActive: true,
        lastPaymentDate: now,
        nextPaymentDue: nextMonth,
        updatedAt: now,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Pembayaran cash berhasil! Supplier sekarang ACTIVE.',
      data: {
        paymentId: payment.id,
        supplierId: supplier.id,
        supplierName: supplier.businessName,
        amount: parseFloat(amount),
        paymentMethod: 'CASH',
        status: 'ACTIVE',
        nextPaymentDue: nextMonth,
        inputBy: session.user.name,
        inputByRole: session.user.role,
      },
    });
  } catch (error) {
    console.error('Cash payment input error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logFromRequest } from '@/lib/activity-logger';

// POST /api/suppliers/[id]/verify-payment - Verify supplier payment (Super Admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: supplierId } = await params;
    const body = await request.json();
    const { approve } = body; // true = approve, false = reject

    // Check if supplier exists
    const supplier = await prisma.suppliers.findUnique({
      where: { id: supplierId },
      include: {
        supplier_payments: {
          where: {
            status: 'PENDING',
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier tidak ditemukan' },
        { status: 404 }
      );
    }

    if (!supplier.supplier_payments || supplier.supplier_payments.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Tidak ada pembayaran yang menunggu verifikasi' },
        { status: 400 }
      );
    }

    const payment = supplier.supplier_payments[0];

    if (approve) {
      // Approve payment
      await prisma.$transaction([
        // Update payment status
        prisma.supplier_payments.update({
          where: { id: payment.id },
          data: {
            status: 'VERIFIED',
            verifiedAt: new Date(),
          },
        }),
        // Update supplier payment status
        prisma.suppliers.update({
          where: { id: supplierId },
          data: {
            paymentStatus: 'PAID_APPROVED',
            lastPaymentDate: new Date(),
          },
        }),
      ]);

      // Log activity
      await logFromRequest(
        request,
        'SUPPLIER_VERIFY_PAYMENT',
        'SUPPLIER',
        `Verified payment for supplier: ${supplier.businessName}`,
        {
          supplierId,
          businessName: supplier.businessName,
          paymentId: payment.id,
          amount: Number(payment.amount),
          action: 'APPROVED',
        }
      ).catch((err) => console.error('[Activity Logger] Failed to log payment verification:', err));

      return NextResponse.json({
        success: true,
        message: 'Pembayaran berhasil diverifikasi',
      });
    } else {
      // Reject payment
      await prisma.$transaction([
        // Update payment status
        prisma.supplier_payments.update({
          where: { id: payment.id },
          data: {
            status: 'REJECTED',
            note: 'Bukti pembayaran ditolak oleh admin',
          },
        }),
        // Update supplier payment status
        prisma.suppliers.update({
          where: { id: supplierId },
          data: {
            paymentStatus: 'PAID_REJECTED',
          },
        }),
      ]);

      // Log activity
      await logFromRequest(
        request,
        'SUPPLIER_REJECT_PAYMENT',
        'SUPPLIER',
        `Rejected payment for supplier: ${supplier.businessName}`,
        {
          supplierId,
          businessName: supplier.businessName,
          paymentId: payment.id,
          amount: Number(payment.amount),
          action: 'REJECTED',
        }
      ).catch((err) => console.error('[Activity Logger] Failed to log payment rejection:', err));

      return NextResponse.json({
        success: true,
        message: 'Pembayaran ditolak',
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

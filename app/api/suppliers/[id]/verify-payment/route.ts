import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    const supplier = await prisma.supplier_profiles.findUnique({
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
        prisma.supplier_profiles.update({
          where: { id: supplierId },
          data: {
            paymentStatus: 'PAID_APPROVED',
            lastPaymentDate: new Date(),
          },
        }),
      ]);

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
        prisma.supplier_profiles.update({
          where: { id: supplierId },
          data: {
            paymentStatus: 'PAID_REJECTED',
          },
        }),
      ]);

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

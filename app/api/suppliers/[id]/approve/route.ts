import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/suppliers/[id]/approve - Approve supplier (Super Admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: supplierId } = await params;

    // Check if supplier exists
    const supplier = await prisma.supplier_profiles.findUnique({
      where: { id: supplierId },
    });

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if payment has been approved
    if (supplier.paymentStatus !== 'PAID_APPROVED') {
      return NextResponse.json(
        { success: false, error: 'Pembayaran belum diverifikasi. Verifikasi pembayaran terlebih dahulu.' },
        { status: 400 }
      );
    }

    // Approve supplier and set to ACTIVE
    const updatedSupplier = await prisma.supplier_profiles.update({
      where: { id: supplierId },
      data: {
        status: 'ACTIVE',
        approvedAt: new Date(),
        isPaymentActive: true,
        // Set next payment due to 30 days from now
        nextPaymentDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Supplier berhasil diapprove dan diaktifkan',
      data: updatedSupplier,
    });
  } catch (error) {
    console.error('Error approving supplier:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

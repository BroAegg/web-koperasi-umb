import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withActivityLog } from '@/lib/with-activity-log';

// POST /api/suppliers/[id]/approve - Approve supplier (Super Admin only)
async function handleApproveSupplier(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: supplierId } = await params;

    // Check if supplier exists
    const supplier = await prisma.suppliers.findUnique({
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

    // Approve supplier and set to APPROVED
    const updatedSupplier = await prisma.suppliers.update({
      where: { id: supplierId },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        isPaymentActive: true,
        // Set next payment due to 30 days from now
        nextPaymentDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Supplier berhasil diapprove dan diaktifkan',
      data: {
        ...updatedSupplier,
        supplierName: supplier.businessName,
      },
    });
  } catch (error) {
    console.error('Error approving supplier:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = withActivityLog({
  module: 'SUPPLIER',
  action: 'APPROVE_SUPPLIER',
  getDescription: (req, result) => {
    const data = result?.data;
    return data?.supplierName
      ? `Approved supplier: ${data.supplierName}`
      : 'Approved supplier';
  },
  getMetadata: (req, result) => {
    const data = result?.data;
    return data
      ? {
          supplierId: data.id,
          businessName: data.businessName,
          email: data.email,
          status: data.status,
        }
      : undefined;
  },
})(handleApproveSupplier);
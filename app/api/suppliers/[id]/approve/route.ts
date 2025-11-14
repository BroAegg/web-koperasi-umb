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

    // Check if supplier is PENDING
    if (supplier.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, error: 'Supplier sudah di-approve atau ditolak sebelumnya.' },
        { status: 400 }
      );
    }

    // Approve supplier - status APPROVED means waiting for payment
    const updatedSupplier = await prisma.suppliers.update({
      where: { id: supplierId },
      data: {
        status: 'APPROVED', // Approved but needs to pay first
        approvedAt: new Date(),
        isActive: false, // Will be true after payment verified
        isPaymentActive: false, // Will be true after payment verified
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Supplier berhasil diapprove. Supplier akan diminta untuk melakukan pembayaran biaya aktivasi.',
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
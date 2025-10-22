import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withActivityLog } from '@/lib/with-activity-log';

// POST /api/suppliers/[id]/reject - Reject supplier (Super Admin only)
async function handleRejectSupplier(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: supplierId } = await params;
    const body = await request.json();
    const { reason } = body;

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { success: false, error: 'Alasan penolakan wajib diisi' },
        { status: 400 }
      );
    }

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

    // Reject supplier
    const updatedSupplier = await prisma.suppliers.update({
      where: { id: supplierId },
      data: {
        status: 'REJECTED',
        rejectedReason: reason,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Supplier berhasil ditolak',
      data: {
        ...updatedSupplier,
        supplierName: supplier.businessName,
        rejectionReason: reason,
      },
    });
  } catch (error) {
    console.error('Error rejecting supplier:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = withActivityLog({
  module: 'SUPPLIER',
  action: 'REJECT_SUPPLIER',
  getDescription: (req, result) => {
    const data = result?.data;
    return data?.supplierName
      ? `Rejected supplier: ${data.supplierName} - Reason: ${data.rejectionReason}`
      : 'Rejected supplier';
  },
  getMetadata: (req, result) => {
    const data = result?.data;
    return data
      ? {
          supplierId: data.id,
          businessName: data.businessName,
          email: data.email,
          status: data.status,
          reason: data.rejectedReason,
        }
      : undefined;
  },
})(handleRejectSupplier);
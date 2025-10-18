import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/suppliers/[id]/reject - Reject supplier (Super Admin only)
export async function POST(
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
    const supplier = await prisma.supplier_profiles.findUnique({
      where: { id: supplierId },
    });

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier tidak ditemukan' },
        { status: 404 }
      );
    }

    // Reject supplier
    const updatedSupplier = await prisma.supplier_profiles.update({
      where: { id: supplierId },
      data: {
        status: 'REJECTED',
        rejectedReason: reason,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Supplier berhasil ditolak',
      data: updatedSupplier,
    });
  } catch (error) {
    console.error('Error rejecting supplier:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

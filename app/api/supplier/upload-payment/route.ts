import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// POST /api/supplier/upload-payment - Upload payment proof with file validation
export async function POST(request: NextRequest) {
  try {
    // Get session from NextAuth
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = session.user;
    if (user.role !== 'SUPPLIER') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Supplier only' },
        { status: 403 }
      );
    }

    // Get supplier data
    const supplier = await prisma.suppliers.findFirst({
      where: { email: user.email },
    });

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier profile not found' },
        { status: 404 }
      );
    }

    // Check if supplier is APPROVED (waiting for payment)
    if (supplier.status !== 'APPROVED') {
      return NextResponse.json(
        { success: false, error: 'Supplier belum di-approve oleh admin atau sudah aktif' },
        { status: 400 }
      );
    }

    // Parse JSON body (not FormData, since we're sending base64)
    const body = await request.json();
    const paymentProof = body.paymentProof; // base64 string
    const amount = body.amount;

    // Validation: Payment proof must be provided
    if (!paymentProof) {
      return NextResponse.json(
        { success: false, error: 'Bukti pembayaran wajib diupload' },
        { status: 400 }
      );
    }

    // Validation: Amount must be provided
    if (!amount) {
      return NextResponse.json(
        { success: false, error: 'Jumlah pembayaran wajib diisi' },
        { status: 400 }
      );
    }

    // Store base64 payment proof (or upload to cloud storage in production)
    const filename = `payment-${supplier.id}-${Date.now()}.jpg`;
    const paymentProofPath = paymentProof; // Store base64 directly for now

    // Create payment record
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    const payment = await prisma.supplier_payments.create({
      data: {
        id: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        supplierId: supplier.id,
        amount: parseFloat(amount),
        paymentMethod: 'TRANSFER',
        paymentDate: now,
        paymentProof: paymentProofPath,
        status: 'PENDING',
        periodStart: now,
        periodEnd: nextMonth,
        createdAt: now,
        updatedAt: now,
      },
    });

    // Update supplier payment status
    await prisma.suppliers.update({
      where: { id: supplier.id },
      data: {
        paymentStatus: 'PAID_PENDING_APPROVAL',
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Bukti pembayaran berhasil diupload. Menunggu verifikasi admin.',
      data: {
        ...payment,
        filename,
      },
    });
  } catch (error) {
    console.error('Error uploading payment:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

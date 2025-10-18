import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';

// POST /api/supplier/upload-payment - Upload payment proof with file validation
export async function POST(request: NextRequest) {
  try {
    // Get user from token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await getUserFromToken(token);
    if (!user || user.role !== 'SUPPLIER') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Supplier only' },
        { status: 403 }
      );
    }

    // Get supplier profile
    const supplier = await prisma.supplier_profiles.findFirst({
      where: { email: user.email },
    });

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier profile not found' },
        { status: 404 }
      );
    }

    // Parse form data for file upload
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const amount = formData.get('amount') as string;

    // Validation: File must be provided
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validation: Amount must be provided
    if (!amount) {
      return NextResponse.json(
        { success: false, error: 'Payment amount is required' },
        { status: 400 }
      );
    }

    // Validation: File must be an image
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'File must be an image (jpg, png, webp)' },
        { status: 400 }
      );
    }

    // Validation: File size max 5MB
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 5MB' },
        { status: 400 }
      );
    }

    // TODO: Upload file to storage (cloud storage or local)
    // For now, we'll just store the filename
    const filename = `payment-${supplier.id}-${Date.now()}-${file.name}`;
    
    // In production, you would:
    // 1. Upload to cloud storage (AWS S3, Google Cloud Storage, etc.)
    // 2. Get the URL
    // 3. Store the URL in database
    
    // For now, we'll use a placeholder path
    const paymentProofPath = `/uploads/payments/${filename}`;

    // Create payment record
    const payment = await prisma.supplier_payments.create({
      data: {
        id: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        supplierProfileId: supplier.id,
        amount: parseFloat(amount),
        paymentProof: paymentProofPath,
        status: 'PENDING',
        periodStart: new Date(),
        periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        updatedAt: new Date(),
      },
    });

    // Update supplier payment status
    await prisma.supplier_profiles.update({
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
        fileSize: file.size,
        fileType: file.type,
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

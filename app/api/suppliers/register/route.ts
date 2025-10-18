import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { randomUUID } from 'crypto';

// POST - Register new supplier (direct registration with password + payment proof)
export async function POST(request: NextRequest) {
  console.log('Supplier registration request received');
  
  try {
    // Parse FormData (instead of JSON)
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const category = formData.get('category') as string;
    const address = formData.get('address') as string;
    const description = formData.get('description') as string;
    const password = formData.get('password') as string;
    const paymentMethod = formData.get('paymentMethod') as string;
    const paymentProofFile = formData.get('paymentProof') as File | null;

    console.log('Registration data:', { name, email, phone, category, paymentMethod, hasFile: !!paymentProofFile });

    // Validation
    if (!name || !email || !phone || !category || !address || !password) {
      console.log('Missing required fields');
      return NextResponse.json(
        { success: false, error: 'Semua field wajib diisi' },
        { status: 400 }
      );
    }

    // Password validation
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password minimal 8 karakter' },
        { status: 400 }
      );
    }

    // Payment proof validation
    if (!paymentProofFile) {
      return NextResponse.json(
        { success: false, error: 'Bukti pembayaran wajib diupload' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!paymentProofFile.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'File harus berupa gambar (JPG, PNG, WebP)' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (paymentProofFile.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'Ukuran file maksimal 5MB' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingSupplier = await prisma.supplier_profiles.findUnique({
      where: { email },
    });

    if (existingSupplier) {
      console.log('Email already registered:', email);
      return NextResponse.json(
        { success: false, error: 'Email sudah terdaftar. Gunakan email lain.' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create supplier profile (without user account first)
    const supplierProfile = await prisma.supplier_profiles.create({
      data: {
        id: randomUUID(),
        businessName: name,
        ownerName: name,
        email: email,
        password: hashedPassword,
        phone: phone,
        productCategory: category,
        address: address,
        description: description || null,
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        updatedAt: new Date(),
      },
    });

    console.log('Supplier profile created:', supplierProfile.id);

    // Save payment proof (in production, upload to cloud storage)
    // For now, we'll store the filename and create a payment record
    const filename = `payment-${supplierProfile.id}-${Date.now()}-${paymentProofFile.name}`;
    const paymentProofPath = `/uploads/payments/${filename}`;

    // TODO: In production, upload file to cloud storage here
    // For now, we just store the path
    
    // Create payment record
    const payment = await prisma.supplier_payments.create({
      data: {
        id: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        supplierProfileId: supplierProfile.id,
        amount: 25000, // Monthly fee
        paymentProof: paymentProofPath,
        status: 'PENDING',
        periodStart: new Date(),
        periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        updatedAt: new Date(),
      },
    });

    console.log('Payment record created:', payment.id);

    // Update supplier payment status
    await prisma.supplier_profiles.update({
      where: { id: supplierProfile.id },
      data: {
        paymentStatus: 'PAID_PENDING_APPROVAL',
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Registrasi berhasil! Bukti pembayaran telah diterima. Silakan login dengan email dan password Anda.',
      data: {
        id: supplierProfile.id,
        name: supplierProfile.businessName,
        email: supplierProfile.email,
        status: supplierProfile.status,
        paymentStatus: 'PAID_PENDING_APPROVAL',
        paymentId: payment.id,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Terjadi kesalahan saat mendaftar. Silakan coba lagi.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

// POST - Register new supplier (direct registration with password)
export async function POST(request: NextRequest) {
  console.log('Supplier registration request received');
  
  try {
    const body = await request.json();
    console.log('Registration data:', { ...body, password: '[REDACTED]' });

    const { name, email, phone, category, address, description, password } = body;

    // Validation
    if (!name || !email || !phone || !category || !address || !password) {
      console.log('Missing required fields');
      return NextResponse.json(
        { success: false, error: 'Semua field wajib diisi kecuali deskripsi' },
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

    // Check if email already exists
    const existingSupplier = await prisma.supplierProfile.findUnique({
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
    const supplierProfile = await prisma.supplierProfile.create({
      data: {
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
      },
    });

    console.log('Supplier profile created:', supplierProfile.id);

    return NextResponse.json({
      success: true,
      message: 'Registrasi berhasil! Silakan login dengan email dan password Anda.',
      data: {
        id: supplierProfile.id,
        name: supplierProfile.businessName,
        email: supplierProfile.email,
        status: supplierProfile.status,
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

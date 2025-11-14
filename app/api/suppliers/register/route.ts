import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { randomUUID } from 'crypto';

// POST - Register new supplier (simple registration without payment proof)
export async function POST(request: NextRequest) {
  try {
    // Parse JSON body
    const body = await request.json();
    
    const { name, email, phone, category, address, description, password } = body;

    // Validation
    if (!name || !email || !phone || !category || !address || !password) {
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

    // Check if email already exists
    const existingSupplier = await prisma.suppliers.findUnique({
      where: { email },
    });

    if (existingSupplier) {
      return NextResponse.json(
        { success: false, error: 'Email sudah terdaftar. Gunakan email lain.' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate supplier code
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const supplierCode = `SUP-${dateStr}-${randomSuffix}`;

    // Create supplier with PENDING status (waiting for admin review)
    const supplier = await prisma.suppliers.create({
      data: {
        id: randomUUID(),
        code: supplierCode,
        businessName: name,
        ownerName: name,
        email: email,
        password: hashedPassword,
        phone: phone,
        productCategory: category,
        address: address,
        description: description || null,
        status: 'PENDING', // Waiting for admin review
        paymentStatus: 'UNPAID', // Payment will be done after approval
        isActive: false,
        isPaymentActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Registrasi berhasil! Silakan tunggu persetujuan admin. Kami akan menghubungi Anda melalui email.',
      data: {
        id: supplier.id,
        name: supplier.businessName,
        email: supplier.email,
        status: supplier.status,
        paymentStatus: supplier.paymentStatus,
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

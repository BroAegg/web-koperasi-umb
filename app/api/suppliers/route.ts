import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

// POST - Register new supplier
export async function POST(request: NextRequest) {
  console.log('Supplier registration request received');
  
  try {
    const body = await request.json();
    console.log('Registration data:', { ...body, password: '[REDACTED]' });

    const { name, email, phone, category, address, description } = body;

    // Validation
    if (!name || !email || !phone || !category || !address) {
      console.log('Missing required fields');
      return NextResponse.json(
        { success: false, error: 'Semua field wajib diisi kecuali deskripsi' },
        { status: 400 }
      );
    }

    // Check if email already exists in users
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('Email already registered:', email);
      return NextResponse.json(
        { success: false, error: 'Email sudah terdaftar. Gunakan email lain.' },
        { status: 409 }
      );
    }

    // Generate default password (supplier will receive via email in production)
    const defaultPassword = 'Supplier123!';
    const hashedPassword = await hashPassword(defaultPassword);

    // Create user with SUPPLIER role
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'SUPPLIER',
        isActive: false, // Will be activated after approval
      },
    });

    console.log('User created:', user.id);

    // Create supplier profile
    const supplierProfile = await prisma.supplierProfile.create({
      data: {
        userId: user.id,
        businessName: name,
        ownerName: name,
        phone,
        address,
        productCategory: category,
        description: description || null,
        status: 'PENDING',
        monthlyFee: 25000,
        isPaymentActive: false,
      },
    });

    console.log('Supplier profile created:', supplierProfile.id);

    // In production, send email with credentials
    // await sendEmail(email, 'Welcome', `Your password is: ${defaultPassword}`);

    return NextResponse.json({
      success: true,
      message: 'Pendaftaran berhasil. Menunggu persetujuan admin.',
      data: {
        id: supplierProfile.id,
        name: supplierProfile.businessName,
        email: user.email,
        status: supplierProfile.status,
      },
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error registering supplier:', error);
    
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Email sudah terdaftar' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Gagal mendaftar. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}

// GET - Get all suppliers (for admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status) {
      where.status = status.toUpperCase();
    }

    const suppliers = await prisma.supplierProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            isActive: true,
            createdAt: true,
          },
        },
        payments: {
          orderBy: { paymentDate: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: suppliers,
    });

  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data supplier' },
      { status: 500 }
    );
  }
}

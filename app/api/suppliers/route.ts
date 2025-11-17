import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
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
    const existingUser = await prisma.users.findUnique({
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
    const user = await prisma.users.create({
      data: {
        id: randomUUID(),
        email,
        name,
        password: hashedPassword,
        role: 'SUPPLIER',
        isActive: false, // Will be activated after approval
        updatedAt: new Date(),
      },
    });

    console.log('User created:', user.id);

    // Generate supplier code
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
    const supplierCode = `SUP-${dateStr}-${randomSuffix}`;

    // Create supplier in unified table
    const supplier = await prisma.suppliers.create({
      data: {
        id: randomUUID(),
        code: supplierCode,
        businessName: name,
        ownerName: name,
        email,
        password: hashedPassword,
        phone,
        address,
        productCategory: category,
        description: description || null,
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        monthlyFee: 25000,
        isPaymentActive: false,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log('Supplier created:', supplier.id, 'Code:', supplier.code);

    // In production, send email with credentials
    // await sendEmail(email, 'Welcome', `Your password is: ${defaultPassword}`);

    return NextResponse.json({
      success: true,
      message: 'Pendaftaran berhasil. Menunggu persetujuan admin.',
      data: {
        id: supplier.id,
        code: supplier.code,
        name: supplier.businessName,
        email: supplier.email,
        status: supplier.status,
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

    const suppliers = await prisma.suppliers.findMany({
      where,
      include: {
        supplier_payments: {
          where: {
            status: 'PENDING'
          },
          orderBy: {
            paymentDate: 'desc'
          },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    // Map to match frontend expectations
    const mappedSuppliers = suppliers.map(supplier => ({
      id: supplier.id,
      code: supplier.code,
      businessName: supplier.businessName,
      ownerName: supplier.ownerName,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      productCategory: supplier.productCategory,
      preferredPaymentMethod: supplier.preferredPaymentMethod,
      monthlyFee: supplier.monthlyFee,
      status: supplier.status,
      paymentStatus: supplier.paymentStatus,
      isActive: supplier.isActive,
      rejectedReason: supplier.rejectedReason,
      createdAt: supplier.createdAt,
      updatedAt: supplier.updatedAt,
      supplier_payments: supplier.supplier_payments
    }));

    return NextResponse.json({
      success: true,
      data: mappedSuppliers,
    });

  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data supplier' },
      { status: 500 }
    );
  }
}

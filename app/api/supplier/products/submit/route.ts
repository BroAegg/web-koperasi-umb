/**
 * API: Submit Product for Approval
 * POST /api/supplier/products/submit
 * 
 * Supplier submits new product for admin approval
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'SUPPLIER') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get supplier by email
    const supplier = await prisma.suppliers.findUnique({
      where: { email: session.user.email },
    });

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier not found' },
        { status: 404 }
      );
    }

    // Check if supplier is active
    if (supplier.status !== 'ACTIVE' && supplier.status !== 'APPROVED') {
      return NextResponse.json(
        { success: false, error: 'Akun supplier belum aktif. Harap lengkapi pembayaran fee bulanan.' },
        { status: 403 }
      );
    }

    // Check if suspended for payment
    if (supplier.isSuspendedForPayment) {
      return NextResponse.json(
        { success: false, error: 'Akun tersuspend karena pembayaran tertunggak. Harap selesaikan pembayaran terlebih dahulu.' },
        { status: 403 }
      );
    }

    // Check product limit
    if (supplier.currentActiveProducts >= supplier.maxActiveProducts) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Anda telah mencapai batas maksimal ${supplier.maxActiveProducts} produk aktif. Harap hubungi admin untuk peningkatan limit.` 
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, categoryId, price, stockInitial, unit, image } = body;

    // Validation
    if (!name || !categoryId || !price || !stockInitial) {
      return NextResponse.json(
        { success: false, error: 'Nama produk, kategori, harga, dan stok awal harus diisi' },
        { status: 400 }
      );
    }

    if (price <= 0 || stockInitial < 0) {
      return NextResponse.json(
        { success: false, error: 'Harga dan stok tidak valid' },
        { status: 400 }
      );
    }

    // Create submission
    const submission = await prisma.product_submissions.create({
      data: {
        id: randomUUID(),
        supplierId: supplier.id,
        name,
        description: description || null,
        categoryId,
        price: price,
        stockInitial,
        unit: unit || 'pcs',
        image: image || null,
        status: 'PENDING_REVIEW',
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Produk berhasil diajukan dan menunggu persetujuan admin',
      data: submission,
    });
  } catch (error) {
    console.error('Submit product error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/supplier/products/submit
 * Get all submissions for current supplier
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[Supplier Submit GET] Starting...');
    const session = await getServerSession(authOptions);
    console.log('[Supplier Submit GET] Session:', session?.user?.email, session?.user?.role);

    if (!session || session.user.role !== 'SUPPLIER') {
      console.log('[Supplier Submit GET] Unauthorized - no session or not supplier');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get supplier by email
    const supplier = await prisma.suppliers.findUnique({
      where: { email: session.user.email },
    });
    console.log('[Supplier Submit GET] Supplier found:', supplier?.id, supplier?.status);

    if (!supplier) {
      console.log('[Supplier Submit GET] Supplier not found in DB');
      return NextResponse.json(
        { success: false, error: 'Supplier not found' },
        { status: 404 }
      );
    }

    // Get all submissions
    const submissions = await prisma.product_submissions.findMany({
      where: {
        supplierId: supplier.id,
      },
      include: {
        category: true,
        reviewer: {
          select: {
            name: true,
            email: true,
          },
        },
        approvedProduct: {
          select: {
            id: true,
            name: true,
            stock: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        submissions,
        summary: {
          total: submissions.length,
          pending: submissions.filter((s: any) => s.status === 'PENDING_REVIEW').length,
          approved: submissions.filter((s: any) => s.status === 'APPROVED').length,
          rejected: submissions.filter((s: any) => s.status === 'REJECTED').length,
          resubmitted: submissions.filter((s: any) => s.status === 'RESUBMITTED').length,
        },
        limits: {
          maxActiveProducts: supplier.maxActiveProducts,
          currentActiveProducts: supplier.currentActiveProducts,
          remaining: supplier.maxActiveProducts - supplier.currentActiveProducts,
        },
      },
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

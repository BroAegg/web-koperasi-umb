import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

/**
 * GET /api/supplier/products/restock
 * Get all restock requests for current supplier
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get supplier from session email
    const supplier = await prisma.suppliers.findUnique({
      where: { email: session.user.email! },
    });

    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    }

    // Get all stock requests for this supplier
    const requests = await prisma.stock_requests.findMany({
      where: {
        supplierId: supplier.id,
      },
      include: {
        product: {
          include: {
            categories: true,
          },
        },
        reviewer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        requestedAt: 'desc',
      },
    });

    const summary = {
      total: requests.length,
      pending: requests.filter((r: any) => r.status === 'PENDING').length,
      approved: requests.filter((r: any) => r.status === 'APPROVED').length,
      rejected: requests.filter((r: any) => r.status === 'REJECTED').length,
      completed: requests.filter((r: any) => r.status === 'COMPLETED').length,
    };

    return NextResponse.json({
      success: true,
      data: {
        requests,
        summary,
      },
    });
  } catch (error) {
    console.error('Error fetching restock requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch restock requests' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/supplier/products/restock
 * Create new restock request
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get supplier from session email
    const supplier = await prisma.suppliers.findUnique({
      where: { email: session.user.email! },
      select: {
        id: true,
        status: true,
        isSuspendedForPayment: true,
      },
    });

    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    }

    // Check if supplier is active
    if (supplier.status !== 'ACTIVE' && supplier.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Akun supplier Anda belum aktif. Harap hubungi admin.' },
        { status: 403 }
      );
    }

    // Check if suspended for payment
    if (supplier.isSuspendedForPayment) {
      return NextResponse.json(
        {
          error:
            'Akun Anda ditangguhkan karena pembayaran tertunggak. Harap selesaikan pembayaran terlebih dahulu.',
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { productId, qtyRequested, reason } = body;

    // Validate required fields
    if (!productId || !qtyRequested) {
      return NextResponse.json(
        { error: 'Product ID and quantity are required' },
        { status: 400 }
      );
    }

    // Validate quantity
    if (qtyRequested <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be greater than 0' },
        { status: 400 }
      );
    }

    // Get product details
    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        stock: true,
        supplierId: true,
        isActive: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check if product belongs to this supplier
    if (product.supplierId !== supplier.id) {
      return NextResponse.json(
        { error: 'Product does not belong to your supplier account' },
        { status: 403 }
      );
    }

    // Check if product is active
    if (!product.isActive) {
      return NextResponse.json(
        { error: 'Product is not active' },
        { status: 400 }
      );
    }

    // Check if there's already a pending request for this product
    const existingPendingRequest = await prisma.stock_requests.findFirst({
      where: {
        productId: productId,
        supplierId: supplier.id,
        status: 'PENDING',
      },
    });

    if (existingPendingRequest) {
      return NextResponse.json(
        {
          error:
            'Anda sudah memiliki permintaan restock yang sedang menunggu untuk produk ini. Harap tunggu hingga disetujui atau ditolak.',
        },
        { status: 400 }
      );
    }

    // Create restock request
    const request = await prisma.stock_requests.create({
      data: {
        id: uuidv4(),
        supplierId: supplier.id,
        productId: productId,
        qtyRequested: qtyRequested,
        currentStock: product.stock,
        reason: reason || null,
        status: 'PENDING',
      },
      include: {
        product: {
          include: {
            categories: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Restock request submitted successfully',
        data: request,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating restock request:', error);
    return NextResponse.json(
      { error: 'Failed to create restock request' },
      { status: 500 }
    );
  }
}

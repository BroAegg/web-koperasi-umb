/**
 * API: Search Supplier Products (Admin only)
 * GET /api/admin/products/search
 * 
 * Admin can search all supplier products for stock management
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin only' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const supplierId = searchParams.get('supplierId');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build where clause
    const where: any = {
      ownershipType: 'SUPPLIER',
      supplierId: { not: null },
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { supplier: { businessName: { contains: search } } },
      ];
    }

    if (supplierId) {
      where.supplierId = supplierId;
    }

    // Get products
    const products = await prisma.products.findMany({
      where,
      include: {
        supplier: {
          select: {
            id: true,
            businessName: true,
            email: true,
            phone: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: {
        products,
        total: products.length,
      },
    });

  } catch (error: any) {
    console.error('Search products error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * API: Supplier List (Admin)
 * GET /api/admin/suppliers
 * 
 * Admin can view and manage all suppliers
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
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const paymentStatus = searchParams.get('paymentStatus');

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (paymentStatus === 'suspended') {
      where.isSuspendedForPayment = true;
    } else if (paymentStatus === 'active') {
      where.isSuspendedForPayment = false;
    }

    if (search) {
      where.OR = [
        { businessName: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    // Get suppliers
    const suppliers = await prisma.suppliers.findMany({
      where,
      include: {
        _count: {
          select: {
            products: true,
            stock_requests: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get summary
    const summary = {
      total: suppliers.length,
      active: suppliers.filter(s => s.status === 'ACTIVE' || s.status === 'APPROVED').length,
      pending: suppliers.filter(s => s.status === 'PENDING').length,
      suspended: suppliers.filter(s => s.isSuspendedForPayment).length,
    };

    return NextResponse.json({
      success: true,
      data: {
        suppliers,
        summary,
      },
    });

  } catch (error: any) {
    console.error('Get suppliers error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/suppliers - Update supplier (suspend/activate)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Super Admin only' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { supplierId, action } = body;

    if (!supplierId || !action) {
      return NextResponse.json(
        { success: false, error: 'Supplier ID and action are required' },
        { status: 400 }
      );
    }

    const supplier = await prisma.suppliers.findUnique({
      where: { id: supplierId },
    });

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier not found' },
        { status: 404 }
      );
    }

    let updateData: any = {};

    switch (action) {
      case 'suspend':
        updateData = {
          isSuspendedForPayment: true,
          suspendedAt: new Date(),
        };
        break;
      case 'unsuspend':
        updateData = {
          isSuspendedForPayment: false,
          suspendedAt: null,
        };
        break;
      case 'activate':
        updateData = {
          status: 'ACTIVE',
          isSuspendedForPayment: false,
        };
        break;
      case 'deactivate':
        updateData = {
          status: 'SUSPENDED',
        };
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    const updatedSupplier = await prisma.suppliers.update({
      where: { id: supplierId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: `Supplier ${action} successfully`,
      data: { supplier: updatedSupplier },
    });

  } catch (error: any) {
    console.error('Update supplier error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

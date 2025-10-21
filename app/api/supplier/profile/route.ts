import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';

// GET /api/supplier/profile - Get supplier profile info
export async function GET(request: NextRequest) {
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

    // Get supplier from unified suppliers table
    const supplier = await prisma.suppliers.findUnique({
      where: { email: user.email },
      select: {
        id: true,
        code: true,
        businessName: true,
        ownerName: true,
        email: true,
        phone: true,
        address: true,
        productCategory: true,
        description: true,
        status: true,
        paymentStatus: true,
        monthlyFee: true,
        lastPaymentDate: true,
        nextPaymentDue: true,
        isPaymentActive: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: supplier, // Single unified object
    });
  } catch (error: any) {
    console.error('Error fetching supplier profile:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// PUT /api/supplier/profile - Update supplier profile
export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const { businessName, ownerName, phone, address, description } = body;

    // Get supplier from unified table
    const supplier = await prisma.suppliers.findUnique({
      where: { email: user.email },
    });

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier not found' },
        { status: 404 }
      );
    }

    // Update supplier
    const updated = await prisma.suppliers.update({
      where: { id: supplier.id },
      data: {
        businessName: businessName || supplier.businessName,
        ownerName: ownerName || supplier.ownerName,
        phone: phone || supplier.phone,
        address: address || supplier.address,
        description: description !== undefined ? description : supplier.description,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating supplier profile:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}

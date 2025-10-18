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

    // Get supplier profile from supplier_profiles
    const supplierProfile = await prisma.supplier_profiles.findFirst({
      where: { email: user.email },
      select: {
        id: true,
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
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!supplierProfile) {
      return NextResponse.json(
        { success: false, error: 'Supplier profile not found' },
        { status: 404 }
      );
    }

    // Get supplier from suppliers table (for products relation)
    const supplier = await prisma.suppliers.findFirst({
      where: { email: user.email },
      select: {
        id: true,
        code: true,
        name: true,
        contact: true,
        phone: true,
        email: true,
        address: true,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        profile: supplierProfile,
        supplier: supplier,
      },
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

    // Get supplier profile
    const supplierProfile = await prisma.supplier_profiles.findFirst({
      where: { email: user.email },
    });

    if (!supplierProfile) {
      return NextResponse.json(
        { success: false, error: 'Supplier profile not found' },
        { status: 404 }
      );
    }

    // Update profile
    const updated = await prisma.supplier_profiles.update({
      where: { id: supplierProfile.id },
      data: {
        businessName: businessName || supplierProfile.businessName,
        ownerName: ownerName || supplierProfile.ownerName,
        phone: phone || supplierProfile.phone,
        address: address || supplierProfile.address,
        description: description !== undefined ? description : supplierProfile.description,
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

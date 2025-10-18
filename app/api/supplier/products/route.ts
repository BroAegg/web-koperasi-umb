import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';
import { randomUUID } from 'crypto';
import { Decimal } from '@prisma/client/runtime/library';

// GET /api/supplier/products - Get supplier's own products only
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

    // Get supplier from suppliers table
    const supplier = await prisma.suppliers.findFirst({
      where: { email: user.email },
    });

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier not found' },
        { status: 404 }
      );
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const categoryId = searchParams.get('categoryId');
    const status = searchParams.get('status');

    // Build where clause - ONLY supplier's own products
    const where: any = {
      supplierId: supplier.id, // KEY: Filter by supplier ID
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (status) {
      where.status = status;
    }

    // Get products
    const products = await prisma.products.findMany({
      where,
      include: {
        categories: {
          select: {
            id: true,
            name: true,
          },
        },
        suppliers: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: products,
    });
  } catch (error: any) {
    console.error('Error fetching supplier products:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/supplier/products - Create new product (auto-assign to supplier)
export async function POST(request: NextRequest) {
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

    // Get supplier from suppliers table
    const supplier = await prisma.suppliers.findFirst({
      where: { email: user.email },
    });

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      categoryId,
      sku,
      buyPrice,
      sellPrice,
      stock,
      threshold,
      unit,
      ownershipType,
      stockCycle,
      isConsignment,
    } = body;

    // Validation
    if (!name || !categoryId || !sellPrice) {
      return NextResponse.json(
        { success: false, error: 'Name, category, and sell price are required' },
        { status: 400 }
      );
    }

    // Create product - auto-assign to supplier
    const product = await prisma.products.create({
      data: {
        id: randomUUID(),
        name,
        description: description || null,
        categoryId,
        sku: sku || null,
        buyPrice: buyPrice ? new Decimal(buyPrice) : null,
        sellPrice: new Decimal(sellPrice),
        avgCost: buyPrice ? new Decimal(buyPrice) : null,
        stock: stock || 0,
        threshold: threshold || 5,
        unit: unit || 'pcs',
        ownershipType: ownershipType || 'SUPPLIER',
        stockCycle: stockCycle || 'MINGGUAN',
        isConsignment: isConsignment || false,
        status: 'INACTIVE', // Default inactive until admin approves
        isActive: false, // Not active until approved
        supplierId: supplier.id, // KEY: Auto-assign supplier ID
        updatedAt: new Date(),
      },
      include: {
        categories: {
          select: {
            id: true,
            name: true,
          },
        },
        suppliers: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Product created successfully. Waiting for admin approval.',
      data: product,
    });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}

// PUT /api/supplier/products - Update product (with ownership check)
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

    // Get supplier from suppliers table
    const supplier = await prisma.suppliers.findFirst({
      where: { email: user.email },
    });

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Check if product exists and belongs to supplier
    const existingProduct = await prisma.products.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // KEY: Ownership check - supplier can ONLY edit their own products
    if (existingProduct.supplierId !== supplier.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - You can only edit your own products' },
        { status: 403 }
      );
    }

    // Prepare update data (convert prices to Decimal if provided)
    const dataToUpdate: any = {
      ...updateData,
      updatedAt: new Date(),
    };

    if (updateData.buyPrice !== undefined) {
      dataToUpdate.buyPrice = updateData.buyPrice ? new Decimal(updateData.buyPrice) : null;
    }
    if (updateData.sellPrice !== undefined) {
      dataToUpdate.sellPrice = new Decimal(updateData.sellPrice);
    }
    if (updateData.avgCost !== undefined) {
      dataToUpdate.avgCost = updateData.avgCost ? new Decimal(updateData.avgCost) : null;
    }

    // Remove fields that shouldn't be updated by supplier
    delete dataToUpdate.id;
    delete dataToUpdate.supplierId; // Can't change supplier
    delete dataToUpdate.isActive; // Only admin can activate
    delete dataToUpdate.status; // Only admin can approve

    // Update product
    const product = await prisma.products.update({
      where: { id },
      data: dataToUpdate,
      include: {
        categories: {
          select: {
            id: true,
            name: true,
          },
        },
        suppliers: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE /api/supplier/products - Delete product (with ownership check)
export async function DELETE(request: NextRequest) {
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

    // Get supplier from suppliers table
    const supplier = await prisma.suppliers.findFirst({
      where: { email: user.email },
    });

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Check if product exists and belongs to supplier
    const existingProduct = await prisma.products.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // KEY: Ownership check - supplier can ONLY delete their own products
    if (existingProduct.supplierId !== supplier.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - You can only delete your own products' },
        { status: 403 }
      );
    }

    // Check if product has transactions (prevent deletion)
    const transactionCount = await prisma.transaction_items.count({
      where: { productId: id },
    });

    if (transactionCount > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete product with existing transactions' },
        { status: 400 }
      );
    }

    // Delete product
    await prisma.products.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete product' },
      { status: 500 }
    );
  }
}

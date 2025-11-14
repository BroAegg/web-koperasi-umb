/**
 * API: Manual Stock Adjustment
 * POST /api/admin/stock/adjust
 * 
 * Admin/SuperAdmin can manually adjust stock for suppliers who bring items in person
 * or for stock corrections (damaged goods, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin only' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { productId, quantity, reason, notes } = body;

    // Validation
    if (!productId || !quantity || !reason) {
      return NextResponse.json(
        { success: false, error: 'Product ID, quantity, and reason are required' },
        { status: 400 }
      );
    }

    if (typeof quantity !== 'number' || quantity === 0) {
      return NextResponse.json(
        { success: false, error: 'Quantity must be a non-zero number' },
        { status: 400 }
      );
    }

    // Get product to verify it exists and belongs to a supplier
    const product = await prisma.products.findUnique({
      where: { id: productId },
      include: {
        supplier: {
          select: {
            id: true,
            businessName: true,
            email: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if product belongs to a supplier
    if (product.ownershipType !== 'SUPPLIER' || !product.supplierId) {
      return NextResponse.json(
        { success: false, error: 'This product does not belong to a supplier. Manual adjustment only available for supplier products.' },
        { status: 400 }
      );
    }

    const currentStock = product.stock;
    const newStock = currentStock + quantity;

    // Prevent negative stock
    if (newStock < 0) {
      return NextResponse.json(
        { success: false, error: `Cannot reduce stock below zero. Current: ${currentStock}, Requested reduction: ${Math.abs(quantity)}` },
        { status: 400 }
      );
    }

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update product stock
      const updatedProduct = await tx.products.update({
        where: { id: productId },
        data: {
          stock: newStock,
          updatedAt: new Date(),
        },
      });

      // 2. Create stock movement record
      const movementType = quantity > 0 ? 'ADJUSTMENT' : 'ADJUSTMENT';
      const movementReason = quantity > 0 
        ? `Manual stock addition: ${reason}` 
        : `Manual stock reduction: ${reason}`;
      
      const movement = await tx.stock_movements.create({
        data: {
          id: randomUUID(),
          productId,
          quantity: Math.abs(quantity),
          movementType,
          referenceType: null,
          referenceId: null,
          note: notes ? `${movementReason}. Notes: ${notes}` : movementReason,
          createdAt: new Date(),
        },
      });

      return { updatedProduct, movement };
    });

    return NextResponse.json({
      success: true,
      message: quantity > 0 
        ? `Successfully added ${quantity} units to stock` 
        : `Successfully reduced ${Math.abs(quantity)} units from stock`,
      data: {
        product: {
          id: result.updatedProduct.id,
          name: result.updatedProduct.name,
          previousStock: currentStock,
          newStock: result.updatedProduct.stock,
          adjustment: quantity,
        },
        supplier: product.supplier,
        movement: {
          id: result.movement.id,
          type: result.movement.movementType,
          quantity: result.movement.quantity,
          note: result.movement.note,
          createdAt: result.movement.createdAt,
        },
      },
    });

  } catch (error: any) {
    console.error('Manual stock adjustment error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/admin/stock/adjust - Get adjustment history
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
    const supplierId = searchParams.get('supplierId');
    const productId = searchParams.get('productId');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build where clause
    const where: any = {
      movementType: 'ADJUSTMENT',
    };

    if (productId) {
      where.productId = productId;
    } else if (supplierId) {
      where.product = {
        supplierId,
      };
    }

    // Get adjustment history
    const adjustments = await prisma.stock_movements.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            stock: true,
            supplier: {
              select: {
                id: true,
                businessName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: {
        adjustments,
        total: adjustments.length,
      },
    });

  } catch (error: any) {
    console.error('Get adjustment history error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

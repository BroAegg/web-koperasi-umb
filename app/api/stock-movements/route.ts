import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/stock-movements - Fetch all stock movements
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let where: any = {};

    if (productId) {
      where.productId = productId;
    }

    if (type) {
      where.type = type.toUpperCase();
    }

    const stockMovements = await prisma.stockMovement.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            unit: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    const total = await prisma.stockMovement.count({ where });

    return NextResponse.json({
      success: true,
      data: stockMovements,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching stock movements:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/stock-movements - Create new stock movement
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, type, quantity, note } = body;

    // Validation
    if (!productId || !type || !quantity) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (quantity <= 0) {
      return NextResponse.json(
        { success: false, error: 'Quantity must be greater than 0' },
        { status: 400 }
      );
    }

    // Validate product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if there's enough stock for OUT movements
    if (type.toUpperCase() === 'OUT' && product.stock < quantity) {
      return NextResponse.json(
        { success: false, error: `Stok tidak cukup. Stok tersedia: ${product.stock}` },
        { status: 400 }
      );
    }

    // Create stock movement
    const stockMovement = await prisma.stockMovement.create({
      data: {
        productId,
        type: type.toUpperCase(),
        quantity: parseInt(quantity),
        note: note || '',
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            unit: true,
          },
        },
      },
    });

    // Update product stock
    const stockChange = type.toUpperCase() === 'IN' ? quantity : -quantity;
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        stock: {
          increment: stockChange,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: stockMovement,
      updatedStock: updatedProduct.stock,
      message: `Stock ${type.toLowerCase() === 'in' ? 'masuk' : 'keluar'} berhasil dicatat`,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating stock movement:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
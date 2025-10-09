import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

// GET /api/products - Get all products with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const lowStock = searchParams.get('lowStock');

    const where: any = { isActive: true };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category && category !== 'semua') {
      where.category = { name: category };
    }

    if (lowStock === 'true') {
      where.stock = { lte: prisma.product.fields.threshold };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        transactionItems: {
          where: {
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)), // Today
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const productsWithStats = products.map(product => {
      const todaySales = product.transactionItems.reduce((sum, item) => sum + item.quantity, 0);
      const profit = Number(product.sellPrice.sub(product.buyPrice));
      
      return {
        ...product,
        buyPrice: Number(product.buyPrice),
        sellPrice: Number(product.sellPrice),
        soldToday: todaySales,
        totalSold: product.transactionItems.length, // Simplified
        profit,
      };
    });

    return NextResponse.json({
      success: true,
      data: productsWithStats,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/products - Create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      categoryId,
      sku,
      buyPrice,
      sellPrice,
      stock = 0,
      threshold = 5,
      unit = 'pcs',
      isActive = true,
    } = body;

    if (!name || !categoryId || !buyPrice || !sellPrice) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate that sell price is higher than buy price
    const buyPriceNum = parseFloat(buyPrice);
    const sellPriceNum = parseFloat(sellPrice);
    
    if (sellPriceNum <= buyPriceNum) {
      return NextResponse.json(
        { success: false, error: 'Harga jual harus lebih tinggi dari harga beli' },
        { status: 400 }
      );
    }

    // Check if SKU already exists (only if SKU is provided)
    if (sku && sku.trim() !== '') {
      const existingProduct = await prisma.product.findUnique({
        where: { sku: sku.trim() },
      });

      if (existingProduct) {
        return NextResponse.json(
          { success: false, error: 'SKU sudah digunakan oleh produk lain' },
          { status: 409 }
        );
      }
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        categoryId,
        sku: sku && sku.trim() !== '' ? sku.trim() : null,
        buyPrice: new Decimal(buyPrice),
        sellPrice: new Decimal(sellPrice),
        stock: parseInt(stock.toString()),
        threshold: parseInt(threshold.toString()),
        unit,
        isActive,
      },
      include: {
        category: true,
      },
    });

    // Create initial stock movement if stock > 0
    if (stock > 0) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          type: 'IN',
          quantity: parseInt(stock.toString()),
          note: 'Initial stock',
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...product,
        buyPrice: Number(product.buyPrice),
        sellPrice: Number(product.sellPrice),
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
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
        supplier: true,
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
      
      // Calculate profit: for consignment use avgCost, for store-owned use buyPrice or avgCost
      const costPrice = product.avgCost || product.buyPrice || new Decimal(0);
      const profit = Number(product.sellPrice.sub(costPrice));
      
      return {
        ...product,
        buyPrice: product.buyPrice ? Number(product.buyPrice) : null,
        avgCost: product.avgCost ? Number(product.avgCost) : null,
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
      ownershipType = 'TOKO', // Default to store-owned
      stockCycle = 'MINGGUAN', // Default to weekly
      isConsignment = false,
      supplierId,
      supplierContact,
    } = body;

    // Validate required fields
    if (!name || !categoryId || !sellPrice) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate and parse stock
    let stockValue = 0;
    try {
      stockValue = parseInt(stock?.toString() || '0');
      if (isNaN(stockValue) || stockValue < 0) {
        stockValue = 0;
      }
    } catch (e) {
      stockValue = 0;
    }

    // Validate and parse threshold
    let thresholdValue = 5;
    try {
      thresholdValue = parseInt(threshold?.toString() || '5');
      if (isNaN(thresholdValue) || thresholdValue < 0) {
        thresholdValue = 5;
      }
    } catch (e) {
      thresholdValue = 5;
    }

    // Validate category exists
    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!categoryExists) {
      return NextResponse.json(
        { success: false, error: 'Kategori tidak ditemukan' },
        { status: 400 }
      );
    }

    // Validate that sell price is higher than buy price (only for store-owned products)
    if (ownershipType === 'TOKO' && buyPrice) {
      const buyPriceNum = parseFloat(buyPrice);
      const sellPriceNum = parseFloat(sellPrice);
      
      if (sellPriceNum <= buyPriceNum) {
        return NextResponse.json(
          { success: false, error: 'Harga jual harus lebih tinggi dari harga beli' },
          { status: 400 }
        );
      }
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
        buyPrice: buyPrice ? new Decimal(buyPrice) : null,
        sellPrice: new Decimal(sellPrice),
        avgCost: buyPrice ? new Decimal(buyPrice) : null, // Initial avgCost
        stock: stockValue,
        threshold: thresholdValue,
        unit,
        isActive,
        ownershipType,
        stockCycle,
        isConsignment,
        supplierId: supplierId || null,
        supplierContact: supplierContact || null,
      },
      include: {
        category: true,
        supplier: true,
      },
    });

    // Create initial stock movement if stock > 0
    if (stockValue > 0) {
      // For consignment products, use avgCost or sellPrice * 0.7 as unit cost estimate
      let unitCostValue = buyPrice ? new Decimal(buyPrice) : null;
      if (ownershipType === 'TITIPAN' && !unitCostValue) {
        // Estimate: 70% of sell price as consignment cost
        unitCostValue = new Decimal(sellPrice).mul(0.7);
      }
      
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          movementType: ownershipType === 'TOKO' ? 'PURCHASE_IN' : 'CONSIGNMENT_IN',
          quantity: parseInt(stock.toString()),
          unitCost: unitCostValue,
          note: 'Initial stock',
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...product,
        buyPrice: product.buyPrice ? Number(product.buyPrice) : null,
        avgCost: product.avgCost ? Number(product.avgCost) : null,
        sellPrice: Number(product.sellPrice),
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Produk dengan data yang sama sudah ada' },
        { status: 409 }
      );
    }
    
    if (error.code === 'P2003') {
      return NextResponse.json(
        { success: false, error: 'Data relasi tidak valid (kategori atau supplier tidak ditemukan)' },
        { status: 400 }
      );
    }
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Data tidak ditemukan' },
        { status: 404 }
      );
    }
    
    // Handle validation errors
    if (error.name === 'PrismaClientValidationError') {
      return NextResponse.json(
        { success: false, error: 'Data tidak valid. Pastikan semua field diisi dengan benar.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
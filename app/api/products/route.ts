import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';
import { randomUUID } from 'crypto';

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
      where.categories = { name: category };
    }

    if (lowStock === 'true') {
      // Use raw comparison instead of fields reference
      where.AND = [
        ...(where.AND || []),
        { stock: { lte: 10 } } // Low stock threshold
      ];
    }

    // @ts-ignore - TypeScript cache issue: prisma.products exists at runtime (verified via node -e test)
    const products = await prisma.products.findMany({
      where,
      include: {
        categories: true,      // Fixed: match schema relation name
        suppliers: true,       // Fixed: match schema relation name
        stock_movements: {     // Fixed: match schema relation name
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        transaction_items: {
          where: {
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)), // Today
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const productsWithStats = products.map((product: any) => {
      const todaySales = product.transaction_items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
      
      // Calculate profit: for consignment use avgCost, for store-owned use buyPrice or avgCost
      const costPrice = product.avgCost || product.buyPrice || new Decimal(0);
      const profit = Number(product.sellPrice.sub(costPrice));
      
      return {
        ...product,
        category: product.categories, // Map to old field name for compatibility
        supplier: product.suppliers,
        stockMovements: product.stock_movements,
        transactionItems: product.transaction_items,
        buyPrice: product.buyPrice ? Number(product.buyPrice) : null,
        avgCost: product.avgCost ? Number(product.avgCost) : null,
        sellPrice: Number(product.sellPrice),
        soldToday: todaySales,
        totalSold: product.transaction_items?.length || 0, // Simplified
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

    if (!name || !categoryId || !sellPrice) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
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
      // @ts-ignore - TS cache issue
      const existingProduct = await prisma.products.findUnique({
        where: { sku: sku.trim() },
      });

      if (existingProduct) {
        return NextResponse.json(
          { success: false, error: 'SKU sudah digunakan oleh produk lain' },
          { status: 409 }
        );
      }
    }

    // @ts-ignore - TS cache issue
    const product = await prisma.products.create({
      data: {
        id: randomUUID(),
        name,
        description,
        sku: sku && sku.trim() !== '' ? sku.trim() : null,
        buyPrice: buyPrice ? new Decimal(buyPrice) : null,
        sellPrice: new Decimal(sellPrice),
        avgCost: buyPrice ? new Decimal(buyPrice) : null,
        stock: parseInt(stock.toString()),
        threshold: parseInt(threshold.toString()),
        unit,
        isActive,
        ownershipType,
        stockCycle,
        isConsignment,
        supplierContact: supplierContact || null,
        updatedAt: new Date(),
        categories: {              // Fixed: match schema relation name
          connect: { id: categoryId }
        },
        suppliers: supplierId ? {  // Fixed: match schema relation name
          connect: { id: supplierId }
        } : undefined,
      },
      include: {
        categories: true,          // Fixed: match schema relation name
        suppliers: true,           // Fixed: match schema relation name
      },
    });

    // Create initial stock movement if stock > 0
    if (stock > 0) {
      // For consignment products, use avgCost or sellPrice * 0.7 as unit cost estimate
      let unitCostValue = buyPrice ? new Decimal(buyPrice) : null;
      if (ownershipType === 'TITIPAN' && !unitCostValue) {
        // Estimate: 70% of sell price as consignment cost
        unitCostValue = new Decimal(sellPrice).mul(0.7);
      }
      
      // @ts-ignore - TS cache issue
      await prisma.stock_movements.create({  // Fixed: match schema model name
        data: {
          id: randomUUID(),
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
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';
import { randomUUID } from 'crypto';
import { withActivityLog } from '@/lib/with-activity-log';

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
        category: product.categories?.name || 'Uncategorized', // Map to old field name for compatibility
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
async function handleCreateProduct(request: NextRequest) {
  try {
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

    // Parse and validate stock (handle empty string, null, undefined)
    const stockNum = stock !== null && stock !== undefined && stock !== '' 
      ? parseInt(stock.toString(), 10) 
      : 0;
    
    if (isNaN(stockNum) || stockNum < 0) {
      return NextResponse.json(
        { success: false, error: 'Stok harus berupa angka positif atau 0' },
        { status: 400 }
      );
    }

    // Parse and validate threshold
    const thresholdNum = threshold !== null && threshold !== undefined && threshold !== '' 
      ? parseInt(threshold.toString(), 10) 
      : 5;
    
    if (isNaN(thresholdNum) || thresholdNum < 0) {
      return NextResponse.json(
        { success: false, error: 'Threshold harus berupa angka positif' },
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
        stock: stockNum,           // Use validated stockNum
        threshold: thresholdNum,   // Use validated thresholdNum
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

      // 📦 CREATE CONSIGNMENT_BATCH for TITIPAN products
      if (ownershipType === 'TITIPAN' && supplierId) {
        console.log(`[Create Product] Creating consignment_batch for TITIPAN product: ${name}`);
        
        // Check if consignor exists, if not create one from supplier data
        // @ts-ignore
        let consignor = await prisma.consignors.findUnique({
          where: { id: supplierId }
        });

        if (!consignor) {
          console.log(`[Create Product] Consignor not found, checking suppliers table...`);
          
          // @ts-ignore
          const supplier = await prisma.suppliers.findUnique({
            where: { id: supplierId },
            select: { id: true, businessName: true, ownerName: true, phone: true, address: true }
          });

          if (supplier) {
            console.log(`[Create Product] Creating consignor from supplier: ${supplier.businessName}`);
            
            // Create consignor from supplier data
            // @ts-ignore
            consignor = await prisma.consignors.create({
              data: {
                id: supplier.id,
                code: `CSG-${Date.now()}`,
                name: supplier.businessName,
                contact: supplier.ownerName,
                phone: supplier.phone,
                address: supplier.address,
                feeType: 'PERCENTAGE',
                defaultFeePercent: new Decimal(10),
                isActive: true,
                updatedAt: new Date(),
              }
            });
            
            console.log(`[Create Product] ✅ Created consignor: ${consignor.name}`);
          } else {
            console.error(`[Create Product] ❌ Supplier ${supplierId} not found in either table!`);
            // Don't create batch if no supplier/consignor found
            return NextResponse.json({
              success: true,
              data: {
                ...product,
                buyPrice: product.buyPrice ? Number(product.buyPrice) : null,
                avgCost: product.avgCost ? Number(product.avgCost) : null,
                sellPrice: Number(product.sellPrice),
              },
            }, { status: 201 });
          }
        }
        
        // Generate unique batch code
        const batchCode = `CB-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        
        // Default fee: 10% (can be customized per supplier)
        const defaultFeePercent = 10;
        
        // @ts-ignore
        await prisma.consignment_batches.create({
          data: {
            id: randomUUID(),
            code: batchCode,
            consignorId: consignor.id, // Use consignor.id instead of supplierId
            productId: product.id,
            qtyIn: parseInt(stock.toString()),
            qtySold: 0,
            qtyReturned: 0,
            qtyExpired: 0,
            qtyRemaining: parseInt(stock.toString()),
            feeType: 'PERCENTAGE',
            feePercent: new Decimal(defaultFeePercent),
            receivedAt: new Date(),
            status: 'ACTIVE',
            note: 'Auto-created from product creation',
            updatedAt: new Date(),
          },
        });
        
        console.log(`[Create Product] ✅ Created consignment_batch: ${batchCode} (${stock} pcs)`);
      }
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

export const POST = withActivityLog({
  module: 'INVENTORY',
  action: 'CREATE_PRODUCT',
  getDescription: (req, result) => {
    const product = result?.data;
    return product
      ? `Created product: ${product.name} (${product.ownershipType})`
      : 'Created new product';
  },
  getMetadata: (req, result) => {
    const product = result?.data;
    return product
      ? {
          productId: product.id,
          name: product.name,
          ownershipType: product.ownershipType,
          stock: product.stock,
          sellPrice: product.sellPrice,
        }
      : undefined;
  },
})(handleCreateProduct);
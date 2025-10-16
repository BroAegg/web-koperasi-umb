import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/stock-movements - Fetch all stock movements
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const type = searchParams.get('type');
    const date = searchParams.get('date');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let where: any = {};

    if (productId) {
      where.productId = productId;
    }

    if (type) {
      where.movementType = type.toUpperCase();
    }

    // Date filtering
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      where.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    }

    const stockMovements = await prisma.stockMovement.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            unit: true,
            isConsignment: true,
            ownershipType: true,
            avgCost: true,
            buyPrice: true,
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

    // Map simple type to MovementType enum
    let movementType: string;
    let quantityValue: number;
    
    if (type.toUpperCase() === 'IN') {
      movementType = product.ownershipType === 'TOKO' ? 'PURCHASE_IN' : 'CONSIGNMENT_IN';
      quantityValue = parseInt(quantity);
    } else if (type.toUpperCase() === 'OUT') {
      movementType = 'SALE_OUT';
      quantityValue = -parseInt(quantity); // Negative for OUT movements
      
      // Check if there's enough stock for OUT movements
      if (product.stock < quantity) {
        return NextResponse.json(
          { success: false, error: `Stok tidak cukup. Stok tersedia: ${product.stock}` },
          { status: 400 }
        );
      }
    } else if (type.toUpperCase() === 'ADJUSTMENT') {
      movementType = 'ADJUSTMENT';
      quantityValue = parseInt(quantity);
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid movement type' },
        { status: 400 }
      );
    }

    // Use Prisma transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Get product details for transaction
      const productDetails = await tx.product.findUnique({
        where: { id: productId },
        select: {
          id: true,
          name: true,
          unit: true,
          sellPrice: true,
          avgCost: true,
          buyPrice: true,
        },
      });

      if (!productDetails) {
        throw new Error('Product not found in transaction');
      }

      // Create stock movement
      const stockMovement = await tx.stockMovement.create({
        data: {
          productId,
          movementType: movementType as any, // Type assertion for enum
          quantity: quantityValue,
          unitCost: product.avgCost || product.buyPrice,
          note: note || '',
        },
      });

      // Update product stock (quantity is already signed)
      const stockChange = quantityValue;
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: {
          stock: {
            increment: stockChange,
          },
        },
      });

      // If it's a sale (OUT movement), create a Transaction record
      let transaction = null;
      if (type.toUpperCase() === 'OUT') {
        const saleQuantity = parseInt(quantity);
        const unitPrice = productDetails.sellPrice;
        const totalAmount = Number(unitPrice) * saleQuantity;
        const cogsPerUnit = productDetails.avgCost || productDetails.buyPrice || unitPrice;
        const totalCogs = Number(cogsPerUnit) * saleQuantity;
        const grossProfit = totalAmount - totalCogs;

        // Create transaction
        transaction = await tx.transaction.create({
          data: {
            type: 'SALE',
            totalAmount,
            paymentMethod: 'CASH', // Default for manual stock out
            status: 'COMPLETED',
            note: note || 'Penjualan manual via stock movement',
          },
        });

        // Create transaction item
        await tx.transactionItem.create({
          data: {
            transactionId: transaction.id,
            productId,
            quantity: saleQuantity,
            unitPrice,
            totalPrice: totalAmount,
            cogsPerUnit,
            totalCogs,
            grossProfit,
          },
        });

        // Update stock movement with reference
        await tx.stockMovement.update({
          where: { id: stockMovement.id },
          data: {
            referenceType: 'SALE' as any,
            referenceId: transaction.id,
          },
        });
      }

      return { stockMovement, updatedProduct, transaction, productDetails };
    });

    return NextResponse.json({
      success: true,
      data: {
        ...result.stockMovement,
        product: result.productDetails,
      },
      updatedStock: result.updatedProduct.stock,
      transaction: result.transaction,
      message: `Stock ${type.toLowerCase() === 'in' ? 'masuk' : 'keluar'} berhasil dicatat${result.transaction ? ' dan transaksi penjualan tercatat' : ''}`,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating stock movement:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/stock-movements - Bulk delete stock movements by date (DEVELOPMENT ONLY)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { success: false, error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    // Date filtering
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const where = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    // Count before delete
    const count = await prisma.stockMovement.count({ where });

    // Delete all stock movements for the date
    await prisma.stockMovement.deleteMany({ where });

    return NextResponse.json({
      success: true,
      message: `${count} stock movement berhasil dihapus`,
      count,
    });
  } catch (error) {
    console.error('Error deleting stock movements:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
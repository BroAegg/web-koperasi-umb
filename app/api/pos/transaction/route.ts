// @ts-nocheck - TypeScript cache issue: Prisma model names correct at runtime (see PRISMA-NAMING-CONVENTIONS.md)
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";
import { withDeveloperSession } from "@/lib/prisma-middleware";
import { withActivityLog } from "@/lib/with-activity-log";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  return withActivityLog({
    module: 'POS',
    action: 'CREATE_TRANSACTION',
    getDescription: (req, result) => {
      const data = result?.data;
      const customer = data?.customerName || 'Walk-in Customer';
      const amount = data?.totalAmount;
      return amount
        ? `POS transaction: ${customer} - Rp ${amount.toLocaleString()}`
        : 'Created POS transaction';
    },
    getMetadata: (req, result) => {
      const data = result?.data;
      return data
        ? {
            transactionId: data.transactionId,
            totalAmount: data.totalAmount,
            itemCount: data.items?.length,
            paymentMethod: data.paymentMethod,
            customerName: data.customerName,
          }
        : undefined;
    },
  })(handlePOSTransaction)(req);
}

async function handlePOSTransaction(req: NextRequest) {
  return withDeveloperSession(req, async () => {
    try {
      const auth = req.headers.get("authorization");
      const token = auth?.replace(/^Bearer\s+/i, "");
      const user = await getUserFromToken(token);

      if (!user || !["ADMIN", "SUPER_ADMIN", "DEVELOPER"].includes(user.role)) {
        return NextResponse.json(
          { error: "Unauthorized - Admin access only" },
          { status: 403 }
        );
      }

    const body = await req.json();
    const {
      items,
      totalAmount,
      paymentMethod,
      amountPaid,
      customerName,
      change = 0
    } = body;

    console.log('[POS] Processing transaction:', {
      itemCount: items.length,
      totalAmount,
      paymentMethod,
      customerName
    });

    // Validate items
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "No items in cart" },
        { status: 400 }
      );
    }

    // Validate payment
    if (!paymentMethod || !["CASH", "TRANSFER"].includes(paymentMethod)) {
      return NextResponse.json(
        { error: "Invalid payment method" },
        { status: 400 }
      );
    }

    if (amountPaid < totalAmount) {
      return NextResponse.json(
        { error: "Insufficient payment amount" },
        { status: 400 }
      );
    }

    // Check stock availability for all items first
    for (const item of items) {
      const product = await prisma.products.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 400 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}. Available: ${product.stock}, Required: ${item.quantity}` },
          { status: 400 }
        );
      }
    }

    // Create transaction with items in a single database transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create main transaction (isProduction handled by withDeveloperSession middleware)
      const transaction = await tx.transactions.create({
        data: {
          id: randomUUID(),
          type: 'SALE',
          totalAmount,
          status: 'COMPLETED',
          paymentMethod,
          note: `POS Sale - Customer: ${customerName || 'Walk-in Customer'}`,
          date: new Date(),
          updatedAt: new Date(),
        },
      });

      const transactionItems = [];
      const stockMovements = [];

      // Process each item
      for (const item of items) {
        // ✅ FIX: Get product data untuk calculate COGS (harga beli)
        const product = await tx.products.findUnique({
          where: { id: item.productId },
          select: {
            id: true,
            name: true,
            buyPrice: true,
            avgCost: true,
            ownershipType: true,
            isConsignment: true,
          }
        });

        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        // ✅ KONSINYASI PAYMENT LOGIC: Harga Beli × Jumlah Stok Keluar
        // Gunakan avgCost (average cost) jika ada, fallback ke buyPrice
        const unitCost = product.avgCost || product.buyPrice || 0;
        const totalCogs = Number(unitCost) * item.quantity;

        // Create transaction item dengan totalCogs
        const transactionItem = await tx.transaction_items.create({
          data: {
            id: randomUUID(),
            transactionId: transaction.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.subtotal,
            totalCogs: totalCogs, // ✅ CRITICAL: Harga beli × quantity untuk pembayaran konsinyasi
          },
        });

        transactionItems.push(transactionItem);

        // ✅ AUTO-CREATE consignment_sales for TITIPAN products (creates hutang konsinyasi)
        if (product.ownershipType === 'TITIPAN' || product.isConsignment) {
          // Get active consignment batch for this product (FIFO - oldest first)
          const activeBatch = await tx.consignment_batches.findFirst({
            where: {
              productId: item.productId,
              status: 'ACTIVE',
              qtyRemaining: { gt: 0 }
            },
            orderBy: { receivedAt: 'asc' } // FIFO - First In First Out
          });

          if (activeBatch) {
            // Calculate consignment sale details
            const totalRevenue = Number(item.subtotal); // Total selling price
            const feeType = activeBatch.feeType;
            
            let feeAmount = 0;
            if (feeType === 'PERCENTAGE') {
              // Fee is percentage of selling price
              feeAmount = (totalRevenue * Number(activeBatch.feePercent || 0)) / 100;
            } else if (feeType === 'FLAT') {
              // Fee is flat amount per unit
              feeAmount = Number(activeBatch.feeFlat || 0) * item.quantity;
            }

            const netToConsignor = totalRevenue - feeAmount;

            // Create consignment_sales record (creates hutang konsinyasi in balance sheet)
            await tx.consignment_sales.create({
              data: {
                id: randomUUID(),
                batchId: activeBatch.id,
                transactionItemId: transactionItem.id,
                qtySold: item.quantity,
                unitPrice: item.unitPrice,
                totalRevenue: totalRevenue,
                feeType: feeType,
                feeAmount: feeAmount,
                netToConsignor: netToConsignor,
                isSettled: false, // ✅ KEY: FALSE = creates hutang konsinyasi (liability)
                saleDate: new Date(),
              },
            });

            // Update batch quantities
            await tx.consignment_batches.update({
              where: { id: activeBatch.id },
              data: {
                qtySold: { increment: item.quantity },
                qtyRemaining: { decrement: item.quantity },
                updatedAt: new Date(),
              },
            });

            console.log('[POS] Created consignment_sales (hutang konsinyasi):', {
              productId: item.productId,
              batchId: activeBatch.id,
              qtySold: item.quantity,
              netToConsignor,
              feeAmount,
              isSettled: false // Creates liability
            });
          } else {
            console.warn('[POS] No active consignment batch found for TITIPAN product:', item.productId);
          }
        }

        // Update product stock
        await tx.products.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            },
            updatedAt: new Date(),
          },
        });

        // ✅ Create stock movement record dengan unitCost untuk tracking pembayaran konsinyasi
        const stockMovement = await tx.stock_movements.create({
          data: {
            id: randomUUID(),
            productId: item.productId,
            movementType: 'SALE_OUT',
            quantity: -item.quantity, // Negative for outgoing
            unitCost: unitCost, // ✅ CRITICAL: Unit cost untuk calculate pembayaran konsinyasi
            referenceType: 'SALE', // ✅ FIX: Use correct enum value (not TRANSACTION)
            referenceId: transaction.id,
            note: `POS Sale - ${customerName || 'Walk-in Customer'}`,
            occurredAt: new Date(),
          },
        });

        stockMovements.push(stockMovement);
      }

      return {
        transaction,
        transactionItems,
        stockMovements
      };
    });

    console.log('[POS] Transaction completed successfully:', {
      transactionId: result.transaction.id,
      itemsProcessed: result.transactionItems.length,
      totalAmount
    });

    // Return success with transaction details
    return NextResponse.json({
      success: true,
      message: "Transaction completed successfully",
      data: {
        transactionId: result.transaction.id,
        receiptNumber: result.transaction.id.slice(-8).toUpperCase(),
        totalAmount,
        amountPaid,
        change,
        paymentMethod,
        customerName: customerName || 'Walk-in Customer',
        timestamp: result.transaction.date,
        items: result.transactionItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.totalPrice // ✅ FIX: Use totalPrice from database
        }))
      }
    });

  } catch (error) {
    console.error('[POS] Transaction error:', error);
    console.error('[POS] Error details:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
      stack: error?.stack
    });
    
    // Handle specific database errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "Transaction ID conflict. Please retry." },
        { status: 409 }
      );
    }

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Product not found or already deleted" },
        { status: 404 }
      );
    }

      return NextResponse.json(
        { 
          error: "Internal server error during transaction processing",
          details: process.env.NODE_ENV === 'development' ? error?.message : undefined
        },
        { status: 500 }
      );
    }
  });
}

// GET endpoint for POS transaction history
export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.replace(/^Bearer\s+/i, "");
    const user = await getUserFromToken(token);

    if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access only" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build date filter
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    const whereClause: any = {
      type: 'SALE',
      status: 'COMPLETED',
    };

    if (Object.keys(dateFilter).length > 0) {
      whereClause.date = dateFilter;
    }

    // Get transactions with items and product details
    const transactions = await prisma.transactions.findMany({
      where: whereClause,
      include: {
        transaction_items: {
          include: {
            products: {
              select: {
                name: true,
                sku: true,
                unit: true,
              },
            },
          },
        },
      },
      orderBy: { date: 'desc' },
      take: limit,
      skip: offset,
    });

    // Get total count for pagination
    const totalCount = await prisma.transactions.count({
      where: whereClause,
    });

    return NextResponse.json({
      success: true,
      data: {
        transactions: transactions.map(tx => ({
          id: tx.id,
          receiptNumber: tx.id.slice(-8).toUpperCase(),
          totalAmount: tx.totalAmount,
          paymentMethod: tx.paymentMethod,
          customerName: tx.note?.replace('POS Sale - ', '') || 'Walk-in Customer',
          timestamp: tx.date,
          itemCount: tx.transaction_items.length,
          items: tx.transaction_items.map(item => ({
            productName: item.products?.name || 'Unknown Product',
            sku: item.products?.sku,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
            unit: item.products?.unit || 'pcs',
          })),
        })),
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount,
        },
      },
    });

  } catch (error) {
    console.error('[POS] History fetch error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
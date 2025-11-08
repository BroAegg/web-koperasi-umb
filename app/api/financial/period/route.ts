import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/financial/period - Get financial data for a period
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'today';
    const customDate = searchParams.get('date');
    
    // Calculate date range based on period
    let startDate: Date;
    let endDate: Date = new Date();
    endDate.setHours(23, 59, 59, 999);
    
    if (customDate && period === 'today') {
      // Custom date selected
      startDate = new Date(customDate);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(customDate);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Period based
      const now = new Date();
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
      
      switch (period) {
        case 'today':
          startDate = new Date(now);
          startDate.setHours(0, 0, 0, 0);
          break;
        case '7days':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 6);
          startDate.setHours(0, 0, 0, 0);
          break;
        case '1month':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 29);
          startDate.setHours(0, 0, 0, 0);
          break;
        case '3months':
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 3);
          startDate.setHours(0, 0, 0, 0);
          break;
        case '6months':
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 6);
          startDate.setHours(0, 0, 0, 0);
          break;
        case '1year':
          startDate = new Date(now);
          startDate.setFullYear(now.getFullYear() - 1);
          startDate.setHours(0, 0, 0, 0);
          break;
        default:
          startDate = new Date(now);
          startDate.setHours(0, 0, 0, 0);
      }
    }

    // Get all transactions within the period
    // @ts-ignore - TS cache issue
    const transactions = await prisma.transactions.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: 'COMPLETED',
      },
      include: {
        transaction_items: {
          include: {
            products: {
              select: {
                id: true,
                name: true,
                sellPrice: true,
                avgCost: true,
                buyPrice: true,
                isConsignment: true,
                ownershipType: true,
                supplierId: true,
                suppliers: {
                  select: {
                    id: true,
                    businessName: true,
                    ownerName: true,
                    phone: true,
                    address: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Get paid consignment payments that overlap with this period
    // We will keep suppliers in the consignment breakdown but mark them as paid
    const paidPayments = await prisma.consignment_payments.findMany({
      where: {
        status: 'PAID',
        periodStart: { lte: endDate },
        periodEnd: { gte: startDate },
      },
      select: {
        id: true,
        supplierName: true, // stored as supplierId in our implementation
        amount: true,
        paymentMethod: true,
        transactionId: true,
        createdAt: true,
        metadata: true,
      },
    });

    // ✅ NEW: Get unsettled consignment_sales (actual hutang konsinyasi)
    const unsettledConsignmentSales = await prisma.consignment_sales.findMany({
      where: {
        isSettled: false,
        saleDate: { gte: startDate, lte: endDate }
      },
      include: {
        consignment_batches: {
          include: {
            consignors: {
              select: {
                id: true,
                code: true,
                name: true,
                contact: true,
                phone: true,
                address: true
              }
            },
            products: {
              select: {
                id: true,
                name: true,
                supplierId: true
              }
            }
          }
        }
      }
    });

    // Map supplierId -> payment info (take the latest payment if multiple)
  const paidInfoMap = new Map<string, { paymentId: string; amount: number; paidAt?: string; transactionId?: string }>();
    for (const p of paidPayments) {
      const supplierId = p.supplierName as string;
      const existing = paidInfoMap.get(supplierId);
  const metaPaidAt = p.metadata && (p.metadata as any).paidAt;
  const paidAt = metaPaidAt ? String(metaPaidAt) : (p.createdAt ? p.createdAt.toISOString() : undefined);
      // keep latest payment (by createdAt)
      if (!existing || (p.createdAt && new Date(p.createdAt) > new Date(existing.paidAt || 0))) {
  paidInfoMap.set(supplierId, { paymentId: String(p.id), amount: Number(p.amount || 0), paidAt: paidAt ?? undefined, transactionId: p.transactionId ?? undefined });
      }
    }

    // Calculate totals with consignment-aware breakdown
    let totalRevenue = 0;
    let totalCOGS = 0;
    let totalSoldItems = 0;
    let totalExpense = 0; // Actual expenses
    const uniqueProductIds = new Set<string>(); // Track unique products sold
    const productSalesMap = new Map<string, { name: string; quantity: number }>(); // Track product sales details
    const consignmentSupplierMap = new Map<string, { 
      supplierId: string;
      supplierName: string; 
      supplierContact: string | null;
      supplierPhone: string | null;
      supplierAddress: string | null;
      revenue: number; 
      cogs: number; 
      profit: number 
    }>(); // Track consignment by supplier

    // Toko (store-owned) breakdown
    let tokoRevenue = 0;
    let tokoCOGS = 0;

    // Consignment breakdown (gross revenue and profit from consignment sales)
    let consignmentGrossRevenue = 0;
    let consignmentCOGS = 0;

    transactions.forEach((transaction: any) => {
      const amount = Number(transaction.totalAmount);

      if (transaction.type === 'SALE') {
        // Process sale items
        transaction.transaction_items?.forEach((item: any) => {
          const itemRevenue = Number(item.totalPrice);
          const itemCOGS = Number(item.totalCogs || 0);
          totalRevenue += itemRevenue;
          totalCOGS += itemCOGS;
          totalSoldItems += item.quantity;
          
          // Track unique products sold with details
          if (item.productId && item.products) {
            uniqueProductIds.add(item.productId);
            
            // Aggregate quantities for each product
            const existing = productSalesMap.get(item.productId);
            if (existing) {
              existing.quantity += item.quantity;
            } else {
              productSalesMap.set(item.productId, {
                name: item.products.name,
                quantity: item.quantity
              });
            }
          }

          // Determine ownership: product.ownershipType OR product.isConsignment
          const isConsignment = item.products?.isConsignment || item.products?.ownershipType === 'TITIPAN';

          if (isConsignment) {
            // ✅ SKIP tracking consignment here - will be tracked via unsettledConsignmentSales
            // This ensures we only count UNPAID sales (isSettled = false)
            // Revenue and profit for consignment will be calculated from consignment_sales table
            
            // Just add to total revenue for overall stats
            totalRevenue += itemRevenue;
            totalSoldItems += item.quantity;
            
            // Don't track in consignmentSupplierMap here - handled by unsettledConsignmentSales
          } else {
            // Store-owned product: revenue only, no expense at sale
            tokoRevenue += itemRevenue;
            tokoCOGS += itemCOGS; // For profit calc, but NOT counted as expense
          }
        });
      } else if (transaction.type === 'PURCHASE') {
        // PURCHASE: expense only for TOKO products
        transaction.transaction_items?.forEach((item: any) => {
          const isToko = item.products?.ownershipType === 'TOKO' || 
                        item.products?.isConsignment === false;
          if (isToko) {
            totalExpense += Number(item.totalPrice || 0);
          }
        });
      } else if (transaction.type === 'EXPENSE') {
        // Manual expense transactions
        totalExpense += amount;
      } else if (transaction.type === 'INCOME') {
        // Manual income transactions
        totalRevenue += amount;
      }
    });

    // ✅ NEW: Process unsettled consignment_sales untuk get actual hutang konsinyasi
    // This is more accurate than tracking via transactions because:
    // 1. Only includes sales that haven't been paid yet (isSettled = false)
    // 2. Directly from consignment_sales table (source of truth)
    // 3. Properly links to consignors table
    console.log(`[Financial Period] Processing ${unsettledConsignmentSales.length} unsettled consignment sales`);
    
    for (const sale of unsettledConsignmentSales) {
      const consignor = sale.consignment_batches.consignors;
      const consignorId = consignor.id;
      const consignorName = consignor.name;
      const totalRevenue = Number(sale.totalRevenue);
      const feeAmount = Number(sale.feeAmount);
      const netToConsignor = Number(sale.netToConsignor);
      
      // Add to consignmentSupplierMap (or update if exists)
      const existing = consignmentSupplierMap.get(consignorId);
      if (existing) {
        existing.revenue += totalRevenue;
        existing.cogs += netToConsignor; // Net amount owed to consignor
        existing.profit += feeAmount; // Koperasi's profit (fee)
      } else {
        consignmentSupplierMap.set(consignorId, {
          supplierId: consignorId,
          supplierName: consignorName,
          supplierContact: consignor.contact,
          supplierPhone: consignor.phone,
          supplierAddress: consignor.address,
          revenue: totalRevenue,
          cogs: netToConsignor, // What we owe to consignor
          profit: feeAmount // Our profit from the sale
        });
      }
      
      // Add to totals
      consignmentGrossRevenue += totalRevenue;
      consignmentCOGS += netToConsignor;
    }

    const tokoProfit = tokoRevenue - tokoCOGS;
    const consignmentProfit = consignmentGrossRevenue - consignmentCOGS; // Koperasi profit from consignment sales

    const totalProfit = tokoProfit + consignmentProfit; // Total profit includes both TOKO and TITIPAN margins
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    const uniqueProductsSold = uniqueProductIds.size; // Count unique products
    
    // Convert productSalesMap to array for JSON response, sorted by quantity (descending)
    const productBreakdown = Array.from(productSalesMap.values())
      .sort((a, b) => b.quantity - a.quantity);
    
    // Convert consignmentSupplierMap to array for JSON response, sorted by profit (descending)
    // Keep all suppliers but mark which ones are already paid in this period
    const consignmentBreakdown = Array.from(consignmentSupplierMap.values())
      .map(supplier => {
        const paid = paidInfoMap.get(supplier.supplierId);
        return {
          ...supplier,
          isPaid: !!paid,
          paidAt: paid?.paidAt || null,
          paidAmount: paid?.amount || 0,
          paymentTransactionId: paid?.transactionId || null,
        };
      })
      .sort((a, b) => b.profit - a.profit);

    return NextResponse.json({
      success: true,
      data: {
        period,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        // legacy fields
        totalRevenue,
        totalProfit,
        totalCOGS,
        totalExpense, // NEW: Actual expenses (TITIPAN COGS + manual EXPENSE + TOKO PURCHASE)
        totalSoldItems,
        uniqueProductsSold, // Count of unique product types sold
        productBreakdown, // Array of {name, quantity} for sold products
        consignmentBreakdown, // NEW: Array of {supplierName, revenue, cogs, profit} for consignment suppliers
        profitMargin,
        transactionCount: transactions.length,

        // NEW: Return transactions array for chart visualization
        transactions: transactions.map((t: any) => ({
          id: t.id,
          type: t.type,
          totalAmount: t.totalAmount,
          date: t.date,
          createdAt: t.createdAt,
          paymentMethod: t.paymentMethod,
          note: t.note || '',
        })),

        // new breakdown
        toko: {
          revenue: tokoRevenue,
          cogs: tokoCOGS,
          profit: tokoProfit,
        },
        consignment: {
          grossRevenue: consignmentGrossRevenue,
          cogs: consignmentCOGS,
          profit: consignmentProfit,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching period financial data:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

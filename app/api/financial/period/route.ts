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
    const transactions = await prisma.transaction.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: 'COMPLETED',
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sellPrice: true,
                avgCost: true,
                buyPrice: true,
                isConsignment: true,
                ownershipType: true,
              },
            },
          },
        },
      },
    });

    // Calculate totals with consignment-aware breakdown
    let totalRevenue = 0;
    let totalCOGS = 0;
    let totalSoldItems = 0;
    let totalExpense = 0; // Actual expenses
    const uniqueProductIds = new Set<string>(); // Track unique products sold

    // Toko (store-owned) breakdown
    let tokoRevenue = 0;
    let tokoCOGS = 0;

    // Consignment breakdown (gross revenue and profit from consignment sales)
    let consignmentGrossRevenue = 0;
    let consignmentCOGS = 0;

    transactions.forEach(transaction => {
      const amount = Number(transaction.totalAmount);

      if (transaction.type === 'SALE') {
        // Process sale items
        transaction.items?.forEach(item => {
          const itemRevenue = Number(item.totalPrice);
          const itemCOGS = Number(item.totalCogs || 0);
          totalRevenue += itemRevenue;
          totalCOGS += itemCOGS;
          totalSoldItems += item.quantity;
          
          // Track unique products sold
          if (item.productId) {
            uniqueProductIds.add(item.productId);
          }

          // Determine ownership: product.ownershipType OR product.isConsignment
          const isConsignment = item.product?.isConsignment || item.product?.ownershipType === 'TITIPAN';

          if (isConsignment) {
            // Consignment product sold: COGS is expense (payment to consignor)
            consignmentGrossRevenue += itemRevenue;
            consignmentCOGS += itemCOGS;
            totalExpense += itemCOGS; // TITIPAN COGS = expense
          } else {
            // Store-owned product: revenue only, no expense at sale
            tokoRevenue += itemRevenue;
            tokoCOGS += itemCOGS; // For profit calc, but NOT counted as expense
          }
        });
      } else if (transaction.type === 'PURCHASE') {
        // PURCHASE: expense only for TOKO products
        transaction.items?.forEach(item => {
          const isToko = item.product?.ownershipType === 'TOKO' || 
                        item.product?.isConsignment === false;
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

    const tokoProfit = tokoRevenue - tokoCOGS;
    const consignmentProfit = consignmentGrossRevenue - consignmentCOGS; // Koperasi profit from consignment sales

    const totalProfit = tokoProfit + consignmentProfit; // Total profit includes both TOKO and TITIPAN margins
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    const uniqueProductsSold = uniqueProductIds.size; // Count unique products

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
        uniqueProductsSold, // NEW: Count of unique product types sold
        profitMargin,
        transactionCount: transactions.length,

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

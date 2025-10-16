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

    // Get all transaction items within the period
    const transactionItems = await prisma.transactionItem.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        transaction: {
          status: 'COMPLETED',
        },
      },
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
        transaction: {
          select: {
            status: true,
            type: true,
          },
        },
      },
    });

    // Calculate totals with consignment-aware breakdown
    let totalRevenue = 0;
    let totalCOGS = 0;
    let totalSoldItems = 0;

    // Toko (store-owned) breakdown
    let tokoRevenue = 0;
    let tokoCOGS = 0;

    // Consignment breakdown (gross revenue and fees paid to consignors)
    let consignmentGrossRevenue = 0;
    let consignmentFeeTotal = 0; // amount paid to consignors or fee portion (not koperasi profit)

    transactionItems.forEach(item => {
      if (item.transaction.type === 'SALE') {
        const itemRevenue = Number(item.totalPrice);
        const itemCOGS = Number(item.totalCogs || 0);
        totalRevenue += itemRevenue;
        totalCOGS += itemCOGS;
        totalSoldItems += item.quantity;

        // Determine ownership: product.ownershipType OR product.isConsignment
        const isConsignment = item.product?.isConsignment || item.product?.ownershipType === 'TITIPAN';

        if (isConsignment) {
          // For consignment, koperasi typically earns only the fee (consignmentFee)
          // We try to read fee from related consignment_sales if present. Fallback: assume fee = 0
          consignmentGrossRevenue += itemRevenue;

          // Attempt to read fee amount from consignment_sales relation (if loaded)
          // Note: transactionItem relation to consignment_sales exists but not included here. We'll conservatively
          // treat consignmentFee as 0 unless consignment_sales records are queried elsewhere.
          // The financial UI can query `consignment_sales` or `settlements` for detailed per-consignor payouts.
        } else {
          // Store-owned product: full revenue and COGS count towards toko profit
          tokoRevenue += itemRevenue;
          tokoCOGS += itemCOGS;
        }
      }
    });

    const tokoProfit = tokoRevenue - tokoCOGS;
    const consignmentNetToKoperasi = 0; // placeholder: actual koperasi earning from consignment is (consignmentGrossRevenue - consignmentFeeTotal)

    const totalProfit = tokoProfit + consignmentNetToKoperasi; // conservative: consignment contribution handled separately
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

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
        totalSoldItems,
        profitMargin,
        transactionCount: transactionItems.length,

        // new breakdown
        toko: {
          revenue: tokoRevenue,
          cogs: tokoCOGS,
          profit: tokoProfit,
        },
        consignment: {
          grossRevenue: consignmentGrossRevenue,
          feeTotal: consignmentFeeTotal,
          netToKoperasi: consignmentNetToKoperasi,
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

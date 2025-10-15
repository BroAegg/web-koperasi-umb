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

    // Calculate totals
    let totalRevenue = 0;
    let totalCOGS = 0;
    let totalSoldItems = 0;

    transactionItems.forEach(item => {
      if (item.transaction.type === 'SALE') {
        totalRevenue += Number(item.totalPrice);
        totalCOGS += Number(item.totalCogs || 0);
        totalSoldItems += item.quantity;
      }
    });

    const totalProfit = totalRevenue - totalCOGS;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        period,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        totalRevenue,
        totalProfit,
        totalCOGS,
        totalSoldItems,
        profitMargin,
        transactionCount: transactionItems.length,
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

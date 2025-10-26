// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';

interface DailySalesData {
  date: string;
  totalSales: number;
  totalRevenue: number;
  totalProfit: number;
  transactionCount: number;
  averageTransaction: number;
}

// GET /api/analytics/sales-trends
export async function GET(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization') || '';
    const token = auth.replace(/^Bearer\s+/i, '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    
    if (!user || !['SUPER_ADMIN', 'ADMIN', 'KASIR'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    // Calculate date range
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Get daily transactions grouped by date
    const transactions = await prisma.transactions.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: 'COMPLETED',
      },
      select: {
        id: true,
        totalAmount: true,
        createdAt: true,
        transaction_items: {
          select: {
            quantity: true,
            grossProfit: true,
          },
        },
      },
    });

    // Group by date
    const dailyData = new Map<string, DailySalesData>();

    // Initialize all dates in range
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      dailyData.set(dateKey, {
        date: dateKey,
        totalSales: 0,
        totalRevenue: 0,
        totalProfit: 0,
        transactionCount: 0,
        averageTransaction: 0,
      });
    }

    // Aggregate data
    transactions.forEach(transaction => {
      const dateKey = transaction.createdAt.toISOString().split('T')[0];
      const data = dailyData.get(dateKey);
      
      if (data) {
        const totalQuantity = transaction.transaction_items.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        const totalProfit = transaction.transaction_items.reduce(
          (sum, item) => sum + Number(item.grossProfit || 0),
          0
        );

        data.totalSales += totalQuantity;
        data.totalRevenue += Number(transaction.totalAmount);
        data.totalProfit += totalProfit;
        data.transactionCount += 1;
      }
    });

    // Calculate averages
    dailyData.forEach((data) => {
      if (data.transactionCount > 0) {
        data.averageTransaction = data.totalRevenue / data.transactionCount;
      }
    });

    // Convert to array and sort by date
    const salesTrends = Array.from(dailyData.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calculate summary stats
    const totalRevenue = salesTrends.reduce((sum, day) => sum + day.totalRevenue, 0);
    const totalProfit = salesTrends.reduce((sum, day) => sum + day.totalProfit, 0);
    const totalTransactions = salesTrends.reduce((sum, day) => sum + day.transactionCount, 0);
    const totalSales = salesTrends.reduce((sum, day) => sum + day.totalSales, 0);

    // Calculate growth rate (comparing first half vs second half)
    const midPoint = Math.floor(salesTrends.length / 2);
    const firstHalf = salesTrends.slice(0, midPoint);
    const secondHalf = salesTrends.slice(midPoint);

    const firstHalfAvg = firstHalf.reduce((sum, day) => sum + day.totalRevenue, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, day) => sum + day.totalRevenue, 0) / secondHalf.length;
    
    const growthRate = firstHalfAvg > 0 
      ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        trends: salesTrends,
        summary: {
          totalRevenue,
          totalProfit,
          totalTransactions,
          totalSales,
          averageDaily: totalRevenue / salesTrends.length,
          averageTransaction: totalTransactions > 0 ? totalRevenue / totalTransactions : 0,
          growthRate: Math.round(growthRate * 10) / 10,
          period: {
            startDate,
            endDate,
            days,
          },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching sales trends:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sales trends' },
      { status: 500 }
    );
  }
}

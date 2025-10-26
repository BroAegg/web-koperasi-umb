// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';

interface HourlyData {
  hour: number;
  transactionCount: number;
  totalRevenue: number;
  averageTransaction: number;
}

interface DailyData {
  dayOfWeek: number;
  dayName: string;
  transactionCount: number;
  totalRevenue: number;
  averageTransaction: number;
}

// GET /api/analytics/peak-hours
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
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all transactions in period
    const transactions = await prisma.transactions.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: 'COMPLETED',
      },
      select: {
        totalAmount: true,
        createdAt: true,
      },
    });

    // Initialize hourly data (0-23)
    const hourlyMap = new Map<number, HourlyData>();
    for (let i = 0; i < 24; i++) {
      hourlyMap.set(i, {
        hour: i,
        transactionCount: 0,
        totalRevenue: 0,
        averageTransaction: 0,
      });
    }

    // Initialize daily data (0-6, Sunday-Saturday)
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const dailyMap = new Map<number, DailyData>();
    for (let i = 0; i < 7; i++) {
      dailyMap.set(i, {
        dayOfWeek: i,
        dayName: dayNames[i],
        transactionCount: 0,
        totalRevenue: 0,
        averageTransaction: 0,
      });
    }

    // Aggregate data
    transactions.forEach(transaction => {
      const date = new Date(transaction.createdAt);
      const hour = date.getHours();
      const dayOfWeek = date.getDay();
      const amount = Number(transaction.totalAmount);

      // Update hourly data
      const hourData = hourlyMap.get(hour)!;
      hourData.transactionCount += 1;
      hourData.totalRevenue += amount;

      // Update daily data
      const dayData = dailyMap.get(dayOfWeek)!;
      dayData.transactionCount += 1;
      dayData.totalRevenue += amount;
    });

    // Calculate averages
    hourlyMap.forEach((data) => {
      if (data.transactionCount > 0) {
        data.averageTransaction = data.totalRevenue / data.transactionCount;
      }
    });

    dailyMap.forEach((data) => {
      if (data.transactionCount > 0) {
        data.averageTransaction = data.totalRevenue / data.transactionCount;
      }
    });

    // Convert to arrays
    const hourlyData = Array.from(hourlyMap.values());
    const dailyData = Array.from(dailyMap.values());

    // Find peak hours
    const peakHour = hourlyData.reduce((max, current) =>
      current.transactionCount > max.transactionCount ? current : max
    );

    const quietestHour = hourlyData.reduce((min, current) =>
      current.transactionCount < min.transactionCount ? current : min
    );

    // Find peak days
    const peakDay = dailyData.reduce((max, current) =>
      current.transactionCount > max.transactionCount ? current : max
    );

    const quietestDay = dailyData.reduce((min, current) =>
      current.transactionCount < min.transactionCount ? current : min
    );

    return NextResponse.json({
      success: true,
      data: {
        hourly: hourlyData,
        daily: dailyData,
        insights: {
          peakHour: {
            hour: peakHour.hour,
            label: `${peakHour.hour.toString().padStart(2, '0')}:00`,
            transactionCount: peakHour.transactionCount,
            revenue: peakHour.totalRevenue,
          },
          quietestHour: {
            hour: quietestHour.hour,
            label: `${quietestHour.hour.toString().padStart(2, '0')}:00`,
            transactionCount: quietestHour.transactionCount,
            revenue: quietestHour.totalRevenue,
          },
          peakDay: {
            day: peakDay.dayName,
            transactionCount: peakDay.transactionCount,
            revenue: peakDay.totalRevenue,
          },
          quietestDay: {
            day: quietestDay.dayName,
            transactionCount: quietestDay.transactionCount,
            revenue: quietestDay.totalRevenue,
          },
        },
        summary: {
          totalTransactions: transactions.length,
          period: { startDate, endDate, days },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching peak hours:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch peak hours data' },
      { status: 500 }
    );
  }
}

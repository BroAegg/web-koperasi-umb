// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';

interface CustomerData {
  userId: string;
  userName: string;
  userEmail: string;
  totalSpent: number;
  totalTransactions: number;
  totalItems: number;
  averageTransaction: number;
  firstPurchase: Date;
  lastPurchase: Date;
  frequencyDays: number;
}

// GET /api/analytics/customers
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
    const period = searchParams.get('period') || '30days';
    const limit = parseInt(searchParams.get('limit') || '20');

    // Calculate date range
    let startDate: Date;
    const endDate = new Date();

    switch (period) {
      case '7days':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30days':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90days':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 90);
        break;
      case 'all':
      default:
        startDate = new Date(2020, 0, 1);
        break;
    }

    // Get transactions grouped by user
    const transactions = await prisma.transactions.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: 'COMPLETED',
        memberId: {
          not: null,
        },
      },
      select: {
        memberId: true,
        totalAmount: true,
        createdAt: true,
        transaction_items: {
          select: {
            quantity: true,
          },
        },
        members: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by customer
    const customerMap = new Map<string, CustomerData>();

    transactions.forEach(transaction => {
      if (!transaction.memberId) return;

      const memberId = transaction.memberId;
      const amount = Number(transaction.totalAmount);
      const items = transaction.transaction_items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      if (!customerMap.has(memberId)) {
        customerMap.set(memberId, {
          userId: memberId,
          userName: transaction.members?.name || 'Member',
          userEmail: transaction.members?.phone || '-',
          totalSpent: 0,
          totalTransactions: 0,
          totalItems: 0,
          averageTransaction: 0,
          firstPurchase: transaction.createdAt,
          lastPurchase: transaction.createdAt,
          frequencyDays: 0,
        });
      }

      const customer = customerMap.get(memberId)!;
      customer.totalSpent += amount;
      customer.totalTransactions += 1;
      customer.totalItems += items;
      customer.lastPurchase = transaction.createdAt;
    });

    // Calculate averages and frequency
    customerMap.forEach((customer) => {
      customer.averageTransaction = customer.totalSpent / customer.totalTransactions;
      
      const daysDiff = Math.floor(
        (customer.lastPurchase.getTime() - customer.firstPurchase.getTime()) / 
        (1000 * 60 * 60 * 24)
      );
      customer.frequencyDays = customer.totalTransactions > 1 
        ? Math.round(daysDiff / (customer.totalTransactions - 1))
        : 0;
    });

    // Convert to array and sort by total spent
    const customers = Array.from(customerMap.values()).sort(
      (a, b) => b.totalSpent - a.totalSpent
    );

    // Get top customers
    const topCustomers = customers.slice(0, limit);

    // Calculate summary stats
    const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    const totalCustomers = customers.length;
    const averageSpent = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
    
    // Customer segments
    const highValue = customers.filter(c => c.totalSpent > averageSpent * 2).length;
    const mediumValue = customers.filter(c => c.totalSpent > averageSpent && c.totalSpent <= averageSpent * 2).length;
    const lowValue = customers.filter(c => c.totalSpent <= averageSpent).length;

    // Loyalty levels (by transaction count)
    const loyal = customers.filter(c => c.totalTransactions >= 10).length;
    const regular = customers.filter(c => c.totalTransactions >= 5 && c.totalTransactions < 10).length;
    const occasional = customers.filter(c => c.totalTransactions < 5).length;

    return NextResponse.json({
      success: true,
      data: {
        customers: topCustomers,
        summary: {
          totalCustomers,
          totalRevenue,
          averageSpent,
          segments: {
            highValue,
            mediumValue,
            lowValue,
          },
          loyalty: {
            loyal,
            regular,
            occasional,
          },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching customer analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customer analytics' },
      { status: 500 }
    );
  }
}

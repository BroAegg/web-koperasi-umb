import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/financial/summary - Get financial summary
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    
    if (!date) {
      return NextResponse.json(
        { success: false, error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    // Get transactions for the specified date
    const transactions = await prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
        status: 'COMPLETED',
      },
    });

    // Calculate totals
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(transaction => {
      const amount = Number(transaction.totalAmount);
      
      if (transaction.type === 'SALE' || transaction.type === 'INCOME') {
        totalIncome += amount;
      } else if (transaction.type === 'PURCHASE' || transaction.type === 'EXPENSE') {
        totalExpense += amount;
      }
    });

    const netIncome = totalIncome - totalExpense;
    const transactionCount = transactions.length;

    // Get weekly summary (last 7 days)
    const weekStartDate = new Date(startDate);
    weekStartDate.setDate(weekStartDate.getDate() - 6);

    const weeklyTransactions = await prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: weekStartDate,
          lt: endDate,
        },
        status: 'COMPLETED',
      },
    });

    let weeklyIncome = 0;
    let weeklyExpense = 0;

    weeklyTransactions.forEach(transaction => {
      const amount = Number(transaction.totalAmount);
      
      if (transaction.type === 'SALE' || transaction.type === 'INCOME') {
        weeklyIncome += amount;
      } else if (transaction.type === 'PURCHASE' || transaction.type === 'EXPENSE') {
        weeklyExpense += amount;
      }
    });

    // Get monthly summary
    const monthStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const monthEndDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);

    const monthlyTransactions = await prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: monthStartDate,
          lt: monthEndDate,
        },
        status: 'COMPLETED',
      },
    });

    let monthlyIncome = 0;
    let monthlyExpense = 0;

    monthlyTransactions.forEach(transaction => {
      const amount = Number(transaction.totalAmount);
      
      if (transaction.type === 'SALE' || transaction.type === 'INCOME') {
        monthlyIncome += amount;
      } else if (transaction.type === 'PURCHASE' || transaction.type === 'EXPENSE') {
        monthlyExpense += amount;
      }
    });

    const summary = {
      date,
      daily: {
        totalIncome,
        totalExpense,
        netIncome,
        transactionCount,
      },
      weekly: {
        totalIncome: weeklyIncome,
        totalExpense: weeklyExpense,
        netIncome: weeklyIncome - weeklyExpense,
        transactionCount: weeklyTransactions.length,
      },
      monthly: {
        totalIncome: monthlyIncome,
        totalExpense: monthlyExpense,
        netIncome: monthlyIncome - monthlyExpense,
        transactionCount: monthlyTransactions.length,
      },
    };

    return NextResponse.json({
      success: true,
      data: summary.daily, // Return daily summary for the main API
      summary, // Include all summaries for detailed view
    });
  } catch (error) {
    console.error('Error fetching financial summary:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
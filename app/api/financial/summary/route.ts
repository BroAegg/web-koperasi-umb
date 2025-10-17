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
      include: {
        items: {
          include: {
            product: {
              select: {
                ownershipType: true,
                isConsignment: true,
              },
            },
          },
        },
      },
    });

    // Calculate totals with ownership-aware logic
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(transaction => {
      const amount = Number(transaction.totalAmount);
      
      if (transaction.type === 'SALE') {
        // SALE: Always count as income (revenue from selling)
        totalIncome += amount;
        
        // SALE: Count COGS as expense ONLY for TITIPAN products
        // (because we pay the consignor when item is sold)
        // TOKO products: expense already counted on PURCHASE
        if (transaction.items && transaction.items.length > 0) {
          transaction.items.forEach(item => {
            const isTitipan = item.product?.ownershipType === 'TITIPAN' || 
                             item.product?.isConsignment === true;
            if (isTitipan) {
              // For consignment: COGS is payment to consignor (expense)
              totalExpense += Number(item.totalCogs || 0);
            }
            // For TOKO: No expense on SALE (capital already paid on PURCHASE)
          });
        }
      } else if (transaction.type === 'INCOME') {
        // Manual income entry
        totalIncome += amount;
      } else if (transaction.type === 'PURCHASE') {
        // PURCHASE: Count as expense ONLY for TOKO products
        // (our capital/modal spent to buy inventory)
        // TITIPAN products: not our money, no expense until sold
        if (transaction.items && transaction.items.length > 0) {
          transaction.items.forEach(item => {
            const isToko = item.product?.ownershipType === 'TOKO' || 
                          item.product?.isConsignment === false ||
                          !item.product?.isConsignment;
            if (isToko) {
              // For store-owned: Purchase cost is our expense (modal)
              totalExpense += Number(item.totalPrice || 0);
            }
            // For TITIPAN: No expense on PURCHASE (not our capital)
          });
        } else {
          // Fallback: If no items linked, count full amount as expense
          // (for backward compatibility with old data)
          totalExpense += amount;
        }
      } else if (transaction.type === 'EXPENSE') {
        // Manual expense entry (utilities, salaries, etc.)
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
      include: {
        items: {
          include: {
            product: {
              select: {
                ownershipType: true,
                isConsignment: true,
              },
            },
          },
        },
      },
    });

    let weeklyIncome = 0;
    let weeklyExpense = 0;

    weeklyTransactions.forEach(transaction => {
      const amount = Number(transaction.totalAmount);
      
      if (transaction.type === 'SALE') {
        weeklyIncome += amount;
        if (transaction.items && transaction.items.length > 0) {
          transaction.items.forEach(item => {
            const isTitipan = item.product?.ownershipType === 'TITIPAN' || 
                             item.product?.isConsignment === true;
            if (isTitipan) {
              weeklyExpense += Number(item.totalCogs || 0);
            }
          });
        }
      } else if (transaction.type === 'INCOME') {
        weeklyIncome += amount;
      } else if (transaction.type === 'PURCHASE') {
        if (transaction.items && transaction.items.length > 0) {
          transaction.items.forEach(item => {
            const isToko = item.product?.ownershipType === 'TOKO' || 
                          item.product?.isConsignment === false ||
                          !item.product?.isConsignment;
            if (isToko) {
              weeklyExpense += Number(item.totalPrice || 0);
            }
          });
        } else {
          weeklyExpense += amount;
        }
      } else if (transaction.type === 'EXPENSE') {
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
      include: {
        items: {
          include: {
            product: {
              select: {
                ownershipType: true,
                isConsignment: true,
              },
            },
          },
        },
      },
    });

    let monthlyIncome = 0;
    let monthlyExpense = 0;

    monthlyTransactions.forEach(transaction => {
      const amount = Number(transaction.totalAmount);
      
      if (transaction.type === 'SALE') {
        monthlyIncome += amount;
        if (transaction.items && transaction.items.length > 0) {
          transaction.items.forEach(item => {
            const isTitipan = item.product?.ownershipType === 'TITIPAN' || 
                             item.product?.isConsignment === true;
            if (isTitipan) {
              monthlyExpense += Number(item.totalCogs || 0);
            }
          });
        }
      } else if (transaction.type === 'INCOME') {
        monthlyIncome += amount;
      } else if (transaction.type === 'PURCHASE') {
        if (transaction.items && transaction.items.length > 0) {
          transaction.items.forEach(item => {
            const isToko = item.product?.ownershipType === 'TOKO' || 
                          item.product?.isConsignment === false ||
                          !item.product?.isConsignment;
            if (isToko) {
              monthlyExpense += Number(item.totalPrice || 0);
            }
          });
        } else {
          monthlyExpense += amount;
        }
      } else if (transaction.type === 'EXPENSE') {
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
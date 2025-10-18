import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';

// GET /api/supplier/transactions - Get transactions containing supplier's products only
export async function GET(request: NextRequest) {
  try {
    // Get user from token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await getUserFromToken(token);
    if (!user || user.role !== 'SUPPLIER') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Supplier only' },
        { status: 403 }
      );
    }

    // Get supplier from suppliers table
    const supplier = await prisma.suppliers.findFirst({
      where: { email: user.email },
    });

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier not found' },
        { status: 404 }
      );
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type'); // SALE, PURCHASE, etc.

    // Build where clause
    const where: any = {
      // KEY: Only transactions that have items from this supplier
      transaction_items: {
        some: {
          products: {
            supplierId: supplier.id,
          },
        },
      },
    };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (type) {
      where.type = type;
    }

    // Get transactions
    const transactions = await prisma.transactions.findMany({
      where,
      include: {
        members: {
          select: {
            id: true,
            name: true,
            nomorAnggota: true,
          },
        },
        transaction_items: {
          // KEY: Filter items to only show supplier's products
          where: {
            products: {
              supplierId: supplier.id,
            },
          },
          include: {
            products: {
              select: {
                id: true,
                name: true,
                sku: true,
                unit: true,
              },
            },
          },
        },
      },
      orderBy: { date: 'desc' },
      take: 100, // Limit to 100 recent transactions
    });

    // Calculate summary for supplier's products only
    const summary = {
      totalTransactions: transactions.length,
      totalRevenue: transactions.reduce((sum, t) => {
        const supplierItemsTotal = t.transaction_items.reduce(
          (itemSum, item) => itemSum + Number(item.totalPrice),
          0
        );
        return sum + supplierItemsTotal;
      }, 0),
      totalItems: transactions.reduce(
        (sum, t) => sum + t.transaction_items.reduce(
          (itemSum, item) => itemSum + item.quantity,
          0
        ),
        0
      ),
    };

    return NextResponse.json({
      success: true,
      data: {
        transactions,
        summary,
      },
    });
  } catch (error: any) {
    console.error('Error fetching supplier transactions:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

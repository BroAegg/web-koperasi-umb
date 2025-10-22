import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // Authentication check - Support both cookie and Authorization header
    const cookieToken = req.cookies.get('token')?.value;
    const authHeader = req.headers.get('authorization');
    const headerToken = authHeader?.replace(/^Bearer\s+/i, '');
    const token = headerToken || cookieToken;
    
    const user = await getUserFromToken(token);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Authorization check - Only ADMIN and SUPER_ADMIN
    if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Get query params
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // Get today's date range (start of day to now)
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Build where clause - Filter by SALE type and today's transactions
    const where = {
      type: 'SALE' as const,
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
      isProduction: true,
    };

    // Fetch transactions with related items
    const transactions = await prisma.transactions.findMany({
      where,
      include: {
        transaction_items: {
          include: {
            products: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    // Format response
    const formattedTransactions = transactions.map((transaction: any) => {
      // Extract customer name from note field (format: "POS Sale - Customer: XXX")
      const noteMatch = transaction.note?.match(/Customer:\s*(.+)$/i);
      const customerName = noteMatch ? noteMatch[1] : 'Walk-in Customer';

      return {
        id: transaction.id,
        receiptId: transaction.id.slice(0, 6).toUpperCase(),
        totalAmount: Number(transaction.totalAmount),
        paymentMethod: transaction.paymentMethod,
        customerName: customerName,
        itemCount: transaction.transaction_items.length,
        createdAt: transaction.createdAt.toISOString(),
        items: transaction.transaction_items.map((item: any) => ({
          productName: item.products.name,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          subtotal: Number(item.totalPrice),
        })),
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedTransactions,
    });
  } catch (error) {
    console.error('Error fetching quick history:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch transaction history',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

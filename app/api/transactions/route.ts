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
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const paymentMethods = searchParams.get('paymentMethods')?.split(',');
    const transactionTypes = searchParams.get('types')?.split(',');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    // Build where clause
    const where: any = {
      isProduction: true,
    };

    // Transaction type filter - Show SALE and EXPENSE by default
    if (transactionTypes && transactionTypes.length > 0) {
      where.type = {
        in: transactionTypes,
      };
    } else {
      // Default: show both SALE (POS) and EXPENSE (consignment payments)
      where.type = {
        in: ['SALE', 'EXPENSE'],
      };
    }

    // FILTER: Hanya transaksi POS/operasional (yang punya transaction_items)
    // Exclude transaksi simpanan anggota (setor/tarik) yang tidak punya items
    where.transaction_items = {
      some: {}, // Must have at least one item
    };

    // Date range filter
    if (dateFrom && dateTo) {
      where.createdAt = {
        gte: new Date(dateFrom),
        lte: new Date(dateTo),
      };
    } else if (dateFrom) {
      where.createdAt = {
        gte: new Date(dateFrom),
      };
    } else if (dateTo) {
      where.createdAt = {
        lte: new Date(dateTo),
      };
    }

    // Payment method filter
    if (paymentMethods && paymentMethods.length > 0) {
      where.paymentMethod = {
        in: paymentMethods,
      };
    }

    // Search by receipt ID or customer name (in note field)
    if (search) {
      where.OR = [
        {
          id: {
            contains: search,
            mode: 'insensitive' as const,
          },
        },
        {
          note: {
            contains: search,
            mode: 'insensitive' as const,
          },
        },
      ];
    }

    // Get total count for pagination
    const totalCount = await prisma.transactions.count({ where });

    // Fetch transactions
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
      skip: (page - 1) * limit,
      take: limit,
    });

    // Calculate summary
    const allTransactions = await prisma.transactions.findMany({
      where,
      select: {
        totalAmount: true,
        paymentMethod: true,
      },
    });

    const totalRevenue = allTransactions.reduce(
      (sum: number, t: any) => sum + Number(t.totalAmount),
      0
    );

    const paymentBreakdown = allTransactions.reduce((acc: any, t: any) => {
      const method = t.paymentMethod;
      acc[method] = (acc[method] || 0) + Number(t.totalAmount);
      return acc;
    }, {});

    const averageTransaction = totalCount > 0 ? totalRevenue / totalCount : 0;

    // Format response
    const formattedTransactions = transactions.map((transaction: any) => {
      let customerName = 'Walk-in Customer';
      
      if (transaction.type === 'EXPENSE') {
        // For EXPENSE transactions (consignment payments), extract supplier name from note
        const supplierMatch = transaction.note?.match(/Pembayaran Titipan ke (.+?) \|/);
        customerName = supplierMatch ? supplierMatch[1] : 'Supplier';
      } else {
        // For SALE transactions, extract customer name from note
        const noteMatch = transaction.note?.match(/Customer:\s*(.+)$/i);
        customerName = noteMatch ? noteMatch[1] : 'Walk-in Customer';
      }

      return {
        id: transaction.id,
        receiptId: transaction.id.slice(0, 6).toUpperCase(),
        type: transaction.type, // Add transaction type
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
      data: {
        transactions: formattedTransactions,
        summary: {
          totalRevenue,
          totalTransactions: totalCount,
          paymentBreakdown,
          averageTransaction,
        },
        pagination: {
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
          currentPage: page,
          perPage: limit,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch transactions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

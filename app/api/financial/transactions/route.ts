import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import { withActivityLog } from '@/lib/with-activity-log';

const prisma = new PrismaClient();

// GET /api/financial/transactions - Fetch transactions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let where: any = {};

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    if (type) {
      where.type = type.toUpperCase();
    }

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
          include: {
            products: {
              select: {
                id: true,
                name: true,
                unit: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
      take: limit,
      skip: offset,
    });

    // Transform data to include calculated fields
    const transformedTransactions = transactions.map(transaction => ({
      ...transaction,
      amount: Number(transaction.totalAmount),
      description: transaction.note || `Transaksi ${transaction.type}`,
      category: transaction.type === 'SALE' ? 'Penjualan' : transaction.type === 'PURCHASE' ? 'Pembelian' : 'Lainnya',
      reference: transaction.id,
      date: transaction.date ? transaction.date.toISOString().split('T')[0] : transaction.createdAt.toISOString().split('T')[0],
      totalAmount: Number(transaction.totalAmount),
    }));

    const total = await prisma.transactions.count({ where });

    return NextResponse.json({
      success: true,
      data: transformedTransactions,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/financial/transactions - Create new transaction
// POST /api/financial/transactions - Create financial transaction
async function handleCreateFinancialTransaction(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      amount,
      description,
      category,
      paymentMethod,
      reference,
      date,
      memberId,
    } = body;

    // Validation
    if (!type || !amount || !description) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Block inventory-linked transaction types (SALE, PURCHASE, RETURN)
    // These should only be created automatically from inventory operations
    if (['SALE', 'PURCHASE', 'RETURN'].includes(type.toUpperCase())) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Transaksi SALE, PURCHASE, dan RETURN hanya bisa dibuat otomatis dari halaman Inventory. Gunakan tipe INCOME atau EXPENSE untuk pencatatan manual.' 
        },
        { status: 400 }
      );
    }

    // Only allow INCOME and EXPENSE for manual creation
    if (!['INCOME', 'EXPENSE'].includes(type.toUpperCase())) {
      return NextResponse.json(
        { success: false, error: 'Tipe transaksi harus INCOME atau EXPENSE' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Create transaction
    const transaction = await prisma.transactions.create({
      data: {
        id: randomUUID(),
        type: type.toUpperCase(),
        totalAmount: amount,
        paymentMethod: paymentMethod?.toUpperCase() || 'CASH',
        status: 'COMPLETED',
        note: description,
        date: date ? new Date(date) : new Date(),
        memberId: memberId || null,
        updatedAt: new Date(),
      },
      include: {
        members: {
          select: {
            id: true,
            name: true,
            nomorAnggota: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...transaction,
        amount: Number(transaction.totalAmount),
        description,
        category,
        reference: reference || transaction.id,
      },
      message: 'Transaksi berhasil dicatat',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = withActivityLog({
  module: 'FINANCIAL',
  action: 'CREATE_TRANSACTION',
  getDescription: (req, result) => {
    const data = result?.data;
    const type = data?.type || 'transaction';
    const desc = data?.description || '';
    const amount = data?.amount || 0;
    return `Created ${type} transaction: ${desc} (Rp ${amount.toLocaleString('id-ID')})`;
  },
  getMetadata: (req, result) => {
    const data = result?.data;
    return data
      ? {
          transactionId: data.id,
          type: data.type,
          amount: data.amount,
          category: data.category,
          paymentMethod: data.paymentMethod,
        }
      : undefined;
  },
})(handleCreateFinancialTransaction);

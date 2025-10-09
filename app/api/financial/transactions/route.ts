import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

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
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      where.createdAt = {
        gte: startDate,
        lt: endDate,
      };
    }

    if (type) {
      where.type = type.toUpperCase();
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        member: {
          select: {
            id: true,
            name: true,
            nomorAnggota: true,
          },
        },
        items: {
          include: {
            product: {
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
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    // Transform data to include calculated fields
    const transformedTransactions = transactions.map(transaction => ({
      ...transaction,
      amount: Number(transaction.totalAmount),
      description: transaction.note || `Transaksi ${transaction.type}`,
      category: transaction.type === 'SALE' ? 'Penjualan' : 'Lainnya',
      reference: transaction.id,
      date: transaction.createdAt.toISOString().split('T')[0],
      totalAmount: Number(transaction.totalAmount),
    }));

    const total = await prisma.transaction.count({ where });

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
export async function POST(request: NextRequest) {
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

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        type: type.toUpperCase(),
        totalAmount: amount,
        paymentMethod: paymentMethod?.toUpperCase() || 'CASH',
        status: 'COMPLETED',
        note: description,
        date: date ? new Date(date) : new Date(),
        memberId: memberId || null,
      },
      include: {
        member: {
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
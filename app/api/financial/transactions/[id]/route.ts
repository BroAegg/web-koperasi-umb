import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/financial/transactions/[id] - Get single transaction
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const transaction = await prisma.transactions.findUnique({
      where: { id },
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
    });

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...transaction,
        amount: Number(transaction.totalAmount),
        totalAmount: Number(transaction.totalAmount),
      },
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/financial/transactions/[id] - Update transaction
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      type,
      amount,
      description,
      category,
      paymentMethod,
      reference,
      date,
    } = body;

    // Check if transaction exists
    const existingTransaction = await prisma.transactions.findUnique({
      where: { id },
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Block editing of inventory-linked transactions (SALE, PURCHASE, RETURN)
    if (['SALE', 'PURCHASE', 'RETURN'].includes(existingTransaction.type)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Transaksi yang dibuat otomatis dari Inventory tidak dapat diedit. Hanya transaksi INCOME dan EXPENSE yang bisa diedit.' 
        },
        { status: 403 }
      );
    }

    // Validation for type change
    if (type && !['INCOME', 'EXPENSE'].includes(type.toUpperCase())) {
      return NextResponse.json(
        { success: false, error: 'Tipe transaksi harus INCOME atau EXPENSE' },
        { status: 400 }
      );
    }

    const transaction = await prisma.transactions.update({
      where: { id },
      data: {
        type: type ? type.toUpperCase() : existingTransaction.type,
        totalAmount: amount || existingTransaction.totalAmount,
        paymentMethod: paymentMethod ? paymentMethod.toUpperCase() : existingTransaction.paymentMethod,
        note: description || existingTransaction.note,
        date: date ? new Date(date) : existingTransaction.date,
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
        reference,
      },
      message: 'Transaksi berhasil diupdate',
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/financial/transactions/[id] - Delete transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if transaction exists
    const existingTransaction = await prisma.transactions.findUnique({
      where: { id },
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Block deleting of inventory-linked transactions (SALE, PURCHASE, RETURN)
    if (['SALE', 'PURCHASE', 'RETURN'].includes(existingTransaction.type)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Transaksi yang dibuat otomatis dari Inventory tidak dapat dihapus. Hanya transaksi INCOME dan EXPENSE yang bisa dihapus.' 
        },
        { status: 403 }
      );
    }

    await prisma.transactions.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Transaksi berhasil dihapus',
    });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { type, amount, date, description } = body;

    // Validation
    if (!type || !amount || !date) {
      return NextResponse.json(
        { success: false, error: 'Type, amount, and date are required' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Check if member exists
    const member = await prisma.members.findUnique({
      where: { id },
    });

    if (!member) {
      return NextResponse.json(
        { success: false, error: 'Member not found' },
        { status: 404 }
      );
    }

    // Create savings transaction
    const saving = await prisma.savings.create({
      data: {
        id: randomUUID(),
        memberId: id,
        type: type.toUpperCase(), // SUKARELA or WAJIB
        amount,
        date: new Date(date),
        description: description || `Setor Simpanan ${type}`,
      },
    });

    // Create financial transaction entry (INCOME) - Masuk ke /financial page
    await prisma.transactions.create({
      data: {
        id: randomUUID(),
        memberId: id,
        type: 'INCOME',
        totalAmount: amount,
        paymentMethod: 'CASH',
        status: 'COMPLETED',
        note: `Setor Simpanan ${type} - ${member.name}${description ? ` (${description})` : ''}`,
        date: new Date(date),
        updatedAt: new Date(),
        isProduction: true,
      },
    });

    // Recalculate member balance from all transactions (more reliable than incrementing)
    const allSavingsTransactions = await prisma.transactions.findMany({
      where: {
        OR: [
          {
            type: 'INCOME',
            note: { startsWith: 'Setor Simpanan' },
          },
          {
            type: 'EXPENSE',
            note: { startsWith: 'Penarikan Simpanan' },
          },
        ],
        status: 'COMPLETED',
      },
    });

    // Filter transactions for this specific member
    const memberTransactions = allSavingsTransactions.filter((t: any) => 
      t.note?.includes(member.name)
    );

    let calculatedWajib = 0;
    let calculatedSukarela = 0;

    memberTransactions.forEach((t: any) => {
      const transactionAmount = Number(t.totalAmount);
      if (t.type === 'INCOME') {
        if (t.note?.includes('WAJIB')) {
          calculatedWajib += transactionAmount;
        } else if (t.note?.includes('SUKARELA')) {
          calculatedSukarela += transactionAmount;
        }
      } else if (t.type === 'EXPENSE' && t.note?.includes('Penarikan Simpanan')) {
        calculatedSukarela -= transactionAmount;
      }
    });

    // Update member balance with calculated values
    const updatedMember = await prisma.members.update({
      where: { id },
      data: {
        simpananWajib: calculatedWajib,
        simpananSukarela: calculatedSukarela,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Deposit successful',
      data: {
        saving,
        member: updatedMember,
      },
    });
  } catch (error: any) {
    console.error('Error depositing savings:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

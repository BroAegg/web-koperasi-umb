import { generateInvoiceNumber } from '@/lib/invoice-generator';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { amount, date, description } = body;

    // Validation
    if (!amount || !date) {
      return NextResponse.json(
        { success: false, error: 'Amount and date are required' },
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

    // Check if balance is sufficient (only Simpanan Sukarela can be withdrawn)
    if (member.simpananSukarela < amount) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Insufficient balance. Available: ${member.simpananSukarela}` 
        },
        { status: 400 }
      );
    }

    // Create withdrawal transaction
    const saving = await prisma.savings.create({
      data: {
        id: randomUUID(),
        memberId: id,
        type: 'WITHDRAWAL',
        amount,
        date: new Date(date),
        description: description || 'Penarikan Simpanan Sukarela',
      },
    });

    // Create financial transaction entry (EXPENSE) - Keluar dari /financial page
    await prisma.transactions.create({
      data: {
        id: randomUUID(),
        invoiceNumber: generateInvoiceNumber(),
        memberId: id,
        type: 'EXPENSE',
        totalAmount: amount,
        paymentMethod: 'CASH',
        status: 'COMPLETED',
        note: `Penarikan Simpanan Sukarela - ${member.name}${description ? ` (${description})` : ''}`,
        date: new Date(date),
        updatedAt: new Date(),
        isProduction: true,
      },
    });

    // Recalculate member balance from all transactions (more reliable than decrementing)
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

    // Create financial transaction entry (EXPENSE)
    await prisma.transactions.create({
      data: {
        id: randomUUID(),
        invoiceNumber: generateInvoiceNumber(),
        memberId: id,
        type: 'EXPENSE',
        totalAmount: amount,
        paymentMethod: 'CASH',
        status: 'COMPLETED',
        note: `Tarik Simpanan Sukarela - ${member.name}${description ? ` (${description})` : ''}`,
        date: new Date(date),
        updatedAt: new Date(),
        isProduction: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Withdrawal successful',
      data: {
        saving,
        member: updatedMember,
      },
    });
  } catch (error: any) {
    console.error('Error withdrawing savings:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

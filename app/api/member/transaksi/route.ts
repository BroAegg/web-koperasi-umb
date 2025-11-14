import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get member data
    const member = await prisma.members.findFirst({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
      },
    });

    if (!member) {
      return NextResponse.json(
        { success: false, message: 'Member not found' },
        { status: 404 }
      );
    }

    // Get all transactions for this member
    const transactions = await prisma.transactions.findMany({
      where: {
        memberId: member.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        transaction_items: {
          select: {
            quantity: true,
          },
        },
      },
    });

    // Map transactions with calculated data
    const mappedTransactions = transactions.map((transaction) => {
      const itemCount = transaction.transaction_items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      // Calculate points earned (1 point per 1000 spent)
      const pointsEarned = Math.floor(Number(transaction.totalAmount) / 1000);

      return {
        id: transaction.id,
        invoiceNumber: transaction.invoiceNumber,
        date: transaction.createdAt.toISOString(),
        totalAmount: Number(transaction.totalAmount),
        pointsEarned,
        itemCount,
        paymentMethod: transaction.paymentMethod,
      };
    });

    // Calculate totals
    const totalSpent = mappedTransactions.reduce(
      (sum, transaction) => sum + transaction.totalAmount,
      0
    );
    const totalPoints = mappedTransactions.reduce(
      (sum, transaction) => sum + transaction.pointsEarned,
      0
    );
    const totalTransactions = mappedTransactions.length;

    const data = {
      transactions: mappedTransactions,
      totalSpent,
      totalPoints,
      totalTransactions,
    };

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching transaction data:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

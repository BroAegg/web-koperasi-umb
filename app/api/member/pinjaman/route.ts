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

    // Get all loans
    const loans = await prisma.loans.findMany({
      where: {
        memberId: member.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        amount: true,
        remainingAmount: true,
        interestRate: true,
        tenor: true,
        monthlyPayment: true,
        status: true,
        purpose: true,
        approvedAt: true,
        createdAt: true,
      },
    });

    // Separate active and completed loans
    const activeLoans = loans
      .filter((loan) => ['PENDING', 'APPROVED', 'ACTIVE'].includes(loan.status))
      .map((loan) => {
        const startDate = loan.approvedAt || loan.createdAt;
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + loan.tenor);

        const monthsElapsed = Math.floor(
          (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
        );
        const paidMonths = Math.min(monthsElapsed, loan.tenor);

        return {
          id: loan.id,
          amount: loan.amount,
          remaining: loan.remainingAmount,
          interestRate: loan.interestRate,
          tenor: loan.tenor,
          monthlyPayment: loan.monthlyPayment,
          status: loan.status as any,
          purpose: loan.purpose,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          paidMonths,
        };
      });

    const completedLoans = loans
      .filter((loan) => ['COMPLETED', 'REJECTED'].includes(loan.status))
      .map((loan) => {
        const startDate = loan.approvedAt || loan.createdAt;
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + loan.tenor);

        return {
          id: loan.id,
          amount: loan.amount,
          remaining: loan.remainingAmount,
          interestRate: loan.interestRate,
          tenor: loan.tenor,
          monthlyPayment: loan.monthlyPayment,
          status: loan.status as any,
          purpose: loan.purpose,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          paidMonths: loan.tenor,
        };
      });

    // Calculate totals
    const totalLoanAmount = activeLoans.reduce((sum, loan) => sum + loan.amount, 0);
    const totalRemaining = activeLoans.reduce((sum, loan) => sum + loan.remaining, 0);

    // Check if member can apply for new loan
    // Rule: Max 2 active loans
    const canApplyNew = activeLoans.length < 2;

    const data = {
      activeLoans,
      completedLoans,
      totalLoanAmount,
      totalRemaining,
      canApplyNew,
    };

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching loan data:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

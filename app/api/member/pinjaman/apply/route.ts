import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { amount, tenor, purpose } = body;

    // Validation
    if (!amount || !tenor || !purpose) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (amount < 500000 || amount > 50000000) {
      return NextResponse.json(
        { success: false, message: 'Jumlah pinjaman harus antara Rp 500.000 - Rp 50.000.000' },
        { status: 400 }
      );
    }

    if (![6, 12, 18, 24, 36].includes(parseInt(tenor))) {
      return NextResponse.json(
        { success: false, message: 'Tenor tidak valid' },
        { status: 400 }
      );
    }

    // Get member data
    const member = await prisma.members.findFirst({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!member) {
      return NextResponse.json(
        { success: false, message: 'Member not found' },
        { status: 404 }
      );
    }

    // Check active loans limit
    const activeLoansCount = await prisma.loans.count({
      where: {
        memberId: member.id,
        status: {
          in: ['PENDING', 'APPROVED', 'ACTIVE'],
        },
      },
    });

    if (activeLoansCount >= 2) {
      return NextResponse.json(
        { success: false, message: 'Anda sudah memiliki 2 pinjaman aktif. Maksimal 2 pinjaman aktif.' },
        { status: 400 }
      );
    }

    // Calculate loan details
    // Interest rate based on tenor (simple example)
    const interestRate = tenor <= 12 ? 1.5 : tenor <= 24 ? 2.0 : 2.5;
    
    // Calculate monthly payment using flat interest
    const totalInterest = (amount * interestRate * tenor) / 100;
    const totalAmount = amount + totalInterest;
    const monthlyPayment = Math.ceil(totalAmount / tenor);

    // Create loan application
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + tenor);
    
    const loan = await prisma.loans.create({
      data: {
        memberId: member.id,
        amount,
        remainingAmount: totalAmount,
        interestRate,
        tenor,
        monthlyPayment,
        purpose,
        status: 'PENDING',
        endDate,
      },
    });

    // Log activity
    await prisma.activity_logs.create({
      data: {
        id: randomUUID(),
        userId: session.user.id,
        userRole: 'USER',
        action: 'LOAN_APPLICATION',
        module: 'MEMBER_PORTAL',
        description: `Pengajuan pinjaman sebesar ${new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
        }).format(amount)} - ${purpose}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Pengajuan pinjaman berhasil',
      data: {
        loanId: loan.id,
        amount,
        tenor,
        interestRate,
        monthlyPayment,
        totalAmount,
      },
    });
  } catch (error) {
    console.error('Error applying loan:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

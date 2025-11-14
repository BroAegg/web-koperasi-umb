import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get member data with relations
    const member = await prisma.members.findUnique({
      where: { userId: session.user.id },
      include: {
        loans: {
          where: { status: 'ACTIVE' },
        },
        transactions: {
          where: {
            date: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        },
      },
    });

    if (!member) {
      return NextResponse.json(
        { success: false, error: 'Member not found' },
        { status: 404 }
      );
    }

    // Calculate totals
    const totalSimpanan =
      Number(member.simpananPokok) +
      Number(member.simpananWajib) +
      Number(member.simpananSukarela);

    const activeLoans = member.loans.length;
    const totalLoanAmount = member.loans.reduce(
      (sum, loan) => sum + Number(loan.remainingAmount),
      0
    );

    const recentTransactions = member.transactions.length;

    const memberData = {
      id: member.id,
      nomorAnggota: member.nomorAnggota,
      name: member.name,
      email: member.email,
      phone: member.phone,
      unitKerja: member.unitKerja,
      gender: member.gender,
      joinDate: member.joinDate,
      status: member.status,
      isMemberKoperasi: member.isMemberKoperasi,
      simpananPokok: Number(member.simpananPokok),
      simpananWajib: Number(member.simpananWajib),
      simpananSukarela: Number(member.simpananSukarela),
      totalSimpanan,
      points: member.points,
      tier: member.tier,
      totalSpent: Number(member.totalSpent),
      activeLoans,
      totalLoanAmount,
      recentTransactions,
    };

    return NextResponse.json({
      success: true,
      data: memberData,
    });
  } catch (error) {
    console.error('Error fetching member dashboard:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

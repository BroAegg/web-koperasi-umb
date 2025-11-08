import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    const member = await prisma.member.findUnique({
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
    const saving = await prisma.saving.create({
      data: {
        memberId: id,
        type: 'WITHDRAWAL',
        amount,
        date: new Date(date),
        description: description || 'Penarikan Simpanan Sukarela',
      },
    });

    // Update member balance (deduct from Simpanan Sukarela)
    const updatedMember = await prisma.member.update({
      where: { id },
      data: {
        simpananSukarela: member.simpananSukarela - amount,
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

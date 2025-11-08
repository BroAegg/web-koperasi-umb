import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
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
    const member = await prisma.member.findUnique({
      where: { id },
    });

    if (!member) {
      return NextResponse.json(
        { success: false, error: 'Member not found' },
        { status: 404 }
      );
    }

    // Create savings transaction
    const saving = await prisma.saving.create({
      data: {
        memberId: id,
        type: type.toUpperCase(), // SUKARELA or WAJIB
        amount,
        date: new Date(date),
        description: description || `Setor Simpanan ${type}`,
      },
    });

    // Update member balance
    const updatedMember = await prisma.member.update({
      where: { id },
      data: {
        simpananWajib: type === 'WAJIB' 
          ? member.simpananWajib + amount 
          : member.simpananWajib,
        simpananSukarela: type === 'SUKARELA' 
          ? member.simpananSukarela + amount 
          : member.simpananSukarela,
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

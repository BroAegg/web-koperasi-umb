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

    // Get member data with savings
    const member = await prisma.members.findFirst({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        simpananPokok: true,
        simpananWajib: true,
        simpananSukarela: true,
      },
    });

    if (!member) {
      return NextResponse.json(
        { success: false, message: 'Member not found' },
        { status: 404 }
      );
    }

    // Get savings history
    const history = await prisma.savings.findMany({
      where: {
        memberId: member.id,
      },
      orderBy: {
        date: 'desc',
      },
      take: 50,
      select: {
        id: true,
        type: true,
        amount: true,
        description: true,
        date: true,
      },
    });

    // Calculate total
    const totalSimpanan = 
      Number(member.simpananPokok) + 
      Number(member.simpananWajib) + 
      Number(member.simpananSukarela);

    // Map history
    const mappedHistory = history.map((item) => {
      return {
        id: item.id,
        type: item.type as 'POKOK' | 'WAJIB' | 'SUKARELA',
        amount: Number(item.amount),
        date: item.date.toISOString(),
        description: item.description || '',
      };
    });

    const data = {
      simpananPokok: Number(member.simpananPokok),
      simpananWajib: Number(member.simpananWajib),
      simpananSukarela: Number(member.simpananSukarela),
      totalSimpanan,
      history: mappedHistory,
    };

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching simpanan data:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    // Get savings history (from pointsHistory as placeholder)
    // In production, you would have a dedicated savings_transactions table
    const history = await prisma.pointsHistory.findMany({
      where: {
        memberId: member.id,
        type: 'EARN', // Using as placeholder for savings deposits
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
      select: {
        id: true,
        points: true,
        description: true,
        createdAt: true,
      },
    });

    // Calculate total
    const totalSimpanan = 
      member.simpananPokok + 
      member.simpananWajib + 
      member.simpananSukarela;

    // Map history with type classification
    const mappedHistory = history.map((item) => {
      // Determine type based on description
      let type: 'POKOK' | 'WAJIB' | 'SUKARELA' = 'SUKARELA';
      if (item.description.includes('Pokok')) type = 'POKOK';
      else if (item.description.includes('Wajib')) type = 'WAJIB';

      return {
        id: item.id,
        type,
        amount: item.points * 1000, // Convert points to currency (placeholder)
        date: item.createdAt.toISOString(),
        description: item.description,
      };
    });

    const data = {
      simpananPokok: member.simpananPokok,
      simpananWajib: member.simpananWajib,
      simpananSukarela: member.simpananSukarela,
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

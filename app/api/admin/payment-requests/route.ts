import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';

// GET - List pending payment requests (admin only)
export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization') || '';
    const token = auth.replace(/^Bearer\s+/i, '');
    const user = await getUserFromToken(token);
    
    if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role as string)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'PENDING';

    // Fetch payment requests
    const requests = await prisma.consignment_payments.findMany({
      where: {
        status: status as any,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        suppliers: {
          select: {
            id: true,
            businessName: true,
            ownerName: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: requests.map(r => ({
        id: r.id,
        supplier: r.suppliers ? {
          id: r.suppliers.id,
          businessName: r.suppliers.businessName,
          ownerName: r.suppliers.ownerName,
          phone: r.suppliers.phone,
          email: r.suppliers.email,
        } : null,
        amount: r.amount,
        period: r.period,
        periodStart: r.periodStart,
        periodEnd: r.periodEnd,
        status: r.status,
  // @ts-ignore
  proofImageUrl: r.proofImageUrl,
  // @ts-ignore
  bankName: r.bankName,
  // @ts-ignore
  accountNumber: r.accountNumber,
        note: r.note,
  // @ts-ignore
  requestedAt: r.requestedAt,
  // @ts-ignore
  reviewedAt: r.reviewedAt,
  // @ts-ignore
  reviewedBy: r.reviewedBy,
  // @ts-ignore
  rejectedReason: r.rejectedReason,
        createdAt: r.createdAt,
      })),
      count: requests.length,
    });
  } catch (error) {
    console.error('Get payment requests error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

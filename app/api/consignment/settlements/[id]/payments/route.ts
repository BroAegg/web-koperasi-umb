import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { logActivity } from '@/lib/activity-logger';

// POST /api/consignment/settlements/[id]/payments - Record payment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: supplierId } = await params;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    const body = await request.json();
    const {
      amount,
      period,
      periodStart,
      periodEnd,
      paymentMethod = 'TRANSFER',
      note,
      accountNumber,
      bankName,
      proofImageUrl,
    } = body;

    // Validate required fields
    if (!amount || !period || !periodStart || !periodEnd) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate supplier exists
    const supplier = await prisma.suppliers.findUnique({
      where: { id: supplierId },
      select: { id: true, businessName: true, email: true },
    });

    if (!supplier) {
      return NextResponse.json(
        { success: false, message: 'Supplier not found' },
        { status: 404 }
      );
    }

    // Create payment record
    const payment = await prisma.consignment_payments.create({
      data: {
        supplierId,
        supplierName: supplier.businessName,
        amount: parseFloat(amount),
        period,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        paymentMethod,
        paidBy: session.user.id,
        note,
        accountNumber,
        bankName,
        proofImageUrl,
        status: 'PAID',
        requestedAt: new Date(),
        requestedBy: session.user.id,
        reviewedAt: new Date(),
        reviewedBy: session.user.id,
      },
    });

    // Log activity
    await logActivity({
      userId: session.user.id,
      userRole: session.user.role,
      action: 'RECORD_PAYMENT',
      module: 'CONSIGNMENT_SETTLEMENT',
      description: `Recorded payment of Rp ${amount.toLocaleString('id-ID')} for supplier ${supplier.businessName}`,
      metadata: {
        paymentId: payment.id,
        supplierId,
        amount: parseFloat(amount),
        period,
        paymentMethod,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Payment recorded successfully',
      data: payment,
    });
  } catch (error) {
    console.error('Error recording payment:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/consignment/settlements/[id]/payments - Get payment history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: supplierId } = await params;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    const { searchParams } = new URL(request.url);
    const periodStart = searchParams.get('periodStart');
    const periodEnd = searchParams.get('periodEnd');

    // Build query conditions
    const whereConditions: any = { supplierId };
    
    if (periodStart && periodEnd) {
      whereConditions.periodStart = { gte: new Date(periodStart) };
      whereConditions.periodEnd = { lte: new Date(periodEnd) };
    }

    // Get payment history
    const payments = await prisma.consignment_payments.findMany({
      where: whereConditions,
      orderBy: { createdAt: 'desc' },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Calculate totals
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const completedPayments = payments.filter(p => p.status === 'PAID');
    const pendingPayments = payments.filter(p => p.status === 'PENDING');

    return NextResponse.json({
      success: true,
      data: {
        payments,
        summary: {
          totalPayments: payments.length,
          completedPayments: completedPayments.length,
          pendingPayments: pendingPayments.length,
          totalPaid,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

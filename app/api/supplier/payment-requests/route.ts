import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';

// Helper function to calculate period dates
function getPeriodDates(period: string): { periodStart: Date; periodEnd: Date } {
  const now = new Date();
  const periodEnd = new Date(now);
  let periodStart = new Date(now);

  switch (period) {
    case 'today':
      periodStart.setHours(0, 0, 0, 0);
      periodEnd.setHours(23, 59, 59, 999);
      break;
    case '7days':
      periodStart.setDate(now.getDate() - 7);
      break;
    case '1month':
      periodStart.setMonth(now.getMonth() - 1);
      break;
    case '3months':
      periodStart.setMonth(now.getMonth() - 3);
      break;
    case '6months':
      periodStart.setMonth(now.getMonth() - 6);
      break;
    case '1year':
      periodStart.setFullYear(now.getFullYear() - 1);
      break;
    default:
      periodStart.setDate(now.getDate() - 7);
  }

  return { periodStart, periodEnd };
}

// GET - List supplier's own payment requests
export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization') || '';
    const token = auth.replace(/^Bearer\s+/i, '');
    const user = await getUserFromToken(token);
    
    if (!user || user.role !== 'SUPPLIER') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Supplier access only' },
        { status: 401 }
      );
    }

    // Get supplier ID from user
    const supplier = await prisma.suppliers.findUnique({
      where: { email: user.email },
      select: { id: true },
    });

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier not found' },
        { status: 404 }
      );
    }

    // Fetch payment requests for this supplier
    // @ts-ignore - Prisma types cache issue
    const requests = await prisma.consignment_payments.findMany({
      where: {
        requestedBy: supplier.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        users: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: requests.map(r => ({
        id: r.id,
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
    });
  } catch (error) {
    console.error('Get payment requests error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Submit payment request
export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization') || '';
    const token = auth.replace(/^Bearer\s+/i, '');
    const user = await getUserFromToken(token);
    
    if (!user || user.role !== 'SUPPLIER') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Supplier access only' },
        { status: 401 }
      );
    }

    // Get supplier details
    const supplier = await prisma.suppliers.findUnique({
      where: { email: user.email },
      select: { id: true, businessName: true },
    });

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier not found' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { amount, period, proofImageUrl, bankName, accountNumber, note } = body;

    if (!amount || !period || !proofImageUrl) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: amount, period, proofImageUrl' },
        { status: 400 }
      );
    }

    const { periodStart, periodEnd } = getPeriodDates(period);

    // Check if there's already a pending request for this period
    // @ts-ignore
    const existingRequest = await prisma.consignment_payments.findFirst({
      where: {
        requestedBy: supplier.id,
        period: period,
        periodStart: periodStart,
        periodEnd: periodEnd,
        status: 'PENDING',
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { success: false, error: 'You already have a pending request for this period' },
        { status: 400 }
      );
    }

    // Create payment request
    // @ts-ignore - Prisma types cache issue  
    const paymentRequest = await prisma.consignment_payments.create({
      data: {
        id: `payreq-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        supplierId: supplier.id,
        supplierName: supplier.businessName,
        amount: parseFloat(amount),
        period: period,
        periodStart: periodStart,
        periodEnd: periodEnd,
        status: 'PENDING',
        paymentMethod: 'TRANSFER',
        paidBy: user.id, // Will be updated when admin approves
        proofImageUrl: proofImageUrl,
        bankName: bankName || null,
        accountNumber: accountNumber || null,
        note: note || null,
        requestedBy: supplier.id,
        requestedAt: new Date(),
        metadata: {
          submittedBy: user.name,
          submittedEmail: user.email,
        },
      },
    });

    // Create activity log
    await prisma.activity_logs.create({
      data: {
        id: `alog-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        userId: user.id,
        userRole: 'SUPPLIER',
        action: 'PAYMENT_REQUEST_SUBMITTED',
        module: 'CONSIGNMENT',
        description: `Supplier ${supplier.businessName} submitted payment request | amount: Rp ${amount.toLocaleString('id-ID')} | period: ${period}`,
        metadata: { 
          requestId: paymentRequest.id,
          supplierId: supplier.id,
          amount,
          period,
        },
        isProduction: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: paymentRequest.id,
        status: paymentRequest.status,
        amount: paymentRequest.amount,
        createdAt: paymentRequest.createdAt,
      },
      message: 'Payment request submitted successfully. Admin will review shortly.',
    });
  } catch (error) {
    console.error('Submit payment request error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

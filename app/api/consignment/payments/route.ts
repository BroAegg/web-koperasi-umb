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
      periodStart.setDate(now.getDate() - 7); // default to 7 days
  }

  return { periodStart, periodEnd };
}

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization') || '';
    const token = auth.replace(/^Bearer\s+/i, '');
    const user = await getUserFromToken(token);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    // Only allow admin / super_admin to record payments
    if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role as string) && !(user.developerSession && user.developerSession.actualRole === 'DEVELOPER')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const supplierIds: string[] = Array.isArray(body.supplierIds) ? body.supplierIds : [];
    const amountMap: Record<string, number> = body.amounts || {};
    const period: string = body.period || '7days'; // default period
    const paymentMethod: string = body.paymentMethod || 'CASH'; // default payment method
    const note: string | undefined = body.note;

    if (!supplierIds.length) return NextResponse.json({ success: false, error: 'No supplierIds provided' }, { status: 400 });

    const { periodStart, periodEnd } = getPeriodDates(period);

    // Create transactions and payment records for each supplier
    const created: Array<{ supplierId: string; amount: number; transactionId: string; paymentId: string }> = [];

    for (const supplierId of supplierIds) {
      const amount = typeof amountMap[supplierId] === 'number' ? amountMap[supplierId] : 0;
      if (amount <= 0) continue; // skip if no amount

      // Generate unique IDs
      const transactionId = `txn-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const paymentId = `cpay-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      // Create EXPENSE transaction
      await prisma.transactions.create({
        data: {
          id: transactionId,
          type: 'EXPENSE',
          totalAmount: amount,
          paymentMethod: paymentMethod as any,
          note: note,
          createdAt: new Date(),
          updatedAt: new Date(),
          isProduction: user.developerSession?.isProduction ?? true,
        },
      });

      // Create consignment payment record
      await prisma.consignment_payments.create({
        data: {
          id: paymentId,
          supplierName: supplierId,
          amount: amount,
          period: period,
          periodStart: periodStart,
          periodEnd: periodEnd,
          status: 'PAID',
          paymentMethod: paymentMethod as any,
          transactionId: transactionId,
          paidBy: (user as any).id,
          note: note,
          metadata: {
            paidBy: user.name,
            paidAt: new Date().toISOString(),
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Create activity log
      await prisma.activity_logs.create({
        data: {
          id: `alog-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          userId: (user as any).id,
          userRole: (user as any).role as any,
          action: 'CONSIGNMENT_PAYMENT',
          module: 'INVENTORY',
          description: `Pembayaran titipan ke supplier ${supplierId} | amount: Rp ${amount.toLocaleString('id-ID')} | method: ${paymentMethod}`,
          metadata: { supplierId, amount, transactionId, paymentId, paymentMethod, period },
          isProduction: user.developerSession?.isProduction ?? true,
        },
      });

      created.push({ supplierId, amount, transactionId, paymentId });
    }

    return NextResponse.json({ 
      success: true, 
      created, 
      message: `${created.length} pembayaran berhasil dicatat` 
    });
  } catch (err) {
    console.error('consignment payment error', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

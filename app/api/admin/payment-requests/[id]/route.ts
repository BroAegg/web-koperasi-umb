import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';
import { generateInvoiceNumber } from '@/lib/invoice-generator';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // Await the params Promise
    const auth = req.headers.get('authorization') || '';
    const token = auth.replace(/^Bearer\s+/i, '');
    const user = await getUserFromToken(token);
    
    if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role as string)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action, rejectedReason } = body; // action: 'approve' | 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Use "approve" or "reject"' },
        { status: 400 }
      );
    }

    // Get payment request
    const paymentRequest = await prisma.consignment_payments.findUnique({
      where: { id },
      include: {
        suppliers: {
          select: {
            id: true,
            businessName: true,
          },
        },
      },
    });

    if (!paymentRequest) {
      return NextResponse.json(
        { success: false, error: 'Payment request not found' },
        { status: 404 }
      );
    }

    if (paymentRequest.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, error: `Request already ${paymentRequest.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    if (action === 'reject') {
      // Reject the request
      if (!rejectedReason) {
        return NextResponse.json(
          { success: false, error: 'Rejected reason is required' },
          { status: 400 }
        );
      }

      const updated = await prisma.consignment_payments.update({
        where: { id },
        data: {
          status: 'REJECTED',
          // @ts-ignore
          reviewedBy: user.id,
          reviewedAt: new Date(),
          rejectedReason: rejectedReason,
        },
      });

      // Create activity log
      await prisma.activity_logs.create({
        data: {
          id: `alog-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          userId: user.id,
          userRole: user.role as any,
          action: 'PAYMENT_REQUEST_REJECTED',
          module: 'CONSIGNMENT',
          description: `Admin rejected payment request from ${paymentRequest.suppliers?.businessName || 'Unknown'} | amount: Rp ${paymentRequest.amount.toLocaleString('id-ID')} | reason: ${rejectedReason}`,
          metadata: { 
            requestId: id,
            supplierId: paymentRequest.supplierId,
            amount: paymentRequest.amount,
            rejectedReason,
          },
          isProduction: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Payment request rejected',
        data: {
          id: updated.id,
          status: updated.status,
        },
      });
    } else {
      // Approve and create transaction
      const transactionId = `txn-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const invoiceNumber = generateInvoiceNumber();

      // Create EXPENSE transaction
      await prisma.transactions.create({
        data: {
          id: transactionId,
          invoiceNumber,
          type: 'EXPENSE',
          totalAmount: paymentRequest.amount,
          paymentMethod: paymentRequest.paymentMethod,
          note: `Pembayaran konsinyasi ${paymentRequest.period} - ${paymentRequest.suppliers?.businessName || 'Supplier'}`,
          createdAt: new Date(),
          updatedAt: new Date(),
          isProduction: true,
        },
      });

      // Update payment request status to PAID and link transaction
      const updated = await prisma.consignment_payments.update({
        where: { id },
        data: {
          status: 'PAID',
          transactionId: transactionId,
          // @ts-ignore
          reviewedBy: user.id,
          reviewedAt: new Date(),
          paidBy: user.id, // Update paidBy to actual approver
        },
      });

      // Create activity log
      await prisma.activity_logs.create({
        data: {
          id: `alog-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          userId: user.id,
          userRole: user.role as any,
          action: 'PAYMENT_REQUEST_APPROVED',
          module: 'CONSIGNMENT',
          description: `Admin approved payment request from ${paymentRequest.suppliers?.businessName || 'Unknown'} | amount: Rp ${paymentRequest.amount.toLocaleString('id-ID')} | transaction: ${transactionId}`,
          metadata: { 
            requestId: id,
            supplierId: paymentRequest.supplierId,
            amount: paymentRequest.amount,
            transactionId,
          },
          isProduction: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Payment request approved and transaction created',
        data: {
          id: updated.id,
          status: updated.status,
          transactionId: transactionId,
        },
      });
    }
  } catch (error) {
    console.error('Review payment request error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

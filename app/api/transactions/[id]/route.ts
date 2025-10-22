import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

/**
 * DELETE /api/transactions/[id]
 * Delete a transaction (DEVELOPER only)
 * For testing/cleanup purposes
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is DEVELOPER
    if (authResult.user.role !== 'DEVELOPER') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Only developers can delete transactions' },
        { status: 403 }
      );
    }

    const transactionId = params.id;

    // Check if transaction exists
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        items: true,
      },
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Delete transaction items first (cascade)
    await prisma.transactionItem.deleteMany({
      where: { transactionId },
    });

    // Delete the transaction
    await prisma.transaction.delete({
      where: { id: transactionId },
    });

    return NextResponse.json({
      success: true,
      message: 'Transaction deleted successfully',
      data: {
        deletedTransactionId: transactionId,
        receiptId: existingTransaction.receiptId,
      },
    });

  } catch (error) {
    console.error('Delete transaction error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete transaction' 
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

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
    // Get token from Authorization header or cookie
    const authHeader = request.headers.get('authorization');
    const cookieToken = request.cookies.get('token')?.value;
    const tokenString = authHeader?.replace('Bearer ', '') || cookieToken;

    if (!tokenString) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verifyToken(tokenString);
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Extract isProduction from developer session in token
    const isProduction = decoded.developerSession?.isProduction ?? true;

    // Get user role
    const user = await prisma.users.findUnique({
      where: { id: decoded.userId },
      select: { role: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is DEVELOPER
    if (user.role !== 'DEVELOPER') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Only developers can delete transactions' },
        { status: 403 }
      );
    }

    const transactionId = params.id;

    // Check if transaction exists AND matches current environment
    const existingTransaction = await prisma.transactions.findUnique({
      where: { 
        id: transactionId,
      },
      include: {
        transaction_items: true,
      },
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // CRITICAL: Prevent cross-environment deletion
    if (existingTransaction.isProduction !== isProduction) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Cannot delete ${existingTransaction.isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} transaction while in ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} mode` 
        },
        { status: 403 }
      );
    }

    // Delete transaction items first (cascade)
    await prisma.transaction_items.deleteMany({
      where: { transactionId: transactionId },
    });

    // Delete the transaction
    await prisma.transactions.delete({
      where: { id: transactionId },
    });

    return NextResponse.json({
      success: true,
      message: 'Transaction deleted successfully',
      data: {
        deletedTransactionId: transactionId,
        receiptId: existingTransaction.id.slice(0, 6).toUpperCase(),
        environment: isProduction ? 'PRODUCTION' : 'DEVELOPMENT',
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

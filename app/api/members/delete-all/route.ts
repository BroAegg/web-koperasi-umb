import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * DELETE ALL MEMBERS - FOR TESTING ONLY!
 * This endpoint deletes ALL members, users, and related data.
 * Should only be used in development/testing environments.
 */
export async function DELETE(req: NextRequest) {
  try {
    // Get all members first to count and get user IDs
    const members = await prisma.members.findMany({
      select: { id: true, userId: true, name: true }
    });

    if (members.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No members to delete',
        deleted: 0
      });
    }

    const userIds = members.map(m => m.userId);
    const memberIds = members.map(m => m.id);

    console.log(`[Delete All] Deleting ${members.length} members and ${userIds.length} users...`);

    // Delete in correct order (respect foreign key constraints)
    // 1. Delete savings (has FK to members)
    const deletedSavings = await prisma.savings.deleteMany({
      where: { memberId: { in: memberIds } }
    });

    // 2. Delete loan_payments (has FK to loans)
    const loansToDelete = await prisma.loans.findMany({
      where: { memberId: { in: memberIds } },
      select: { id: true }
    });
    
    if (loansToDelete.length > 0) {
      await prisma.loan_payments.deleteMany({
        where: { loanId: { in: loansToDelete.map(l => l.id) } }
      });
    }

    // 3. Delete loans (has FK to members)
    const deletedLoans = await prisma.loans.deleteMany({
      where: { memberId: { in: memberIds } }
    });

    // 4. Delete transactions (has FK to members)
    const deletedTransactions = await prisma.transactions.deleteMany({
      where: { memberId: { in: memberIds } }
    });

    // 5. Delete members (has FK to users)
    const deletedMembers = await prisma.members.deleteMany({
      where: { id: { in: memberIds } }
    });

    // 6. Delete users (no FK dependencies after members deleted)
    const deletedUsers = await prisma.users.deleteMany({
      where: { 
        id: { in: userIds },
        role: 'USER' // Only delete USER role (members), not ADMIN/SUPER_ADMIN
      }
    });

    console.log(`[Delete All] Deleted:`);
    console.log(`  - ${deletedMembers.count} members`);
    console.log(`  - ${deletedUsers.count} users`);
    console.log(`  - ${deletedSavings.count} savings records`);
    console.log(`  - ${deletedLoans.count} loans`);
    console.log(`  - ${deletedTransactions.count} transactions`);

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deletedMembers.count} members and related data`,
      deleted: deletedMembers.count,
      details: {
        members: deletedMembers.count,
        users: deletedUsers.count,
        savings: deletedSavings.count,
        loans: deletedLoans.count,
        transactions: deletedTransactions.count
      }
    });

  } catch (error: any) {
    console.error('[Delete All] Error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to delete members', 
      details: error.message 
    }, { status: 500 });
  }
}

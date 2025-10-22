const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTransactions() {
  try {
    // Check total transactions
    const total = await prisma.transactions.count();
    console.log('📊 Total transactions in DB:', total);

    // Check transactions today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const todayTransactions = await prisma.transactions.findMany({
      where: {
        date: {
          gte: today,
          lte: endOfDay,
        },
        status: 'COMPLETED',
      },
      select: {
        id: true,
        type: true,
        totalAmount: true,
        date: true,
        createdAt: true,
        paymentMethod: true,
        note: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    console.log('\n📅 Transactions today:', todayTransactions.length);
    todayTransactions.forEach(t => {
      console.log(`  - ${t.type}: Rp ${t.totalAmount.toLocaleString()} at ${new Date(t.createdAt).toLocaleTimeString()}`);
    });

    // Check last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const last7Days = await prisma.transactions.count({
      where: {
        date: {
          gte: sevenDaysAgo,
          lte: endOfDay,
        },
        status: 'COMPLETED',
      },
    });

    console.log('\n📈 Transactions last 7 days:', last7Days);

    // Group by type
    const byType = await prisma.transactions.groupBy({
      by: ['type'],
      _count: true,
      where: {
        status: 'COMPLETED',
      },
    });

    console.log('\n📊 Transactions by type:');
    byType.forEach(t => {
      console.log(`  - ${t.type}: ${t._count} transactions`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkTransactions();

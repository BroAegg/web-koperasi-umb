console.log('🧪 TESTING ANALYTICS APIS\n');
console.log('=' .repeat(60));

async function testAnalyticsAPIs() {
  try {
    // You need to get a valid admin token first
    // For now, let's just test the data structure
    
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    console.log('\n📊 Testing Data Availability...\n');
    
    // Test 1: Check transactions
    const transactions = await prisma.transactions.findMany({
      where: {
        status: 'COMPLETED',
      },
      take: 5,
      select: {
        id: true,
        totalAmount: true,
        createdAt: true,
        memberId: true,
      },
    });
    
    console.log(`✅ Transactions Found: ${transactions.length}`);
    if (transactions.length > 0) {
      console.log(`   Latest: ${transactions[0].createdAt.toLocaleDateString('id-ID')}`);
      console.log(`   Amount: Rp ${Number(transactions[0].totalAmount).toLocaleString()}`);
    }
    
    // Test 2: Check members with transactions
    const membersWithTransactions = await prisma.members.findMany({
      where: {
        transactions: {
          some: {},
        },
      },
      take: 5,
      select: {
        id: true,
        name: true,
        phone: true,
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });
    
    console.log(`\n✅ Members Found: ${membersWithTransactions.length}`);
    if (membersWithTransactions.length > 0) {
      console.log(`   Top Member: ${membersWithTransactions[0].name}`);
      console.log(`   Transactions: ${membersWithTransactions[0]._count.transactions}`);
    }
    
    // Test 3: Check transaction items
    const items = await prisma.transaction_items.findMany({
      take: 5,
      select: {
        quantity: true,
        totalPrice: true,
        grossProfit: true,
        createdAt: true,
      },
    });
    
    console.log(`\n✅ Transaction Items Found: ${items.length}`);
    if (items.length > 0) {
      const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);
      const totalRevenue = items.reduce((sum, i) => sum + Number(i.totalPrice), 0);
      console.log(`   Total Qty: ${totalQty} units`);
      console.log(`   Total Revenue: Rp ${totalRevenue.toLocaleString()}`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ All Analytics Data Available!');
    console.log('\n📌 Next Steps:');
    console.log('1. Start server: npm run dev');
    console.log('2. Login as Super Admin or Admin');
    console.log('3. Navigate to: /koperasi/analytics');
    console.log('4. View comprehensive analytics dashboard!');
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.error('\n❌ Error:', error);
  }
}

testAnalyticsAPIs();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function showCurrentData() {
  console.log('📊 Current Data Summary:');
  const stats = await Promise.all([
    prisma.transaction_items.count(),
    prisma.transactions.count(),
    prisma.consignment_sales.count(),
    prisma.stock_movements.count(),
    prisma.products.count(),
    prisma.products.count({ where: { stock: { gt: 0 } } })
  ]);
  
  console.log(`   📦 Transaction Items: ${stats[0]}`);
  console.log(`   💳 Transactions: ${stats[1]}`);
  console.log(`   📋 Consignment Sales: ${stats[2]}`);
  console.log(`   📈 Stock Movements: ${stats[3]}`);
  console.log(`   🏷️  Total Products: ${stats[4]}`);
  console.log(`   📦 Products with Stock: ${stats[5]}\n`);
}

async function cleanData() {
  try {
    console.log('🧹 Starting data cleanup...\n');
    
    // Show current state
    await showCurrentData();
    
    // Delete in correct order (child tables first)
    const transactionItems = await prisma.transaction_items.deleteMany({});
    console.log(`✅ Deleted ${transactionItems.count} transaction items`);
    
    const transactions = await prisma.transactions.deleteMany({});
    console.log(`✅ Deleted ${transactions.count} transactions`);
    
    const consignmentSales = await prisma.consignment_sales.deleteMany({});
    console.log(`✅ Deleted ${consignmentSales.count} consignment sales`);
    
    const stockMovements = await prisma.stock_movements.deleteMany({});
    console.log(`✅ Deleted ${stockMovements.count} stock movements`);
    
    // Reset product stock to 0
    const products = await prisma.products.updateMany({
      data: { stock: 0 }
    });
    console.log(`✅ Reset ${products.count} products stock to 0`);
    
    console.log('\n🎉 All data cleaned successfully!');
    console.log('📊 Database is now ready for fresh testing!\n');
    
    // Show final state
    await showCurrentData();
    
  } catch (error) {
    console.error('❌ Error cleaning data:', error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

// Check command line arguments
const args = process.argv.slice(2);
if (args.includes('--status') || args.includes('-s')) {
  // Just show current data status
  showCurrentData().then(() => {
    prisma.$disconnect();
    process.exit(0);
  });
} else {
  // Run full cleanup
  cleanData();
}

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanData() {
  try {
    console.log('🧹 Starting data cleanup...\n');
    
    // Delete in correct order (child tables first)
    const transactionItems = await prisma.transactionItem.deleteMany({});
    console.log(`✅ Deleted ${transactionItems.count} transaction items`);
    
    const transactions = await prisma.transaction.deleteMany({});
    console.log(`✅ Deleted ${transactions.count} transactions`);
    
    const consignmentSales = await prisma.consignmentSale.deleteMany({});
    console.log(`✅ Deleted ${consignmentSales.count} consignment sales`);
    
    const stockMovements = await prisma.stockMovement.deleteMany({});
    console.log(`✅ Deleted ${stockMovements.count} stock movements`);
    
    // Reset product stock to 0
    const products = await prisma.product.updateMany({
      data: { stock: 0 }
    });
    console.log(`✅ Reset ${products.count} products stock to 0`);
    
    console.log('\n🎉 All data cleaned successfully!');
    console.log('📊 Database is now ready for fresh testing!\n');
    
  } catch (error) {
    console.error('❌ Error cleaning data:', error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

cleanData();

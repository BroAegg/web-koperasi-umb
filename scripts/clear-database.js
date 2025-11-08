/**
 * 🧹 CLEAR DATABASE SCRIPT
 * 
 * Usage:
 *   node scripts/clear-database.js
 * 
 * This script clears ALL data from database EXCEPT users and categories
 * Perfect for testing features one by one!
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearDatabase() {
  console.log('\n🧹 ========== CLEARING DATABASE ==========\n');

  try {
    // Delete in correct order (respect foreign keys)
    console.log('🗑️  Deleting consignment data...');
    await prisma.consignment_sales.deleteMany({});
    await prisma.consignment_payments.deleteMany({});
    await prisma.consignment_batches.deleteMany({});
    await prisma.consignors.deleteMany({});
    console.log('✅ Consignment data cleared');

    console.log('🗑️  Deleting transactions...');
    await prisma.transaction_items.deleteMany({});
    await prisma.transactions.deleteMany({});
    console.log('✅ Transactions cleared');

    console.log('🗑️  Deleting inventory data...');
    await prisma.stock_movements.deleteMany({});
    await prisma.products.deleteMany({});
    console.log('✅ Inventory cleared');

    console.log('🗑️  Deleting other data...');
    await prisma.broadcasts.deleteMany({});
    await prisma.settlements.deleteMany({});
    await prisma.audit_logs.deleteMany({});
    await prisma.activity_logs.deleteMany({});
    console.log('✅ Other data cleared');

    // Count remaining data
    const userCount = await prisma.users.count();
    const memberCount = await prisma.members.count();
    const categoryCount = await prisma.categories.count();

    console.log('\n📊 ========== DATABASE STATUS ==========');
    console.log(`✅ Users: ${userCount} (preserved)`);
    console.log(`✅ Members: ${memberCount} (preserved)`);
    console.log(`✅ Categories: ${categoryCount} (preserved)`);
    console.log('✅ Products: 0');
    console.log('✅ Transactions: 0');
    console.log('✅ Stock Movements: 0');
    console.log('✅ Consignment Data: 0');
    console.log('========================================\n');

    console.log('✨ Database cleared successfully!');
    console.log('💡 You can now test features one by one\n');

  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase();

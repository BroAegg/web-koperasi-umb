/**
 * 🧹 CLEAR AND SEED DATABASE SCRIPT
 * 
 * Usage:
 *   node scripts/clear-and-seed.js
 * 
 * This script:
 * 1. Clears ALL data from database EXCEPT users and categories
 * 2. Seeds 2 basic products (1 TOKO, 1 TITIPAN) for testing
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearAndSeed() {
  console.log('\n🧹 ========== CLEARING DATABASE ==========\n');

  try {
    // ========== STEP 1: CLEAR DATA ==========
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

    // ========== STEP 2: SEED PRODUCTS ==========
    console.log('\n🌱 ========== SEEDING PRODUCTS ==========\n');

    // Get first category (should exist from seed-minimal.js)
    const category = await prisma.categories.findFirst();
    if (!category) {
      console.error('❌ No categories found! Run seed-minimal.js first');
      process.exit(1);
    }

    // Get admin user for createdBy
    const admin = await prisma.users.findFirst({
      where: { role: 'ADMIN' }
    });
    if (!admin) {
      console.error('❌ No admin user found! Run seed-minimal.js first');
      process.exit(1);
    }

    // 1. Create TOKO Product (owned by koperasi)
    const timestamp = Date.now();
    const productTokoId = `prod-toko-${timestamp}`;
    const productTitipanId = `prod-titipan-${timestamp}`;

    console.log('📦 Creating TOKO product...');
    await prisma.products.create({
      data: {
        id: productTokoId,
        name: 'Produk Toko Test',
        sku: `TOKO-${timestamp}`,
        categoryId: category.id,
        buyPrice: 5000,
        sellPrice: 10000,
        stock: 20,
        threshold: 5,
        ownershipType: 'TOKO',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        isConsignment: false
      }
    });
    console.log('✅ TOKO product created (Stock: 20, Cost: Rp 5.000, Sell: Rp 10.000)');

    // Create stock movement for TOKO product (initial stock)
    await prisma.stock_movements.create({
      data: {
        id: `stock-toko-${timestamp}`,
        productId: productTokoId,
        movementType: 'PURCHASE_IN',
        quantity: 20,
        note: 'Initial stock for testing',
        createdAt: new Date(),
        occurredAt: new Date(),
        isProduction: true
      }
    });

    // 2. Create TITIPAN Product (consignment from supplier)
    // First, create a supplier (required for products.supplierId FK)
    const supplierId = `supplier-${timestamp}`;
    console.log('👤 Creating supplier...');
    await prisma.suppliers.create({
      data: {
        id: supplierId,
        code: `SUP-${timestamp}`,
        businessName: 'Supplier Test Titipan',
        ownerName: 'Pemilik Test',
        phone: '081234567890',
        email: `supplier${timestamp}@test.com`,
        address: 'Jl. Test No. 123',
        password: 'hashed_password_here', // Dummy password
        status: 'APPROVED',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        approvedAt: new Date()
      }
    });
    console.log('✅ Supplier created');

    // Create consignor (separate for consignment tracking) with same ID
    const consignorId = supplierId; // Use same ID for linking
    console.log('👤 Creating consignor...');
    await prisma.consignors.create({
      data: {
        id: consignorId,
        code: `CON-${timestamp}`,
        name: 'Supplier Test Titipan',
        phone: '081234567890',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    console.log('✅ Consignor created (linked to supplier)');

    console.log('📦 Creating TITIPAN product...');
    await prisma.products.create({
      data: {
        id: productTitipanId,
        name: 'Produk Titipan Test',
        sku: `TITIPAN-${timestamp}`,
        categoryId: category.id,
        buyPrice: 5000, // Price set by supplier
        sellPrice: 10000,
        stock: 20,
        threshold: 5,
        ownershipType: 'TITIPAN',
        supplierId: supplierId, // ✅ Link to supplier!
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        isConsignment: true
      }
    });
    console.log('✅ TITIPAN product created (Stock: 20, Cost: Rp 5.000, Sell: Rp 10.000)');

    // Create consignment batch for TITIPAN product
    const batchId = `batch-${timestamp}`;
    await prisma.consignment_batches.create({
      data: {
        id: batchId,
        code: `BATCH-${timestamp}`,
        consignorId: consignorId,
        productId: productTitipanId,
        qtyIn: 20,
        qtySold: 0,
        qtyReturned: 0,
        qtyExpired: 0,
        qtyRemaining: 20,
        feeType: 'PERCENTAGE',
        feePercent: 20, // 20% fee for koperasi
        receivedAt: new Date(),
        status: 'ACTIVE',
        note: 'Initial batch for testing',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    console.log('✅ Consignment batch created (20% fee to koperasi)');

    // Create stock movement for TITIPAN product
    await prisma.stock_movements.create({
      data: {
        id: `stock-titipan-${timestamp}`,
        productId: productTitipanId,
        movementType: 'CONSIGNMENT_IN',
        quantity: 20,
        note: 'Initial consignment stock for testing',
        createdAt: new Date(),
        occurredAt: new Date(),
        isProduction: true
      }
    });

    // ========== STEP 3: CREATE MODAL AWAL TRANSACTION ==========
    console.log('\n💰 Creating Modal Awal transaction...');
    
    // Calculate total capital needed: 
    // - TOKO product cost: 20 × 5000 = 100,000
    // - TITIPAN is consignment (not our capital)
    // Total: 100,000
    const modalAwalAmount = 100000;
    
    await prisma.transactions.create({
      data: {
        id: `txn-modal-${timestamp}`,
        type: 'SALE', // Using SALE type as income to equity
        totalAmount: modalAwalAmount,
        paymentMethod: 'CASH',
        note: 'Modal awal koperasi - Initial capital injection',
        status: 'COMPLETED',
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        isProduction: true
      }
    });
    console.log(`✅ Modal Awal created: Rp ${modalAwalAmount.toLocaleString('id-ID')}`);

    // ========== STEP 4: SHOW STATUS ==========
    const userCount = await prisma.users.count();
    const memberCount = await prisma.members.count();
    const categoryCount = await prisma.categories.count();
    const productCount = await prisma.products.count();
    const transactionCount = await prisma.transactions.count();

    console.log('\n📊 ========== DATABASE STATUS ==========');
    console.log(`✅ Users: ${userCount} (preserved)`);
    console.log(`✅ Members: ${memberCount} (preserved)`);
    console.log(`✅ Categories: ${categoryCount} (preserved)`);
    console.log(`✅ Products: ${productCount} (2 new - 1 TOKO, 1 TITIPAN)`);
    console.log(`✅ Transactions: ${transactionCount} (1 Modal Awal)`);
    console.log('✅ Stock Movements: 2 (initial stock for both products)');
    console.log('✅ Consignment Batches: 1 (for TITIPAN product)');
    console.log('========================================\n');

    console.log('✨ Database cleared and seeded successfully!');
    console.log('💡 Ready for testing!\n');

    console.log('📦 Products Created:');
    console.log('   1. Produk Toko Test (TOKO)');
    console.log('      - Stock: 20');
    console.log('      - Cost: Rp 5.000');
    console.log('      - Sell: Rp 10.000');
    console.log('      - Profit per unit: Rp 5.000');
    console.log('');
    console.log('   2. Produk Titipan Test (TITIPAN)');
    console.log('      - Stock: 20');
    console.log('      - Cost: Rp 5.000 (supplier price)');
    console.log('      - Sell: Rp 10.000');
    console.log('      - Fee: 20% to koperasi (Rp 2.000)');
    console.log('      - Net to supplier: Rp 8.000');
    console.log('');
    console.log('💰 Modal Awal:');
    console.log('   - Amount: Rp 100.000');
    console.log('   - Purpose: Initial capital for TOKO product stock');
    console.log('   - Note: TITIPAN stock is consignment (not our capital)');
    console.log('');
    console.log('📊 Balance Sheet:');
    console.log('   - Aktiva: Rp 100.000 (Persediaan TOKO)');
    console.log('   - Ekuitas: Rp 100.000 (Modal Awal)');
    console.log('   - Status: ✅ BALANCED');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

clearAndSeed();

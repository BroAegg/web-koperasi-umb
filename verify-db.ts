import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyDatabase() {
  console.log('🔍 Starting Database Verification...\n');

  try {
    // 1. Count records in each table
    console.log('📊 Record Counts:');
    const counts = {
      categories: await prisma.categories.count(),
      users: await prisma.users.count(),
      members: await prisma.members.count(),
      suppliers: await prisma.suppliers.count(),
      consignors: await prisma.consignors.count(),
      products: await prisma.products.count(),
      purchases: await prisma.purchases.count(),
      consignmentBatches: await prisma.consignment_batches.count(),
      consignment_sales: await prisma.consignment_sales.count(),
      transactions: await prisma.transactions.count(),
      stockMovements: await prisma.stock_movements.count(),
    };
    console.table(counts);

    // 2. Check products by ownership type
    console.log('\n📦 Products by Ownership Type:');
    const storeProducts = await prisma.products.findMany({
      where: { ownershipType: 'TOKO' },
      select: { name: true, stockCycle: true, stock: true, sellPrice: true }
    });
    console.log('\n🏪 Store-Owned Products:');
    console.table(storeProducts);

    const consignmentProducts = await prisma.products.findMany({
      where: { ownershipType: 'TITIPAN' },
      select: { name: true, stockCycle: true, stock: true, sellPrice: true }
    });
    console.log('\n🎁 Consignment Products:');
    console.table(consignmentProducts);

    // 3. Check FIFO batches
    console.log('\n📦 FIFO Consignment Batches:');
    const batches = await prisma.consignment_batches.findMany({
      include: {
        products: { select: { name: true } },
        consignors: { select: { name: true } }
      },
      orderBy: { receivedAt: 'asc' }
    });
    
    const batchSummary = batches.map(b => ({
      code: b.code,
      product: b.products.name,
      consignor: b.consignors.name,
      qtyIn: b.qtyIn,
      qtySold: b.qtySold,
      qtyRemaining: b.qtyRemaining,
      feeType: b.feeType,
      status: b.status
    }));
    console.table(batchSummary);

    // 4. Check stock movements
    console.log('\n📊 Stock Movements by Type:');
    const movementsByType = await prisma.stock_movements.groupBy({
      by: ['movementType'],
      _count: { id: true },
      _sum: { quantity: true }
    });
    console.table(movementsByType);

    // 5. Check sample sale with FIFO
    console.log('\n💰 Sample Sale Transaction:');
    const sale = await prisma.transactions.findFirst({
      where: { type: 'SALE' },
      include: {
        transaction_items: {
          include: {
            products: { select: { name: true, ownershipType: true } },
            consignment_sales: {
              include: {
                consignment_batches: { select: { code: true } }
              }
            }
          }
        }
      }
    });

    if (sale) {
      console.log(`\nTransaction ID: ${sale.id}`);
      console.log(`Total Amount: Rp ${sale.totalAmount.toLocaleString()}`);
      console.log(`Payment Method: ${sale.paymentMethod}`);
      console.log('\nItems:');
      
      sale.transaction_items.forEach(item => {
        console.log(`\n  - ${item.products.name} (${item.products.ownershipType})`);
        console.log(`    Qty: ${item.quantity}, Price: Rp ${item.unitPrice.toLocaleString()}`);
        
        if (item.consignment_sales.length > 0) {
          console.log(`    FIFO Batches used:`);
          item.consignment_sales.forEach(cs => {
            console.log(`      • Batch ${cs.consignment_batches.code}: ${cs.qtySold} pcs, Fee: Rp ${cs.feeAmount.toLocaleString()}`);
          });
        }
      });
    }

    // 6. Verify relationships
    console.log('\n\n✅ Database Verification Complete!');
    console.log('\n📈 Summary:');
    console.log(`   Total Products: ${counts.products} (${storeProducts.length} store + ${consignmentProducts.length} consignment)`);
    console.log(`   FIFO Batches: ${counts.consignmentBatches}`);
    console.log(`   Stock Movements: ${counts.stockMovements}`);
    console.log(`   Transactions: ${counts.transactions}`);
    console.log(`   Consignment Sales: ${counts.consignment_sales}`);

  } catch (error) {
    console.error('❌ Verification Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabase();





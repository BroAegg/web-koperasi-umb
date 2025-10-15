import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyDatabase() {
  console.log('🔍 Starting Database Verification...\n');

  try {
    // 1. Count records in each table
    console.log('📊 Record Counts:');
    const counts = {
      categories: await prisma.category.count(),
      users: await prisma.user.count(),
      members: await prisma.member.count(),
      suppliers: await prisma.supplier.count(),
      consignors: await prisma.consignor.count(),
      products: await prisma.product.count(),
      purchases: await prisma.purchase.count(),
      consignmentBatches: await prisma.consignmentBatch.count(),
      consignmentSales: await prisma.consignmentSale.count(),
      transactions: await prisma.transaction.count(),
      stockMovements: await prisma.stockMovement.count(),
    };
    console.table(counts);

    // 2. Check products by ownership type
    console.log('\n📦 Products by Ownership Type:');
    const storeProducts = await prisma.product.findMany({
      where: { ownershipType: 'TOKO' },
      select: { name: true, stockCycle: true, stock: true, sellPrice: true }
    });
    console.log('\n🏪 Store-Owned Products:');
    console.table(storeProducts);

    const consignmentProducts = await prisma.product.findMany({
      where: { ownershipType: 'TITIPAN' },
      select: { name: true, stockCycle: true, stock: true, sellPrice: true }
    });
    console.log('\n🎁 Consignment Products:');
    console.table(consignmentProducts);

    // 3. Check FIFO batches
    console.log('\n📦 FIFO Consignment Batches:');
    const batches = await prisma.consignmentBatch.findMany({
      include: {
        product: { select: { name: true } },
        consignor: { select: { name: true } }
      },
      orderBy: { receivedAt: 'asc' }
    });
    
    const batchSummary = batches.map(b => ({
      code: b.code,
      product: b.product.name,
      consignor: b.consignor.name,
      qtyIn: b.qtyIn,
      qtySold: b.qtySold,
      qtyRemaining: b.qtyRemaining,
      feeType: b.feeType,
      status: b.status
    }));
    console.table(batchSummary);

    // 4. Check stock movements
    console.log('\n📊 Stock Movements by Type:');
    const movementsByType = await prisma.stockMovement.groupBy({
      by: ['movementType'],
      _count: { id: true },
      _sum: { quantity: true }
    });
    console.table(movementsByType);

    // 5. Check sample sale with FIFO
    console.log('\n💰 Sample Sale Transaction:');
    const sale = await prisma.transaction.findFirst({
      where: { type: 'SALE' },
      include: {
        items: {
          include: {
            product: { select: { name: true, ownershipType: true } },
            consignmentSales: {
              include: {
                batch: { select: { code: true } }
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
      
      sale.items.forEach(item => {
        console.log(`\n  - ${item.product.name} (${item.product.ownershipType})`);
        console.log(`    Qty: ${item.quantity}, Price: Rp ${item.unitPrice.toLocaleString()}`);
        
        if (item.consignmentSales.length > 0) {
          console.log(`    FIFO Batches used:`);
          item.consignmentSales.forEach(cs => {
            console.log(`      • Batch ${cs.batch.code}: ${cs.qtySold} pcs, Fee: Rp ${cs.feeAmount.toLocaleString()}`);
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
    console.log(`   Consignment Sales: ${counts.consignmentSales}`);

  } catch (error) {
    console.error('❌ Verification Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabase();

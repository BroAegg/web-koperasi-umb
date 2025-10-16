const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugFinancial() {
  try {
    console.log('🔍 Debugging Financial Data...\n');
    
    // Get all transactions
    const transactions = await prisma.transaction.findMany({
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                ownershipType: true,
                sellPrice: true,
                buyPrice: true,
                avgCost: true,
              }
            }
          }
        }
      }
    });
    
    console.log(`📊 Total Transactions: ${transactions.length}\n`);
    
    let totalRevenue = 0;
    let tokoProfit = 0;
    let consignmentRevenue = 0;
    let consignmentFee = 0;
    
    transactions.forEach((txn, idx) => {
      console.log(`Transaction ${idx + 1}:`);
      console.log(`  Type: ${txn.type}`);
      console.log(`  Total: Rp ${Number(txn.totalAmount).toLocaleString('id-ID')}`);
      console.log(`  Items:`);
      
      txn.items.forEach(item => {
        const revenue = Number(item.totalPrice);
        const cogs = Number(item.totalCogs || 0);
        const profit = Number(item.grossProfit || 0);
        
        totalRevenue += revenue;
        
        console.log(`    - ${item.product.name}`);
        console.log(`      Ownership: ${item.product.ownershipType}`);
        console.log(`      Qty: ${item.quantity} x Rp ${Number(item.unitPrice).toLocaleString('id-ID')}`);
        console.log(`      Revenue: Rp ${revenue.toLocaleString('id-ID')}`);
        console.log(`      COGS: Rp ${cogs.toLocaleString('id-ID')}`);
        console.log(`      Profit: Rp ${profit.toLocaleString('id-ID')}`);
        
        if (item.product.ownershipType === 'TOKO') {
          tokoProfit += profit;
        } else if (item.product.ownershipType === 'TITIPAN') {
          consignmentRevenue += revenue;
          // Assume 20% fee for now (need to check actual fee structure)
          const fee = revenue * 0.2;
          consignmentFee += fee;
        }
      });
      console.log('');
    });
    
    console.log('═══════════════════════════════════');
    console.log('📈 SUMMARY:');
    console.log('═══════════════════════════════════');
    console.log(`💰 Total Omzet: Rp ${totalRevenue.toLocaleString('id-ID')}`);
    console.log(`🏪 Keuntungan Toko: Rp ${tokoProfit.toLocaleString('id-ID')}`);
    console.log(`🎁 Revenue Konsinyasi: Rp ${consignmentRevenue.toLocaleString('id-ID')}`);
    console.log(`💵 Fee Konsinyasi (est 20%): Rp ${consignmentFee.toLocaleString('id-ID')}`);
    console.log(`✅ Total Keuntungan: Rp ${(tokoProfit + consignmentFee).toLocaleString('id-ID')}`);
    console.log('═══════════════════════════════════\n');
    
    // Check stock movements
    const movements = await prisma.stockMovement.findMany({
      include: {
        product: {
          select: {
            name: true,
            ownershipType: true,
          }
        }
      }
    });
    
    console.log(`📦 Total Stock Movements: ${movements.length}`);
    movements.forEach((mov, idx) => {
      console.log(`${idx + 1}. ${mov.movementType}: ${mov.product.name} (${mov.product.ownershipType}) - Qty: ${mov.quantity}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

debugFinancial();

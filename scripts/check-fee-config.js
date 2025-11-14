const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkFeeConfig() {
  console.log('=== SUPPLIER FEE & PROFIT SHARING CONFIG ===\n');
  
  // Check suppliers
  const suppliers = await prisma.suppliers.findMany({
    select: {
      id: true,
      businessName: true,
      monthlyFee: true,
      status: true,
      paymentStatus: true,
    },
  });
  
  console.log(`Found ${suppliers.length} suppliers:\n`);
  suppliers.forEach(s => {
    console.log(`📦 ${s.businessName}`);
    console.log(`   Status: ${s.status}`);
    console.log(`   Payment Status: ${s.paymentStatus || 'N/A'}`);
    console.log(`   Monthly Fee: Rp ${Number(s.monthlyFee || 25000).toLocaleString('id-ID')}`);
    console.log('');
  });
  
  // Check products
  const products = await prisma.products.findMany({
    where: {
      ownershipType: 'SUPPLIER',
    },
    select: {
      name: true,
      profitShareRate: true,
      supplierId: true,
      sellPrice: true,
      suppliers: {
        select: {
          businessName: true,
        },
      },
    },
    take: 5,
  });
  
  console.log(`\n=== PRODUCT PROFIT SHARING ===\n`);
  console.log(`Sample ${products.length} supplier products:\n`);
  products.forEach(p => {
    const profitRate = Number(p.profitShareRate || 90);
    const koperasiRate = 100 - profitRate;
    console.log(`📦 ${p.name}`);
    console.log(`   Supplier: ${p.suppliers?.businessName || 'N/A'}`);
    console.log(`   Sell Price: Rp ${Number(p.sellPrice).toLocaleString('id-ID')}`);
    console.log(`   Profit Share: ${profitRate}% to supplier, ${koperasiRate}% to koperasi`);
    console.log('');
  });
  
  // Check consignment sales
  const sales = await prisma.consignment_sales.findMany({
    where: {
      supplierId: { not: null },
    },
    select: {
      totalRevenue: true,
      feeAmount: true,
      netToConsignor: true,
      isSettled: true,
      supplier: {
        select: {
          businessName: true,
        },
      },
    },
    take: 5,
  });
  
  console.log(`\n=== CONSIGNMENT SALES (Supplier Products) ===\n`);
  console.log(`Sample ${sales.length} sales:\n`);
  sales.forEach(s => {
    const total = Number(s.totalRevenue);
    const fee = Number(s.feeAmount);
    const net = Number(s.netToConsignor);
    const sharePercent = total > 0 ? ((net / total) * 100).toFixed(1) : 0;
    
    console.log(`💰 Revenue: Rp ${total.toLocaleString('id-ID')}`);
    console.log(`   Supplier: ${s.supplier?.businessName || 'N/A'}`);
    console.log(`   Koperasi Fee: Rp ${fee.toLocaleString('id-ID')} (${(fee/total*100).toFixed(1)}%)`);
    console.log(`   Supplier Gets: Rp ${net.toLocaleString('id-ID')} (${sharePercent}%)`);
    console.log(`   Settled: ${s.isSettled ? 'Yes' : 'No (Hutang)'}`);
    console.log('');
  });
  
  await prisma.$disconnect();
}

checkFeeConfig().catch(console.error);

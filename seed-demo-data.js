const { PrismaClient } = require('@prisma/client');
const { randomUUID } = require('crypto');

const prisma = new PrismaClient();

async function main() {
  console.log('🎨 Seeding demo data untuk showcase fitur...');

  // Get existing users and products
  const admin = await prisma.users.findFirst({ where: { role: 'ADMIN' } });
  const products = await prisma.products.findMany({ take: 10 });
  
  if (!admin || products.length === 0) {
    console.log('❌ Jalankan seed.ts dulu sebelum demo data');
    return;
  }

  console.log('📦 Menambahkan transaksi POS untuk 7 hari terakhir...');
  
  const now = new Date();
  const transactionsToCreate = [];
  
  // Create transactions for the last 7 days
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date(now);
    date.setDate(date.getDate() - dayOffset);
    date.setHours(8, 0, 0, 0); // Start at 8 AM
    
    // 5-15 transactions per day
    const txCount = Math.floor(Math.random() * 11) + 5;
    
    for (let i = 0; i < txCount; i++) {
      const txDate = new Date(date);
      // Random hour between 8 AM and 5 PM (business hours)
      const hour = Math.floor(Math.random() * 9) + 8;
      const minute = Math.floor(Math.random() * 60);
      txDate.setHours(hour, minute, 0, 0);
      
      // Random 1-4 items per transaction
      const itemCount = Math.floor(Math.random() * 4) + 1;
      const selectedProducts = [];
      const usedIndices = new Set();
      
      for (let j = 0; j < itemCount; j++) {
        let idx;
        do {
          idx = Math.floor(Math.random() * products.length);
        } while (usedIndices.has(idx));
        usedIndices.add(idx);
        selectedProducts.push(products[idx]);
      }
      
      let totalAmount = 0;
      const items = selectedProducts.map(product => {
        const quantity = Math.floor(Math.random() * 3) + 1;
        // Handle Decimal type from Prisma
        const price = product.price ? parseFloat(product.price.toString()) : 0;
        const subtotal = price * quantity;
        totalAmount += subtotal;
        return {
          productId: product.id,
          productName: product.name,
          quantity,
          price,
          subtotal,
        };
      });
      
      const paymentMethods = ['CASH', 'TRANSFER', 'CREDIT'];
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      
      transactionsToCreate.push({
        date: txDate,
        totalAmount,
        paymentMethod,
        items,
      });
    }
  }

  console.log(`💰 Membuat ${transactionsToCreate.length} transaksi...`);
  
  for (const tx of transactionsToCreate) {
    const txId = `txn-${Date.now()}-${randomUUID().substring(0, 8)}`;
    
    await prisma.transactions.create({
      data: {
        id: txId,
        type: 'SALE',
        totalAmount: tx.totalAmount,
        paymentMethod: tx.paymentMethod,
        status: 'COMPLETED',
        date: tx.date,
        createdAt: tx.date,
        updatedAt: tx.date,
        isProduction: true,
        transaction_items: {
          create: tx.items.map((item, idx) => ({
            id: `${txId}-item-${idx}`,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.price,
            totalPrice: item.subtotal,
          })),
        },
      },
    });
  }

  console.log('💸 Menambahkan beberapa transaksi EXPENSE (pengeluaran)...');
  
  const expenseCategories = [
    { desc: 'Bayar Listrik', amount: 350000 },
    { desc: 'Bayar Air', amount: 150000 },
    { desc: 'Gaji Karyawan', amount: 2500000 },
    { desc: 'Belanja Perlengkapan Kantor', amount: 450000 },
    { desc: 'Servis Peralatan', amount: 200000 },
  ];

  for (let i = 0; i < 5; i++) {
    const expDate = new Date(now);
    expDate.setDate(expDate.getDate() - (i * 2));
    expDate.setHours(10, 0, 0, 0);
    
    const expense = expenseCategories[i];
    
    await prisma.transactions.create({
      data: {
        id: `exp-${Date.now()}-${i}`,
        type: 'EXPENSE',
        totalAmount: expense.amount,
        paymentMethod: 'TRANSFER',
        status: 'COMPLETED',
        note: expense.desc,
        date: expDate,
        createdAt: expDate,
        updatedAt: expDate,
        isProduction: true,
      },
    });
  }

  console.log('📊 Menambahkan stock movements (pergerakan stok)...');
  
  // Add some stock in/out movements
  for (let i = 0; i < 20; i++) {
    const product = products[Math.floor(Math.random() * products.length)];
    const movementDate = new Date(now);
    movementDate.setDate(movementDate.getDate() - Math.floor(Math.random() * 7));
    
    const types = [
      { type: 'PURCHASE_IN', ref: 'Pembelian dari supplier' },
      { type: 'SALE_OUT', ref: 'Penjualan produk' },
      { type: 'ADJUSTMENT', ref: 'Penyesuaian stok' },
      { type: 'RETURN_IN', ref: 'Retur dari customer' },
    ];
    const selected = types[Math.floor(Math.random() * types.length)];
    const quantity = Math.floor(Math.random() * 20) + 1;
    
    await prisma.stock_movements.create({
      data: {
        id: `stk-${Date.now()}-${i}`,
        productId: product.id,
        movementType: selected.type,
        quantity,
        note: `${selected.ref} - ${product.name}`,
        occurredAt: movementDate,
        createdAt: movementDate,
      },
    });
  }

  console.log('🎉 Demo data berhasil ditambahkan!');
  console.log('\n📋 Summary:');
  console.log(`- ${transactionsToCreate.length} transaksi POS (7 hari terakhir)`);
  console.log(`- 5 transaksi EXPENSE (pengeluaran)`);
  console.log(`- 20 stock movements`);
  console.log('\n✅ Silakan login dan cek fitur-fitur berikut:');
  console.log('1. Dashboard Super Admin - Grafik dan statistik');
  console.log('2. Financial Page - Transaksi dan analisis keuangan');
  console.log('3. POS - Sistem kasir dengan quick history');
  console.log('4. Inventory - Manajemen stok dan pembayaran titipan');
  console.log('5. Transactions - Riwayat lengkap transaksi');
  console.log('\n🔐 Login: superadmin@koperasi.com / Password123!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding demo data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

const { PrismaClient } = require('@prisma/client');
const { randomUUID } = require('crypto');
const prisma = new PrismaClient();

async function seedFinancialData() {
  try {
    console.log('🌱 Starting financial data seeding...\n');

    // Get superadmin user
    const superadmin = await prisma.users.findFirst({
      where: { role: 'SUPER_ADMIN' }
    });

    if (!superadmin) {
      console.error('❌ Superadmin not found! Please run seed-developers.ts first');
      return;
    }

    console.log('✅ Found superadmin:', superadmin.email);

    // Get some products for transactions
    const products = await prisma.products.findMany({
      take: 5,
      where: {
        stock: { gt: 0 }
      }
    });

    if (products.length === 0) {
      console.error('❌ No products found! Please add products first');
      return;
    }

    console.log(`✅ Found ${products.length} products\n`);

    // Generate transactions for the last 30 days
    const transactions = [];
    const now = new Date();
    
    console.log('📊 Generating transactions for last 30 days...\n');

    for (let daysAgo = 0; daysAgo < 30; daysAgo++) {
      const date = new Date(now);
      date.setDate(date.getDate() - daysAgo);
      date.setHours(0, 0, 0, 0);

      // Generate 2-5 transactions per day
      const transactionsPerDay = Math.floor(Math.random() * 4) + 2;

      for (let i = 0; i < transactionsPerDay; i++) {
        const hour = Math.floor(Math.random() * 12) + 8; // 8 AM - 8 PM
        const minute = Math.floor(Math.random() * 60);
        const transactionDate = new Date(date);
        transactionDate.setHours(hour, minute, 0, 0);

        // 80% SALE, 15% EXPENSE, 5% INCOME
        const rand = Math.random();
        let transactionType;
        let amount;
        let note;

        if (rand < 0.80) {
          // SALE transaction
          transactionType = 'SALE';
          const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items
          amount = 0;
          
          const selectedProducts = [];
          for (let j = 0; j < numItems; j++) {
            const product = products[Math.floor(Math.random() * products.length)];
            const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 quantity
            const itemTotal = Number(product.sellPrice) * quantity;
            amount += itemTotal;
            
            selectedProducts.push({
              productId: product.id,
              productName: product.name,
              quantity,
              price: Number(product.sellPrice),
              totalPrice: itemTotal,
              totalCogs: Number(product.avgCost || product.buyPrice) * quantity,
            });
          }

          transactions.push({
            type: transactionType,
            amount,
            date: transactionDate,
            createdAt: transactionDate,
            note: `Penjualan ${numItems} item`,
            items: selectedProducts,
          });

        } else if (rand < 0.95) {
          // EXPENSE transaction
          transactionType = 'EXPENSE';
          const expenseTypes = [
            'Listrik',
            'Air',
            'Gaji Karyawan',
            'Sewa Tempat',
            'Pemeliharaan',
            'Transportasi',
            'ATK',
            'Internet',
          ];
          const expenseType = expenseTypes[Math.floor(Math.random() * expenseTypes.length)];
          amount = (Math.floor(Math.random() * 20) + 5) * 10000; // 50k - 250k
          note = `Pengeluaran ${expenseType}`;

          transactions.push({
            type: transactionType,
            amount,
            date: transactionDate,
            createdAt: transactionDate,
            note,
            items: [],
          });

        } else {
          // INCOME transaction
          transactionType = 'INCOME';
          const incomeTypes = [
            'Donasi',
            'Bunga Bank',
            'Lain-lain',
          ];
          const incomeType = incomeTypes[Math.floor(Math.random() * incomeTypes.length)];
          amount = (Math.floor(Math.random() * 30) + 10) * 10000; // 100k - 400k
          note = `Pemasukan ${incomeType}`;

          transactions.push({
            type: transactionType,
            amount,
            date: transactionDate,
            createdAt: transactionDate,
            note,
            items: [],
          });
        }
      }
    }

    console.log(`📝 Created ${transactions.length} transactions\n`);

    // Insert transactions into database
    let saleCount = 0;
    let expenseCount = 0;
    let incomeCount = 0;
    let purchaseCount = 0;

    for (const txn of transactions) {
      const created = await prisma.transactions.create({
        data: {
          id: randomUUID(),
          type: txn.type,
          totalAmount: txn.amount,
          date: txn.date,
          createdAt: txn.createdAt,
          updatedAt: txn.createdAt,
          note: txn.note,
          status: 'COMPLETED',
          paymentMethod: 'CASH',
          isProduction: true,
          transaction_items: {
            create: txn.items.map(item => ({
              id: randomUUID(),
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.price,
              totalPrice: item.totalPrice,
              totalCogs: item.totalCogs,
            })),
          },
        },
      });

      if (txn.type === 'SALE') saleCount++;
      else if (txn.type === 'EXPENSE') expenseCount++;
      else if (txn.type === 'INCOME') incomeCount++;
      else if (txn.type === 'PURCHASE') purchaseCount++;
    }

    console.log('\n✅ Successfully seeded financial data!\n');
    console.log('📊 Summary:');
    console.log(`   - Total Transactions: ${transactions.length}`);
    console.log(`   - SALE: ${saleCount}`);
    console.log(`   - EXPENSE: ${expenseCount}`);
    console.log(`   - INCOME: ${incomeCount}`);
    console.log(`   - PURCHASE: ${purchaseCount}`);
    console.log('\n🎉 You can now view beautiful charts in the Financial page!');
    console.log('   Go to: http://localhost:3000/koperasi/financial\n');

  } catch (error) {
    console.error('❌ Error seeding financial data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedFinancialData();

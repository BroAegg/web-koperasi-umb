import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: { name: 'Sembako', description: 'Sembilan bahan pokok' }
    }),
    prisma.category.create({
      data: { name: 'Minuman', description: 'Aneka minuman' }
    }),
    prisma.category.create({
      data: { name: 'Makanan Ringan', description: 'Snack dan makanan ringan' }
    }),
  ]);

  console.log('✅ Categories created');

  // Create sample users and members
  const users = [];
  const members = [];

  for (let i = 1; i <= 5; i++) {
    const user = await prisma.user.create({
      data: {
        email: `member${i}@koperasi.com`,
        name: `Anggota ${i}`,
        password: 'password123', // In real app, this should be hashed
        role: 'USER',
      },
    });

    const member = await prisma.member.create({
      data: {
        userId: user.id,
        nomorAnggota: `UMB${String(i).padStart(3, '0')}`,
        name: `Anggota ${i}`,
        email: `member${i}@koperasi.com`,
        phone: `08123456789${i}`,
        address: `Jakarta ${i === 1 ? 'Pusat' : i === 2 ? 'Selatan' : i === 3 ? 'Utara' : i === 4 ? 'Barat' : 'Timur'}`,
        gender: i % 2 === 0 ? 'FEMALE' : 'MALE',
        unitKerja: i === 1 ? 'Keuangan' : i === 2 ? 'HRD' : i === 3 ? 'IT' : i === 4 ? 'Marketing' : 'Operasional',
        simpananPokok: new Decimal(50000),
        simpananWajib: new Decimal(200000 + i * 50000),
        simpananSukarela: new Decimal(150000 + i * 100000),
        status: 'ACTIVE',
      },
    });

    users.push(user);
    members.push(member);
  }

  console.log('✅ Members created');

  // Create sample products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Beras Premium 5kg',
        description: 'Beras premium kualitas terbaik',
        categoryId: categories[0].id,
        sku: 'BRS001',
        buyPrice: new Decimal(45000),
        sellPrice: new Decimal(50000),
        stock: 25,
        threshold: 10,
        unit: 'sak',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Minyak Goreng 2L',
        description: 'Minyak goreng kemasan 2 liter',
        categoryId: categories[0].id,
        sku: 'MNG001',
        buyPrice: new Decimal(25000),
        sellPrice: new Decimal(28000),
        stock: 8, // Low stock
        threshold: 15,
        unit: 'botol',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Gula Pasir 1kg',
        description: 'Gula pasir kemasan 1kg',
        categoryId: categories[0].id,
        sku: 'GUL001',
        buyPrice: new Decimal(12000),
        sellPrice: new Decimal(14000),
        stock: 5, // Critical stock
        threshold: 15,
        unit: 'kg',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Kopi Bubuk 200g',
        description: 'Kopi bubuk premium',
        categoryId: categories[1].id,
        sku: 'KOP001',
        buyPrice: new Decimal(15000),
        sellPrice: new Decimal(18000),
        stock: 30,
        threshold: 10,
        unit: 'pack',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Teh Kotak 1L',
        description: 'Minuman teh dalam kemasan',
        categoryId: categories[1].id,
        sku: 'TEH001',
        buyPrice: new Decimal(8000),
        sellPrice: new Decimal(10000),
        stock: 20,
        threshold: 5,
        unit: 'kotak',
      },
    }),
  ]);

  console.log('✅ Products created');

  // Create stock movements
  for (const product of products) {
    await prisma.stockMovement.create({
      data: {
        productId: product.id,
        type: 'IN',
        quantity: product.stock,
        note: 'Initial stock',
      },
    });
  }

  console.log('✅ Stock movements created');

  // Create sample transactions
  for (let i = 0; i < 3; i++) {
    const randomMember = members[Math.floor(Math.random() * members.length)];
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const quantity = Math.floor(Math.random() * 3) + 1;
    const unitPrice = Number(randomProduct.sellPrice);
    const totalPrice = quantity * unitPrice;

    const transaction = await prisma.transaction.create({
      data: {
        memberId: randomMember.id,
        type: 'SALE',
        totalAmount: new Decimal(totalPrice),
        paymentMethod: 'CASH',
        status: 'COMPLETED',
        note: `Penjualan ${randomProduct.name}`,
      },
    });

    await prisma.transactionItem.create({
      data: {
        transactionId: transaction.id,
        productId: randomProduct.id,
        quantity,
        unitPrice: new Decimal(unitPrice),
        totalPrice: new Decimal(totalPrice),
      },
    });

    // Update product stock
    await prisma.product.update({
      where: { id: randomProduct.id },
      data: {
        stock: {
          decrement: quantity,
        },
      },
    });

    // Create stock movement
    await prisma.stockMovement.create({
      data: {
        productId: randomProduct.id,
        type: 'OUT',
        quantity,
        note: `Penjualan transaksi ${transaction.id}`,
      },
    });
  }

  console.log('✅ Transactions created');

  // Create sample broadcasts
  const adminUser = users[0]; // Use first user as admin
  await prisma.user.update({
    where: { id: adminUser.id },
    data: { role: 'ADMIN' },
  });

  await Promise.all([
    prisma.broadcast.create({
      data: {
        title: 'Pengumuman Rapat Anggota Tahunan',
        message: 'Kepada seluruh anggota koperasi, diinformasikan bahwa Rapat Anggota Tahunan akan dilaksanakan pada tanggal 15 November 2024. Mohon kehadiran semua anggota.',
        type: 'ANNOUNCEMENT',
        targetAudience: 'ALL',
        status: 'SENT',
        sentAt: new Date(),
        totalRecipients: members.length,
        successfulDeliveries: members.length,
        failedDeliveries: 0,
        createdById: adminUser.id,
      },
    }),
    prisma.broadcast.create({
      data: {
        title: 'Reminder Pembayaran Simpanan Wajib',
        message: 'Pengingat untuk semua anggota bahwa pembayaran simpanan wajib bulan Oktober akan berakhir pada tanggal 25 Oktober 2024.',
        type: 'REMINDER',
        targetAudience: 'ACTIVE_MEMBERS',
        status: 'SENT',
        sentAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        totalRecipients: members.length,
        successfulDeliveries: members.length - 1,
        failedDeliveries: 1,
        createdById: adminUser.id,
      },
    }),
  ]);

  console.log('✅ Broadcasts created');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
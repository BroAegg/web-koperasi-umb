import { PrismaClient, Role } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean up existing test data
  console.log('🧹 Cleaning up existing test data...');
  await prisma.stock_movements.deleteMany({});
  await prisma.transaction_items.deleteMany({});
  await prisma.transactions.deleteMany({});
  await prisma.broadcasts.deleteMany({});
  await prisma.products.deleteMany({});
  await prisma.members.deleteMany({});
  await prisma.categories.deleteMany({});
  await prisma.users.deleteMany({ where: { email: { contains: '@koperasi.com' } } });
  console.log('✅ Cleanup completed');

  // Create core users: superadmin, admin, supplier
  const passwordPlain = 'Password123!';
  const hashed = await bcrypt.hash(passwordPlain, 10);

  const superAdmin = await prisma.users.upsert({
    where: { email: 'superadmin@koperasi.com' },
    update: { password: hashed, name: 'Super Admin', role: Role.SUPER_ADMIN },
    create: { 
      id: randomUUID(),
      email: 'superadmin@koperasi.com', 
      name: 'Super Admin', 
      password: hashed, 
      role: Role.SUPER_ADMIN,
      updatedAt: new Date(),
    },
  });

  const admin = await prisma.users.upsert({
    where: { email: 'admin@koperasi.com' },
    update: { password: hashed, name: 'Admin User', role: Role.ADMIN },
    create: { 
      id: randomUUID(),
      email: 'admin@koperasi.com', 
      name: 'Admin User', 
      password: hashed, 
      role: Role.ADMIN,
      updatedAt: new Date(),
    },
  });

  const supplier = await prisma.users.upsert({
    where: { email: 'supplier@koperasi.com' },
    update: { password: hashed, name: 'Supplier User', role: Role.SUPPLIER },
    create: { 
      id: randomUUID(),
      email: 'supplier@koperasi.com', 
      name: 'Supplier User', 
      password: hashed, 
      role: Role.SUPPLIER,
      updatedAt: new Date(),
    },
  });

  console.log('✅ Core users (superadmin/admin/supplier) ensured. Default password for all:', 'Password123!');

  // Create categories
  const categories = await Promise.all([
    prisma.categories.upsert({
      where: { name: 'Sembako' },
      update: {},
      create: { 
        id: randomUUID(),
        name: 'Sembako', 
        description: 'Sembilan bahan pokok',
        updatedAt: new Date(),
      }
    }),
    prisma.categories.upsert({
      where: { name: 'Minuman' },
      update: {},
      create: { 
        id: randomUUID(),
        name: 'Minuman', 
        description: 'Aneka minuman',
        updatedAt: new Date(),
      }
    }),
    prisma.categories.upsert({
      where: { name: 'Makanan Ringan' },
      update: {},
      create: { 
        id: randomUUID(),
        name: 'Makanan Ringan', 
        description: 'Snack dan makanan ringan',
        updatedAt: new Date(),
      }
    }),
  ]);

  console.log('✅ Categories created');

  // Create sample users and members
  const users = [];
  const members = [];

  // Hash password for member users
  const memberPassword = await bcrypt.hash('Password123!', 10);

  for (let i = 1; i <= 5; i++) {
    const user = await prisma.users.upsert({
      where: { email: `member${i}@koperasi.com` },
      update: {},
      create: {
        id: randomUUID(),
        email: `member${i}@koperasi.com`,
        name: `Anggota ${i}`,
        password: memberPassword, // Now properly hashed
        role: 'USER',
        updatedAt: new Date(),
      },
    });

    const member = await prisma.members.upsert({
      where: { email: `member${i}@koperasi.com` },
      update: {},
      create: {
        id: randomUUID(),
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
        updatedAt: new Date(),
      },
    });

    users.push(user);
    members.push(member);
  }

  console.log('✅ Members created');

  // Create sample products
  const products = await Promise.all([
    prisma.products.create({
      data: {
        id: randomUUID(),
        name: 'Beras Premium 5kg',
        description: 'Beras premium kualitas terbaik',
        categoryId: categories[0].id,
        sku: 'BRS001',
        buyPrice: new Decimal(45000),
        sellPrice: new Decimal(50000),
        stock: 25,
        threshold: 10,
        unit: 'sak',
        updatedAt: new Date(),
      },
    }),
    prisma.products.create({
      data: {
        id: randomUUID(),
        name: 'Minyak Goreng 2L',
        description: 'Minyak goreng kemasan 2 liter',
        categoryId: categories[0].id,
        sku: 'MNG001',
        buyPrice: new Decimal(25000),
        sellPrice: new Decimal(28000),
        stock: 8, // Low stock
        threshold: 15,
        unit: 'botol',
        updatedAt: new Date(),
      },
    }),
    prisma.products.create({
      data: {
        id: randomUUID(),
        name: 'Gula Pasir 1kg',
        description: 'Gula pasir kemasan 1kg',
        categoryId: categories[0].id,
        sku: 'GUL001',
        buyPrice: new Decimal(12000),
        sellPrice: new Decimal(14000),
        stock: 5, // Critical stock
        threshold: 15,
        unit: 'kg',
        updatedAt: new Date(),
      },
    }),
    prisma.products.create({
      data: {
        id: randomUUID(),
        name: 'Kopi Bubuk 200g',
        description: 'Kopi bubuk premium',
        categoryId: categories[1].id,
        sku: 'KOP001',
        buyPrice: new Decimal(15000),
        sellPrice: new Decimal(18000),
        stock: 30,
        threshold: 10,
        unit: 'pack',
        updatedAt: new Date(),
      },
    }),
    prisma.products.create({
      data: {
        id: randomUUID(),
        name: 'Teh Kotak 1L',
        description: 'Minuman teh dalam kemasan',
        categoryId: categories[1].id,
        sku: 'TEH001',
        buyPrice: new Decimal(8000),
        sellPrice: new Decimal(10000),
        stock: 20,
        threshold: 5,
        unit: 'kotak',
        updatedAt: new Date(),
      },
    }),
  ]);

  console.log('✅ Products created');

  // Create stock movements
  for (const product of products) {
    await prisma.stock_movements.create({
      data: {
        id: randomUUID(),
        productId: product.id,
        movementType: 'PURCHASE_IN',
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

    const transaction = await prisma.transactions.create({
      data: {
        id: randomUUID(),
        memberId: randomMember.id,
        type: 'SALE',
        totalAmount: new Decimal(totalPrice),
        paymentMethod: 'CASH',
        status: 'COMPLETED',
        note: `Penjualan ${randomProduct.name}`,
        updatedAt: new Date(),
      },
    });

    await prisma.transaction_items.create({
      data: {
        id: randomUUID(),
        transactionId: transaction.id,
        productId: randomProduct.id,
        quantity,
        unitPrice: new Decimal(unitPrice),
        totalPrice: new Decimal(totalPrice),
      },
    });

    // Update product stock
    await prisma.products.update({
      where: { id: randomProduct.id },
      data: {
        stock: {
          decrement: quantity,
        },
      },
    });

    // Create stock movement
    await prisma.stock_movements.create({
      data: {
        id: randomUUID(),
        productId: randomProduct.id,
        movementType: 'SALE_OUT',
        quantity,
        note: `Penjualan transaksi ${transaction.id}`,
      },
    });
  }

  console.log('✅ Transactions created');

  // Create additional stock movements (IN)
  for (let i = 0; i < 5; i++) {
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const quantity = Math.floor(Math.random() * 20) + 10; // 10-30 quantity

    await prisma.stock_movements.create({
      data: {
        id: randomUUID(),
        productId: randomProduct.id,
        movementType: 'PURCHASE_IN',
        quantity,
        note: `Restock ${randomProduct.name}`,
      },
    });

    // Update product stock
    await prisma.products.update({
      where: { id: randomProduct.id },
      data: {
        stock: {
          increment: quantity,
        },
      },
    });
  }

  console.log('✅ Additional stock movements created');

  // Create additional financial transactions
  const financialTransactions = [
    {
      type: 'SALE' as const,
      totalAmount: 150000,
      note: 'Pendapatan dari jasa simpan pinjam',
      paymentMethod: 'CASH' as const,
    },
    {
      type: 'PURCHASE' as const,
      totalAmount: 75000,
      note: 'Pembelian alat tulis kantor',
      paymentMethod: 'CASH' as const,
    },
    {
      type: 'PURCHASE' as const,
      totalAmount: 200000,
      note: 'Biaya listrik dan air',
      paymentMethod: 'TRANSFER' as const,
    },
    {
      type: 'SALE' as const,
      totalAmount: 300000,
      note: 'Pendapatan dari iuran anggota',
      paymentMethod: 'TRANSFER' as const,
    },
  ];

  for (const txData of financialTransactions) {
    await prisma.transactions.create({
      data: {
        id: randomUUID(),
        ...txData,
        status: 'COMPLETED',
        date: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  console.log('✅ Financial transactions created');

  // Create sample broadcasts
  const adminUser = users[0]; // Use first user as admin
  await prisma.users.update({
    where: { id: adminUser.id },
    data: { role: 'ADMIN' },
  });

  await Promise.all([
    prisma.broadcasts.create({
      data: {
        id: randomUUID(),
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
        updatedAt: new Date(),
      },
    }),
    prisma.broadcasts.create({
      data: {
        id: randomUUID(),
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
        updatedAt: new Date(),
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
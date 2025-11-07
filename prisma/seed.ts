import { PrismaClient, Role } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seeding with realistic data...');

  // Clean up ALL existing data for fresh start
  console.log('🧹 Cleaning up ALL existing data...');
  await prisma.stock_movements.deleteMany({});
  await prisma.consignment_sales.deleteMany({}); // Delete first (has FK to transaction_items)
  await prisma.transaction_items.deleteMany({});
  await prisma.transactions.deleteMany({});
  await prisma.consignment_payments.deleteMany({});
  await prisma.consignment_batches.deleteMany({});
  await prisma.consignors.deleteMany({});
  await prisma.loan_payments.deleteMany({});
  await prisma.loans.deleteMany({});
  await prisma.savings.deleteMany({});
  await prisma.broadcasts.deleteMany({});
  await prisma.products.deleteMany({});
  await prisma.members.deleteMany({});
  await prisma.categories.deleteMany({});
  await prisma.users.deleteMany({ where: { email: { contains: '@koperasi.com' } } });
  console.log('✅ Complete cleanup finished');

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

  const developer = await prisma.users.upsert({
    where: { email: 'developer@koperasi.com' },
    update: { password: hashed, name: 'Developer', role: Role.DEVELOPER },
    create: { 
      id: randomUUID(),
      email: 'developer@koperasi.com', 
      name: 'Developer', 
      password: hashed, 
      role: Role.DEVELOPER,
      updatedAt: new Date(),
    },
  });

  console.log('✅ Core users (superadmin/admin/supplier/developer) ensured. Default password for all:', 'Password123!');

  // Generate supplier code
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const supplierCode = `SUP-${dateStr}-001`;

  // Hash password for supplier
  const supplierPassword = await bcrypt.hash('Password123!', 10);

  // Create supplier in unified suppliers table
  const supplierEntry = await prisma.suppliers.upsert({
    where: { email: 'supplier@koperasi.com' },
    update: {
      businessName: 'CV Makmur Jaya',
      ownerName: 'Budi Santoso',
      phone: '081234567890',
      address: 'Jl. Raya No. 123, Jakarta',
      productCategory: 'Sembako',
      description: 'Supplier sembako berkualitas',
      status: 'APPROVED',
      paymentStatus: 'PAID_APPROVED',
      isPaymentActive: true,
      isActive: true,
      lastPaymentDate: new Date(),
      nextPaymentDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      approvedAt: new Date(),
      updatedAt: new Date(),
    },
    create: {
      id: randomUUID(),
      code: supplierCode,
      businessName: 'CV Makmur Jaya',
      ownerName: 'Budi Santoso',
      email: 'supplier@koperasi.com',
      password: supplierPassword,
      phone: '081234567890',
      address: 'Jl. Raya No. 123, Jakarta',
      productCategory: 'Sembako',
      description: 'Supplier sembako berkualitas',
      status: 'APPROVED',
      paymentStatus: 'PAID_APPROVED',
      isPaymentActive: true,
      isActive: true,
      monthlyFee: 25000,
      lastPaymentDate: new Date(),
      nextPaymentDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      approvedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log('✅ Supplier created for supplier@koperasi.com:', supplierEntry.businessName, 'Code:', supplierEntry.code);

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

  // ============================================================
  // REALISTIC TRANSACTIONS & STOCK MOVEMENTS
  // ============================================================
  console.log('💰 Creating realistic transactions and stock movements...');
  
  // Fixed date for consistent testing: November 7, 2025
  const now = new Date('2025-11-07T12:00:00');
  const thirtyDaysAgo = new Date('2025-10-08T12:00:00'); // 30 days before Nov 7
  
  for (const product of products) {
    const initialStock = product.stock;
    
    // Create purchase transaction for initial stock
    await prisma.transactions.create({
      data: {
        id: randomUUID(),
        type: 'PURCHASE',
        totalAmount: new Decimal(Number(product.buyPrice) * initialStock),
        paymentMethod: 'TRANSFER', // Pembelian via transfer bank
        status: 'COMPLETED',
        date: thirtyDaysAgo,
        note: `Pembelian awal ${product.name} - ${initialStock} ${product.unit}`,
        updatedAt: thirtyDaysAgo,
      },
    });

    // Stock movement for initial purchase
    await prisma.stock_movements.create({
      data: {
        id: randomUUID(),
        productId: product.id,
        movementType: 'PURCHASE_IN',
        quantity: initialStock,
        occurredAt: thirtyDaysAgo,
        note: `Stok awal ${product.name}`,
      },
    });
  }

  console.log('✅ Initial stock purchases created');

  // Create realistic POS sales over the last 30 days
  const salesData = [
    // Week 1 (25-28 days ago) - Multiple small sales
    { daysAgo: 28, productIndex: 0, qty: 2, method: 'CASH' },
    { daysAgo: 28, productIndex: 3, qty: 3, method: 'CASH' },
    { daysAgo: 27, productIndex: 1, qty: 1, method: 'CASH' },
    { daysAgo: 27, productIndex: 4, qty: 2, method: 'TRANSFER' },
    { daysAgo: 26, productIndex: 2, qty: 2, method: 'CASH' },
    { daysAgo: 25, productIndex: 0, qty: 1, method: 'CASH' },
    
    // Week 2 (18-21 days ago)
    { daysAgo: 21, productIndex: 3, qty: 5, method: 'CASH' },
    { daysAgo: 21, productIndex: 1, qty: 2, method: 'TRANSFER' },
    { daysAgo: 20, productIndex: 4, qty: 3, method: 'CASH' },
    { daysAgo: 19, productIndex: 0, qty: 3, method: 'CASH' },
    { daysAgo: 18, productIndex: 2, qty: 1, method: 'TRANSFER' },
    
    // Week 3 (11-14 days ago)
    { daysAgo: 14, productIndex: 1, qty: 3, method: 'CASH' },
    { daysAgo: 14, productIndex: 3, qty: 4, method: 'CASH' },
    { daysAgo: 13, productIndex: 4, qty: 5, method: 'TRANSFER' },
    { daysAgo: 12, productIndex: 0, qty: 2, method: 'CASH' },
    { daysAgo: 11, productIndex: 2, qty: 3, method: 'CASH' },
    
    // Week 4 (4-7 days ago) - Higher volume
    { daysAgo: 7, productIndex: 0, qty: 4, method: 'CASH' },
    { daysAgo: 7, productIndex: 1, qty: 2, method: 'CASH' },
    { daysAgo: 6, productIndex: 3, qty: 6, method: 'TRANSFER' },
    { daysAgo: 6, productIndex: 4, qty: 4, method: 'CASH' },
    { daysAgo: 5, productIndex: 2, qty: 2, method: 'CASH' },
    { daysAgo: 5, productIndex: 0, qty: 3, method: 'TRANSFER' },
    { daysAgo: 4, productIndex: 1, qty: 1, method: 'CASH' },
    
    // Recent (1-3 days ago)
    { daysAgo: 3, productIndex: 3, qty: 3, method: 'CASH' },
    { daysAgo: 2, productIndex: 4, qty: 2, method: 'CASH' },
    { daysAgo: 2, productIndex: 0, qty: 1, method: 'TRANSFER' },
    { daysAgo: 1, productIndex: 1, qty: 2, method: 'CASH' },
    { daysAgo: 1, productIndex: 2, qty: 1, method: 'CASH' },
  ];

  for (const sale of salesData) {
    const saleDate = new Date(now.getTime() - sale.daysAgo * 24 * 60 * 60 * 1000);
    const product = products[sale.productIndex];
    const randomMember = members[Math.floor(Math.random() * members.length)];
    const unitPrice = Number(product.sellPrice);
    const totalPrice = sale.qty * unitPrice;

    const transaction = await prisma.transactions.create({
      data: {
        id: randomUUID(),
        memberId: randomMember.id,
        type: 'SALE',
        totalAmount: new Decimal(totalPrice),
        paymentMethod: sale.method as 'CASH' | 'TRANSFER' | 'CREDIT',
        status: 'COMPLETED',
        date: saleDate,
        note: `Penjualan POS ${product.name}`,
        updatedAt: saleDate,
      },
    });

    await prisma.transaction_items.create({
      data: {
        id: randomUUID(),
        transactionId: transaction.id,
        productId: product.id,
        quantity: sale.qty,
        unitPrice: new Decimal(unitPrice),
        totalPrice: new Decimal(totalPrice),
      },
    });

    // Update product stock
    await prisma.products.update({
      where: { id: product.id },
      data: {
        stock: {
          decrement: sale.qty,
        },
      },
    });

    // Create stock movement for sale
    await prisma.stock_movements.create({
      data: {
        id: randomUUID(),
        productId: product.id,
        movementType: 'SALE_OUT',
        quantity: sale.qty,
        occurredAt: saleDate,
        note: `Penjualan POS ke ${randomMember.name}`,
      },
    });
  }

  console.log('✅ Realistic POS sales transactions created');

  // Additional purchases/restocks
  const restockData = [
    { daysAgo: 20, productIndex: 1, qty: 15, amount: 375000 }, // Minyak Goreng restock
    { daysAgo: 15, productIndex: 2, qty: 20, amount: 240000 }, // Gula Pasir restock
    { daysAgo: 10, productIndex: 4, qty: 25, amount: 200000 }, // Teh Kotak restock
  ];

  for (const restock of restockData) {
    const restockDate = new Date(now.getTime() - restock.daysAgo * 24 * 60 * 60 * 1000);
    const product = products[restock.productIndex];

    await prisma.transactions.create({
      data: {
        id: randomUUID(),
        type: 'PURCHASE',
        totalAmount: new Decimal(restock.amount),
        paymentMethod: 'TRANSFER',
        status: 'COMPLETED',
        date: restockDate,
        note: `Restock ${product.name} - ${restock.qty} ${product.unit}`,
        updatedAt: restockDate,
      },
    });

    await prisma.stock_movements.create({
      data: {
        id: randomUUID(),
        productId: product.id,
        movementType: 'PURCHASE_IN',
        quantity: restock.qty,
        occurredAt: restockDate,
        note: `Restock pembelian`,
      },
    });

    await prisma.products.update({
      where: { id: product.id },
      data: {
        stock: {
          increment: restock.qty,
        },
      },
    });
  }

  console.log('✅ Restock purchases created');

  // ============================================================
  // OPERATIONAL EXPENSES & INCOME (Non-inventory transactions)
  // ============================================================
  console.log('💸 Creating operational expenses and income...');

  const operationalTransactions = [
    // INITIAL CAPITAL INJECTION (Modal Awal Koperasi)
    { daysAgo: 30, type: 'SALE' as const, amount: 5000000, method: 'TRANSFER' as const, note: 'Modal awal koperasi dari anggota' },
    
    // EXPENSES
    { daysAgo: 25, type: 'PURCHASE' as const, amount: 500000, method: 'TRANSFER' as const, note: 'Biaya listrik bulan lalu' },
    { daysAgo: 25, type: 'PURCHASE' as const, amount: 200000, method: 'TRANSFER' as const, note: 'Biaya air PDAM' },
    { daysAgo: 22, type: 'PURCHASE' as const, amount: 150000, method: 'CASH' as const, note: 'Pembelian alat tulis kantor' },
    { daysAgo: 20, type: 'PURCHASE' as const, amount: 300000, method: 'CASH' as const, note: 'Biaya kebersihan dan pemeliharaan' },
    { daysAgo: 18, type: 'PURCHASE' as const, amount: 250000, method: 'TRANSFER' as const, note: 'Biaya internet bulan lalu' },
    { daysAgo: 15, type: 'PURCHASE' as const, amount: 400000, method: 'CASH' as const, note: 'Gaji karyawan harian' },
    { daysAgo: 10, type: 'PURCHASE' as const, amount: 100000, method: 'CASH' as const, note: 'Biaya transportasi operasional' },
    { daysAgo: 5, type: 'PURCHASE' as const, amount: 75000, method: 'CASH' as const, note: 'Pembelian peralatan kebersihan' },
    { daysAgo: 3, type: 'PURCHASE' as const, amount: 200000, method: 'TRANSFER' as const, note: 'Biaya maintenance sistem POS' },
    
    // INCOME (Non-sales: membership fees, service fees, etc.)
    { daysAgo: 27, type: 'SALE' as const, amount: 1000000, method: 'TRANSFER' as const, note: 'Iuran anggota bulan ini (5 anggota @ 200rb)' },
    { daysAgo: 24, type: 'SALE' as const, amount: 300000, method: 'CASH' as const, note: 'Pendapatan jasa simpan pinjam' },
    { daysAgo: 20, type: 'SALE' as const, amount: 500000, method: 'TRANSFER' as const, note: 'Fee administrasi dan pendaftaran anggota baru' },
    { daysAgo: 16, type: 'SALE' as const, amount: 250000, method: 'CASH' as const, note: 'Pendapatan bunga simpanan' },
    { daysAgo: 12, type: 'SALE' as const, amount: 800000, method: 'TRANSFER' as const, note: 'Iuran sukarela anggota dan simpanan' },
    { daysAgo: 8, type: 'SALE' as const, amount: 200000, method: 'CASH' as const, note: 'Pendapatan jasa konsultasi koperasi' },
    { daysAgo: 4, type: 'SALE' as const, amount: 1500000, method: 'TRANSFER' as const, note: 'Dana hibah/subsidi dari pemerintah daerah' },
  ];

  for (const tx of operationalTransactions) {
    const txDate = new Date(now.getTime() - tx.daysAgo * 24 * 60 * 60 * 1000);
    
    await prisma.transactions.create({
      data: {
        id: randomUUID(),
        type: tx.type,
        totalAmount: new Decimal(tx.amount),
        paymentMethod: tx.method,
        status: 'COMPLETED',
        date: txDate,
        note: tx.note,
        updatedAt: txDate,
      },
    });
  }

  console.log('✅ Operational transactions created');

  // ============================================================
  // CONSIGNMENT DATA (Barang Titipan)
  // ============================================================
  console.log('📦 Creating consignment data...');

  // Create consignor (Penitip barang)
  const consignor = await prisma.consignors.create({
    data: {
      id: randomUUID(),
      code: 'CONS-001',
      name: 'Ibu Siti - Titipan Kue',
      phone: '081234567890',
      email: 'ibu.siti@example.com',
      address: 'Jakarta Selatan',
      feeType: 'PERCENTAGE',
      defaultFeePercent: new Decimal(20), // Koperasi ambil komisi 20%
      isActive: true,
      updatedAt: new Date(),
    },
  });

  // Create consignment products (Produk Titipan)
  const consignmentProduct = await prisma.products.create({
    data: {
      id: randomUUID(),
      name: 'Kue Kering Coklat (Titipan)',
      description: 'Kue kering coklat chip homemade dari Ibu Siti',
      categoryId: categories[2].id, // Makanan Ringan
      sku: 'CONS-KUE-001',
      buyPrice: new Decimal(0), // Tidak ada buyPrice karena konsinyasi
      sellPrice: new Decimal(15000),
      stock: 15, // Sisa 15 unit (dari 50 awal, 35 terjual)
      threshold: 5,
      unit: 'pack',
      isConsignment: true, // PENTING: Tandai sebagai konsinyasi
      ownershipType: 'TITIPAN',
      status: 'ACTIVE',
      supplierContact: consignor.phone,
      updatedAt: new Date(),
    },
  });

  console.log(`✅ Consignment product created: ${consignmentProduct.name}`);

  // Create consignment batch (Penerimaan barang titipan)
  const batch1 = await prisma.consignment_batches.create({
    data: {
      id: randomUUID(),
      code: 'BATCH-001',
      consignorId: consignor.id,
      productId: consignmentProduct.id,
      qtyIn: 50, // Terima 50 unit
      qtySold: 35, // Sudah terjual 35 unit
      qtyReturned: 0,
      qtyExpired: 0,
      qtyRemaining: 15, // Sisa 15 unit
      feeType: 'PERCENTAGE',
      feePercent: new Decimal(20),
      receivedAt: new Date('2025-10-18T10:00:00'),
      status: 'ACTIVE',
      note: 'Kue kering titipan untuk dijual',
      updatedAt: new Date(),
    },
  });

  // Record stock movement for consignment receipt
  await prisma.stock_movements.create({
    data: {
      id: randomUUID(),
      productId: consignmentProduct.id,
      movementType: 'PURCHASE_IN',
      quantity: 50,
      occurredAt: new Date('2025-10-18T10:00:00'),
      note: `Penerimaan barang konsinyasi - Batch ${batch1.code}`,
      referenceId: batch1.id,
      referenceType: 'CONSIGNMENT_BATCH',
    },
  });

  // Create some consignment sales (Penjualan barang titipan)
  const consignmentSalesData = [
    { daysAgo: 18, qty: 10, unitPrice: 15000 }, // Total: 150,000
    { daysAgo: 15, qty: 12, unitPrice: 15000 }, // Total: 180,000
    { daysAgo: 10, qty: 8, unitPrice: 15000 },  // Total: 120,000
    { daysAgo: 5, qty: 5, unitPrice: 15000 },   // Total: 75,000
  ];

  let totalConsignmentRevenue = 0;
  let totalConsignmentFee = 0;
  let totalNetToConsignor = 0;

  for (const sale of consignmentSalesData) {
    const saleDate = new Date(now.getTime() - sale.daysAgo * 24 * 60 * 60 * 1000);
    const totalRevenue = sale.qty * sale.unitPrice;
    const feeAmount = totalRevenue * 0.20; // 20% komisi koperasi
    const netToConsignor = totalRevenue - feeAmount; // 80% untuk consignor

    totalConsignmentRevenue += totalRevenue;
    totalConsignmentFee += feeAmount;
    totalNetToConsignor += netToConsignor;

    // Create a POS transaction for the consignment sale
    const consignmentTransaction = await prisma.transactions.create({
      data: {
        id: randomUUID(),
        type: 'SALE',
        totalAmount: new Decimal(totalRevenue),
        paymentMethod: 'CASH',
        status: 'COMPLETED',
        date: saleDate,
        note: `Penjualan barang konsinyasi - ${consignor.name}`,
        updatedAt: saleDate,
      },
    });

    // Create transaction item
    const transactionItem = await prisma.transaction_items.create({
      data: {
        id: randomUUID(),
        transactionId: consignmentTransaction.id,
        productId: consignmentProduct.id, // Use consignment product
        quantity: sale.qty,
        unitPrice: new Decimal(sale.unitPrice),
        totalPrice: new Decimal(totalRevenue),
      },
    });

    // Record consignment sale (link to transaction)
    await prisma.consignment_sales.create({
      data: {
        id: randomUUID(),
        batchId: batch1.id,
        transactionItemId: transactionItem.id,
        qtySold: sale.qty,
        unitPrice: new Decimal(sale.unitPrice),
        totalRevenue: new Decimal(totalRevenue),
        feeType: 'PERCENTAGE',
        feeAmount: new Decimal(feeAmount),
        netToConsignor: new Decimal(netToConsignor),
        isSettled: false, // BELUM DIBAYAR ke consignor
        saleDate: saleDate,
      },
    });

    // Update product stock (reduce by sold quantity)
    await prisma.products.update({
      where: { id: consignmentProduct.id },
      data: {
        stock: {
          decrement: sale.qty,
        },
      },
    });

    // Record stock movement for consignment sale
    await prisma.stock_movements.create({
      data: {
        id: randomUUID(),
        productId: consignmentProduct.id,
        movementType: 'SALE_OUT',
        quantity: sale.qty,
        occurredAt: saleDate,
        note: `Penjualan konsinyasi ke customer`,
        referenceId: consignmentTransaction.id,
        referenceType: 'SALE',
      },
    });
  }

  console.log(`✅ Consignment data created:`);
  console.log(`   - Consignor: ${consignor.name}`);
  console.log(`   - Batch: 50 units received, 35 sold, 15 remaining`);
  console.log(`   - Total Sales Revenue: Rp ${totalConsignmentRevenue.toLocaleString('id-ID')}`);
  console.log(`   - Koperasi Fee (20%): Rp ${totalConsignmentFee.toLocaleString('id-ID')}`);
  console.log(`   - Net to Consignor: Rp ${totalNetToConsignor.toLocaleString('id-ID')}`);
  console.log(`   - Status: UNPAID (will show as liability in balance sheet)`);

  console.log('✅ Realistic data seeding completed');

  // ============================================================
  // BROADCASTS
  // ============================================================
  console.log('📢 Creating sample broadcasts...');
  
  const adminUser = users[0];
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

  // ============================================================
  // FINAL SUMMARY
  // ============================================================
  console.log('\n📊 ========== DATA SUMMARY ==========');
  
  const totalProducts = await prisma.products.count();
  const totalTransactions = await prisma.transactions.count();
  const totalStockMovements = await prisma.stock_movements.count();
  const totalMembers = await prisma.members.count();
  
  // Calculate expected balance sheet values
  const allProducts = await prisma.products.findMany();
  const inventoryValue = allProducts.reduce((sum, p) => 
    sum + (Number(p.buyPrice) * p.stock), 0
  );
  
  const cashIncome = await prisma.transactions.aggregate({
    where: { type: 'SALE', paymentMethod: 'CASH', status: 'COMPLETED' },
    _sum: { totalAmount: true },
  });
  
  const cashExpense = await prisma.transactions.aggregate({
    where: { type: 'PURCHASE', paymentMethod: 'CASH', status: 'COMPLETED' },
    _sum: { totalAmount: true },
  });
  
  const bankIncome = await prisma.transactions.aggregate({
    where: { type: 'SALE', paymentMethod: 'TRANSFER', status: 'COMPLETED' },
    _sum: { totalAmount: true },
  });
  
  const bankExpense = await prisma.transactions.aggregate({
    where: { type: 'PURCHASE', paymentMethod: 'TRANSFER', status: 'COMPLETED' },
    _sum: { totalAmount: true },
  });

  const expectedCash = Number(cashIncome._sum.totalAmount || 0) - Number(cashExpense._sum.totalAmount || 0);
  const expectedBank = Number(bankIncome._sum.totalAmount || 0) - Number(bankExpense._sum.totalAmount || 0);
  const expectedInventory = inventoryValue;
  
  // Calculate consignment liability (unpaid consignments)
  const unpaidConsignments = await prisma.consignment_sales.findMany({
    where: { isSettled: false }
  });
  const expectedLiability = unpaidConsignments.reduce((sum, sale) => 
    sum + Number(sale.netToConsignor), 0
  );

  console.log(`✅ Total Products: ${totalProducts}`);
  console.log(`✅ Total Members: ${totalMembers}`);
  console.log(`✅ Total Transactions: ${totalTransactions}`);
  console.log(`✅ Total Stock Movements: ${totalStockMovements}`);
  console.log(`\n💰 EXPECTED BALANCE SHEET VALUES:`);
  console.log(`   Kas (Cash): Rp ${expectedCash.toLocaleString('id-ID')}`);
  console.log(`   Bank: Rp ${expectedBank.toLocaleString('id-ID')}`);
  console.log(`   Persediaan (Inventory): Rp ${expectedInventory.toLocaleString('id-ID')}`);
  console.log(`   Hutang Konsinyasi (Liability): Rp ${expectedLiability.toLocaleString('id-ID')}`);
  console.log(`   Total Aktiva Lancar: Rp ${(expectedCash + expectedBank + expectedInventory).toLocaleString('id-ID')}`);
  console.log(`   Total Liabilitas: Rp ${expectedLiability.toLocaleString('id-ID')}`);
  console.log('=====================================\n');

  console.log('🎉 Comprehensive database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
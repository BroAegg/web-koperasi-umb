import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting ENHANCED database seeding with new schema...');
  console.log('📦 This seed includes: Suppliers, Consignors, FIFO batches, and more!');

  // ========================================
  // 1. CREATE CATEGORIES
  // ========================================
  console.log('\n📁 Creating categories...');
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
    prisma.category.create({
      data: { name: 'Gorengan', description: 'Makanan gorengan segar' }
    }),
  ]);
  console.log('✅ 4 Categories created');

  // ========================================
  // 2. CREATE USERS & MEMBERS
  // ========================================
  console.log('\n👥 Creating users and members...');
  const users = [];
  const members = [];

  // Admin user
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@koperasi.umb.ac.id',
      name: 'Admin Koperasi',
      password: 'admin123',
      role: 'ADMIN',
    },
  });
  users.push(adminUser);

  // Regular members
  for (let i = 1; i <= 10; i++) {
    const user = await prisma.user.create({
      data: {
        email: `member${i}@umb.ac.id`,
        name: `Anggota ${i}`,
        password: 'password123',
        role: 'USER',
      },
    });

    const member = await prisma.member.create({
      data: {
        userId: user.id,
        nomorAnggota: `UMB${String(i).padStart(4, '0')}`,
        name: `Anggota ${i}`,
        email: `member${i}@umb.ac.id`,
        phone: `081234567${String(i).padStart(3, '0')}`,
        address: `Jakarta ${['Pusat', 'Selatan', 'Utara', 'Barat', 'Timur'][i % 5]}`,
        gender: i % 2 === 0 ? 'FEMALE' : 'MALE',
        unitKerja: ['Keuangan', 'HRD', 'IT', 'Marketing', 'Operasional', 'Akademik'][i % 6],
        simpananPokok: new Decimal(100000),
        simpananWajib: new Decimal(200000 + i * 25000),
        simpananSukarela: new Decimal(500000 + i * 100000),
        status: 'ACTIVE',
      },
    });

    users.push(user);
    members.push(member);
  }
  console.log(`✅ 1 Admin + 10 Members created`);

  // ========================================
  // 3. CREATE SUPPLIERS (for Store-Owned Products)
  // ========================================
  console.log('\n🏪 Creating suppliers...');
  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: {
        code: 'SUP-001',
        name: 'PT Beras Sejahtera',
        contact: 'Bapak Budi',
        phone: '021-12345678',
        email: 'budi@berassejahtera.com',
        address: 'Jakarta Timur',
        paymentTerms: 'Net 30',
        note: 'Supplier beras premium',
      },
    }),
    prisma.supplier.create({
      data: {
        code: 'SUP-002',
        name: 'CV Minyak Murni',
        contact: 'Ibu Siti',
        phone: '021-87654321',
        email: 'siti@minyakmurni.com',
        address: 'Tangerang',
        paymentTerms: 'COD',
        note: 'Supplier minyak goreng',
      },
    }),
    prisma.supplier.create({
      data: {
        code: 'SUP-003',
        name: 'Toko Gula Manis',
        contact: 'Pak Ahmad',
        phone: '021-11223344',
        email: 'ahmad@gulamanis.com',
        address: 'Bekasi',
        paymentTerms: 'Net 14',
        note: 'Supplier gula pasir',
      },
    }),
  ]);
  console.log(`✅ ${suppliers.length} Suppliers created`);

  // ========================================
  // 4. CREATE CONSIGNORS (for Consignment Products)
  // ========================================
  console.log('\n🤝 Creating consignors...');
  const consignors = await Promise.all([
    prisma.consignor.create({
      data: {
        code: 'CON-001',
        name: 'Ibu Lastri (Gorengan)',
        contact: 'Ibu Lastri',
        phone: '0812-3456-7890',
        email: 'lastri.gorengan@gmail.com',
        address: 'Jakarta Selatan',
        feeType: 'PERCENTAGE',
        defaultFeePercent: new Decimal(20.00), // Koperasi dapat 20%
        paymentSchedule: 'Daily',
        note: 'Titipan gorengan segar harian',
      },
    }),
    prisma.consignor.create({
      data: {
        code: 'CON-002',
        name: 'Pak Rizal (Keripik)',
        contact: 'Pak Rizal',
        phone: '0813-4567-8901',
        email: 'rizal.keripik@gmail.com',
        address: 'Bogor',
        feeType: 'FLAT',
        defaultFeeFlat: new Decimal(2000), // Fee flat Rp 2000 per item
        paymentSchedule: 'Weekly',
        note: 'Titipan keripik mingguan',
      },
    }),
    prisma.consignor.create({
      data: {
        code: 'CON-003',
        name: 'CV Minuman Segar',
        contact: 'Ibu Nina',
        phone: '0814-5678-9012',
        email: 'nina@minumansegar.com',
        address: 'Depok',
        feeType: 'PERCENTAGE',
        defaultFeePercent: new Decimal(15.00), // Koperasi dapat 15%
        paymentSchedule: 'Weekly',
        note: 'Titipan minuman kemasan',
      },
    }),
  ]);
  console.log(`✅ ${consignors.length} Consignors created`);

  // ========================================
  // 5. CREATE PRODUCTS (Store-Owned)
  // ========================================
  console.log('\n📦 Creating store-owned products...');
  const storeProducts = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Beras Premium 5kg',
        description: 'Beras premium kualitas terbaik',
        categoryId: categories[0].id,
        sku: 'BRS-001',
        buyPrice: new Decimal(45000),
        sellPrice: new Decimal(50000),
        avgCost: new Decimal(45000),
        stock: 50,
        threshold: 15,
        unit: 'sak',
        ownershipType: 'TOKO',
        stockCycle: 'DUA_MINGGUAN',
        isConsignment: false,
        status: 'ACTIVE',
        lastRestockAt: new Date(),
      },
    }),
    prisma.product.create({
      data: {
        name: 'Minyak Goreng 2L',
        description: 'Minyak goreng kemasan 2 liter',
        categoryId: categories[0].id,
        sku: 'MNG-001',
        buyPrice: new Decimal(25000),
        sellPrice: new Decimal(28000),
        avgCost: new Decimal(25000),
        stock: 30,
        threshold: 20,
        unit: 'botol',
        ownershipType: 'TOKO',
        stockCycle: 'MINGGUAN',
        isConsignment: false,
        status: 'ACTIVE',
        lastRestockAt: new Date(),
      },
    }),
    prisma.product.create({
      data: {
        name: 'Gula Pasir 1kg',
        description: 'Gula pasir kemasan 1kg',
        categoryId: categories[0].id,
        sku: 'GUL-001',
        buyPrice: new Decimal(12000),
        sellPrice: new Decimal(14000),
        avgCost: new Decimal(12000),
        stock: 40,
        threshold: 25,
        unit: 'kg',
        ownershipType: 'TOKO',
        stockCycle: 'MINGGUAN',
        isConsignment: false,
        status: 'ACTIVE',
        lastRestockAt: new Date(),
      },
    }),
    prisma.product.create({
      data: {
        name: 'Kopi Bubuk 200g',
        description: 'Kopi bubuk premium',
        categoryId: categories[1].id,
        sku: 'KOP-001',
        buyPrice: new Decimal(15000),
        sellPrice: new Decimal(18000),
        avgCost: new Decimal(15000),
        stock: 60,
        threshold: 20,
        unit: 'pack',
        ownershipType: 'TOKO',
        stockCycle: 'DUA_MINGGUAN',
        isConsignment: false,
        status: 'ACTIVE',
        lastRestockAt: new Date(),
      },
    }),
  ]);
  console.log(`✅ ${storeProducts.length} Store-owned products created`);

  // ========================================
  // 6. CREATE PRODUCTS (Consignment)
  // ========================================
  console.log('\n🎁 Creating consignment products...');
  const consignmentProducts = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Risol Mayo',
        description: 'Risol isi mayones segar',
        categoryId: categories[3].id,
        sku: 'RSL-001',
        buyPrice: null, // Consignment, no buy price
        sellPrice: new Decimal(5000),
        stock: 20,
        threshold: 10,
        unit: 'pcs',
        ownershipType: 'TITIPAN',
        stockCycle: 'HARIAN',
        isConsignment: true,
        status: 'ACTIVE',
        lastRestockAt: new Date(),
        expiryPolicy: 'Dijual hari ini saja',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Pisang Goreng',
        description: 'Pisang goreng crispy',
        categoryId: categories[3].id,
        sku: 'PSG-001',
        buyPrice: null,
        sellPrice: new Decimal(3000),
        stock: 30,
        threshold: 15,
        unit: 'pcs',
        ownershipType: 'TITIPAN',
        stockCycle: 'HARIAN',
        isConsignment: true,
        status: 'ACTIVE',
        lastRestockAt: new Date(),
        expiryPolicy: 'Dijual hari ini saja',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Keripik Singkong Original',
        description: 'Keripik singkong renyah',
        categoryId: categories[2].id,
        sku: 'KRP-001',
        buyPrice: null,
        sellPrice: new Decimal(15000),
        stock: 25,
        threshold: 10,
        unit: 'pack',
        ownershipType: 'TITIPAN',
        stockCycle: 'MINGGUAN',
        isConsignment: true,
        status: 'ACTIVE',
        lastRestockAt: new Date(),
      },
    }),
    prisma.product.create({
      data: {
        name: 'Keripik Singkong Pedas',
        description: 'Keripik singkong level pedas',
        categoryId: categories[2].id,
        sku: 'KRP-002',
        buyPrice: null,
        sellPrice: new Decimal(15000),
        stock: 20,
        threshold: 10,
        unit: 'pack',
        ownershipType: 'TITIPAN',
        stockCycle: 'MINGGUAN',
        isConsignment: true,
        status: 'ACTIVE',
        lastRestockAt: new Date(),
      },
    }),
    prisma.product.create({
      data: {
        name: 'Teh Kotak 1L (Titipan)',
        description: 'Minuman teh titipan',
        categoryId: categories[1].id,
        sku: 'TEH-002',
        buyPrice: null,
        sellPrice: new Decimal(10000),
        stock: 40,
        threshold: 15,
        unit: 'kotak',
        ownershipType: 'TITIPAN',
        stockCycle: 'MINGGUAN',
        isConsignment: true,
        status: 'ACTIVE',
        lastRestockAt: new Date(),
      },
    }),
  ]);
  console.log(`✅ ${consignmentProducts.length} Consignment products created`);

  // ========================================
  // 7. CREATE PURCHASES (Store-Owned Stock In)
  // ========================================
  console.log('\n📥 Creating purchase orders...');
  const purchases = [];
  
  // Purchase 1: Beras dari Supplier 1
  const purchase1 = await prisma.purchase.create({
    data: {
      code: 'PO-2025-001',
      supplierId: suppliers[0].id,
      totalAmount: new Decimal(2250000), // 50 x 45000
      purchaseDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      receivedDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      status: 'RECEIVED',
      paymentStatus: 'PAID',
      paymentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      note: 'Order rutin bulanan beras',
    },
  });

  await prisma.purchaseItem.create({
    data: {
      purchaseId: purchase1.id,
      productId: storeProducts[0].id, // Beras
      quantity: 50,
      unitCost: new Decimal(45000),
      totalCost: new Decimal(2250000),
    },
  });

  // Create stock movement for purchase
  await prisma.stockMovement.create({
    data: {
      productId: storeProducts[0].id,
      movementType: 'PURCHASE_IN',
      quantity: 50,
      unitCost: new Decimal(45000),
      referenceType: 'PURCHASE',
      referenceId: purchase1.id,
      note: `Purchase ${purchase1.code}`,
      occurredAt: purchase1.receivedDate!,
    },
  });

  purchases.push(purchase1);

  // Purchase 2: Minyak & Gula
  const purchase2 = await prisma.purchase.create({
    data: {
      code: 'PO-2025-002',
      supplierId: suppliers[1].id,
      totalAmount: new Decimal(750000),
      purchaseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      receivedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      status: 'RECEIVED',
      paymentStatus: 'PAID',
      paymentDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // COD
      note: 'Order minyak goreng',
    },
  });

  await prisma.purchaseItem.create({
    data: {
      purchaseId: purchase2.id,
      productId: storeProducts[1].id, // Minyak
      quantity: 30,
      unitCost: new Decimal(25000),
      totalCost: new Decimal(750000),
    },
  });

  await prisma.stockMovement.create({
    data: {
      productId: storeProducts[1].id,
      movementType: 'PURCHASE_IN',
      quantity: 30,
      unitCost: new Decimal(25000),
      referenceType: 'PURCHASE',
      referenceId: purchase2.id,
      note: `Purchase ${purchase2.code}`,
      occurredAt: purchase2.receivedDate!,
    },
  });

  purchases.push(purchase2);

  console.log(`✅ ${purchases.length} Purchases created with stock movements`);

  // ========================================
  // 8. CREATE CONSIGNMENT BATCHES (FIFO Tracking)
  // ========================================
  console.log('\n📦 Creating consignment batches (FIFO)...');
  
  // Batch 1: Risol dari Ibu Lastri (hari ini pagi)
  const batch1 = await prisma.consignmentBatch.create({
    data: {
      code: 'CB-2025-001',
      consignorId: consignors[0].id, // Ibu Lastri
      productId: consignmentProducts[0].id, // Risol
      qtyIn: 30,
      qtySold: 10, // Sudah terjual 10
      qtyRemaining: 20,
      feeType: 'PERCENTAGE',
      feePercent: new Decimal(20.00),
      receivedAt: new Date(new Date().setHours(7, 0, 0, 0)), // Hari ini jam 7 pagi
      expiryAt: new Date(new Date().setHours(17, 0, 0, 0)), // Expire jam 5 sore
      status: 'ACTIVE',
      note: 'Batch pagi hari',
    },
  });

  await prisma.stockMovement.create({
    data: {
      productId: consignmentProducts[0].id,
      movementType: 'CONSIGNMENT_IN',
      quantity: 30,
      referenceType: 'CONSIGNMENT_BATCH',
      referenceId: batch1.id,
      note: `Consignment batch ${batch1.code} - Risol pagi`,
      occurredAt: batch1.receivedAt,
    },
  });

  // Batch 2: Pisang Goreng dari Ibu Lastri
  const batch2 = await prisma.consignmentBatch.create({
    data: {
      code: 'CB-2025-002',
      consignorId: consignors[0].id,
      productId: consignmentProducts[1].id, // Pisang Goreng
      qtyIn: 40,
      qtySold: 10,
      qtyRemaining: 30,
      feeType: 'PERCENTAGE',
      feePercent: new Decimal(20.00),
      receivedAt: new Date(new Date().setHours(7, 0, 0, 0)),
      expiryAt: new Date(new Date().setHours(17, 0, 0, 0)),
      status: 'ACTIVE',
      note: 'Batch pagi hari',
    },
  });

  await prisma.stockMovement.create({
    data: {
      productId: consignmentProducts[1].id,
      movementType: 'CONSIGNMENT_IN',
      quantity: 40,
      referenceType: 'CONSIGNMENT_BATCH',
      referenceId: batch2.id,
      note: `Consignment batch ${batch2.code} - Pisang goreng pagi`,
      occurredAt: batch2.receivedAt,
    },
  });

  // Batch 3: Keripik Original dari Pak Rizal (minggu lalu)
  const batch3 = await prisma.consignmentBatch.create({
    data: {
      code: 'CB-2025-003',
      consignorId: consignors[1].id, // Pak Rizal
      productId: consignmentProducts[2].id, // Keripik Original
      qtyIn: 30,
      qtySold: 5,
      qtyRemaining: 25,
      feeType: 'FLAT',
      feeFlat: new Decimal(2000),
      receivedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      status: 'ACTIVE',
      note: 'Batch mingguan',
    },
  });

  await prisma.stockMovement.create({
    data: {
      productId: consignmentProducts[2].id,
      movementType: 'CONSIGNMENT_IN',
      quantity: 30,
      referenceType: 'CONSIGNMENT_BATCH',
      referenceId: batch3.id,
      note: `Consignment batch ${batch3.code} - Keripik mingguan`,
      occurredAt: batch3.receivedAt,
    },
  });

  // Batch 4: Keripik Pedas dari Pak Rizal
  const batch4 = await prisma.consignmentBatch.create({
    data: {
      code: 'CB-2025-004',
      consignorId: consignors[1].id,
      productId: consignmentProducts[3].id, // Keripik Pedas
      qtyIn: 25,
      qtySold: 5,
      qtyRemaining: 20,
      feeType: 'FLAT',
      feeFlat: new Decimal(2000),
      receivedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      status: 'ACTIVE',
      note: 'Batch mingguan',
    },
  });

  await prisma.stockMovement.create({
    data: {
      productId: consignmentProducts[3].id,
      movementType: 'CONSIGNMENT_IN',
      quantity: 25,
      referenceType: 'CONSIGNMENT_BATCH',
      referenceId: batch4.id,
      note: `Consignment batch ${batch4.code} - Keripik pedas mingguan`,
      occurredAt: batch4.receivedAt,
    },
  });

  // Batch 5: Teh Kotak dari CV Minuman Segar
  const batch5 = await prisma.consignmentBatch.create({
    data: {
      code: 'CB-2025-005',
      consignorId: consignors[2].id, // CV Minuman Segar
      productId: consignmentProducts[4].id, // Teh Kotak
      qtyIn: 50,
      qtySold: 10,
      qtyRemaining: 40,
      feeType: 'PERCENTAGE',
      feePercent: new Decimal(15.00),
      receivedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      status: 'ACTIVE',
      note: 'Batch mingguan minuman',
    },
  });

  await prisma.stockMovement.create({
    data: {
      productId: consignmentProducts[4].id,
      movementType: 'CONSIGNMENT_IN',
      quantity: 50,
      referenceType: 'CONSIGNMENT_BATCH',
      referenceId: batch5.id,
      note: `Consignment batch ${batch5.code} - Teh kotak mingguan`,
      occurredAt: batch5.receivedAt,
    },
  });

  console.log('✅ 5 Consignment batches created with FIFO tracking');

  // ========================================
  // 9. CREATE SAMPLE SALES (with FIFO allocation)
  // ========================================
  console.log('\n💰 Creating sample sales transactions...');

  // Sale 1: Mixed products (store-owned + consignment)
  const sale1 = await prisma.transaction.create({
    data: {
      memberId: members[0].id,
      type: 'SALE',
      totalAmount: new Decimal(68000), // 50k beras + 3x5k risol + 3k pisang
      paymentMethod: 'CASH',
      status: 'COMPLETED',
      note: 'Pembelian campuran',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
  });

  // Item 1: Beras (store-owned)
  const saleItem1_1 = await prisma.transactionItem.create({
    data: {
      transactionId: sale1.id,
      productId: storeProducts[0].id,
      quantity: 1,
      unitPrice: new Decimal(50000),
      totalPrice: new Decimal(50000),
      cogsPerUnit: new Decimal(45000),
      totalCogs: new Decimal(45000),
      grossProfit: new Decimal(5000),
    },
  });

  await prisma.stockMovement.create({
    data: {
      productId: storeProducts[0].id,
      movementType: 'SALE_OUT',
      quantity: -1,
      unitCost: new Decimal(45000),
      referenceType: 'SALE',
      referenceId: sale1.id,
      note: `Sale transaction ${sale1.id}`,
      occurredAt: sale1.date,
    },
  });

  // Item 2: Risol (consignment - FIFO from batch1)
  const saleItem1_2 = await prisma.transactionItem.create({
    data: {
      transactionId: sale1.id,
      productId: consignmentProducts[0].id,
      quantity: 3,
      unitPrice: new Decimal(5000),
      totalPrice: new Decimal(15000),
    },
  });

  // Create consignment sale records (FIFO allocation)
  const consignmentSale1 = await prisma.consignmentSale.create({
    data: {
      batchId: batch1.id,
      transactionItemId: saleItem1_2.id,
      qtySold: 3,
      unitPrice: new Decimal(5000),
      totalRevenue: new Decimal(15000),
      feeType: 'PERCENTAGE',
      feeAmount: new Decimal(3000), // 20% of 15000
      netToConsignor: new Decimal(12000),
      saleDate: sale1.date,
    },
  });

  await prisma.stockMovement.create({
    data: {
      productId: consignmentProducts[0].id,
      movementType: 'SALE_OUT',
      quantity: -3,
      referenceType: 'CONSIGNMENT_BATCH',
      referenceId: batch1.id,
      note: `Consignment sale from batch ${batch1.code}`,
      occurredAt: sale1.date,
    },
  });

  // Update batch qtySold
  await prisma.consignmentBatch.update({
    where: { id: batch1.id },
    data: {
      qtySold: { increment: 3 },
      qtyRemaining: { decrement: 3 },
    },
  });

  // Item 3: Pisang Goreng (consignment)
  const saleItem1_3 = await prisma.transactionItem.create({
    data: {
      transactionId: sale1.id,
      productId: consignmentProducts[1].id,
      quantity: 1,
      unitPrice: new Decimal(3000),
      totalPrice: new Decimal(3000),
    },
  });

  await prisma.consignmentSale.create({
    data: {
      batchId: batch2.id,
      transactionItemId: saleItem1_3.id,
      qtySold: 1,
      unitPrice: new Decimal(3000),
      totalRevenue: new Decimal(3000),
      feeType: 'PERCENTAGE',
      feeAmount: new Decimal(600), // 20%
      netToConsignor: new Decimal(2400),
      saleDate: sale1.date,
    },
  });

  await prisma.stockMovement.create({
    data: {
      productId: consignmentProducts[1].id,
      movementType: 'SALE_OUT',
      quantity: -1,
      referenceType: 'CONSIGNMENT_BATCH',
      referenceId: batch2.id,
      note: `Consignment sale from batch ${batch2.code}`,
      occurredAt: sale1.date,
    },
  });

  await prisma.consignmentBatch.update({
    where: { id: batch2.id },
    data: {
      qtySold: { increment: 1 },
      qtyRemaining: { decrement: 1 },
    },
  });

  console.log('✅ Sample sales with FIFO allocation created');

  // ========================================
  // 10. CREATE BROADCASTS
  // ========================================
  console.log('\n📢 Creating broadcasts...');
  await Promise.all([
    prisma.broadcast.create({
      data: {
        title: 'Pengumuman Sistem Inventory Baru',
        message: 'Koperasi UMB telah mengimplementasikan sistem inventory dengan dual ownership (Toko & Titipan) dan FIFO tracking untuk transparansi maksimal.',
        type: 'ANNOUNCEMENT',
        targetAudience: 'ALL',
        status: 'SENT',
        sentAt: new Date(),
        totalRecipients: members.length,
        successfulDeliveries: members.length,
        createdById: adminUser.id,
      },
    }),
    prisma.broadcast.create({
      data: {
        title: 'Produk Gorengan Segar Setiap Hari',
        message: 'Koperasi kini menyediakan gorengan segar dari Ibu Lastri setiap hari! Risol mayo dan pisang goreng available pukul 07:00 - 17:00.',
        type: 'INFO',
        targetAudience: 'ACTIVE_MEMBERS',
        status: 'SENT',
        sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        totalRecipients: members.length,
        successfulDeliveries: members.length,
        createdById: adminUser.id,
      },
    }),
  ]);
  console.log('✅ 2 Broadcasts created');

  // ========================================
  // SUMMARY
  // ========================================
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         🎉 ENHANCED SEEDING COMPLETED! 🎉                ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('📊 Summary:');
  console.log(`   - ${categories.length} Categories`);
  console.log(`   - ${users.length} Users (1 Admin + ${members.length} Members)`);
  console.log(`   - ${suppliers.length} Suppliers`);
  console.log(`   - ${consignors.length} Consignors`);
  console.log(`   - ${storeProducts.length} Store-Owned Products`);
  console.log(`   - ${consignmentProducts.length} Consignment Products`);
  console.log(`   - ${purchases.length} Purchase Orders`);
  console.log(`   - 5 Consignment Batches (FIFO tracking)`);
  console.log(`   - 1 Sample Sale with FIFO allocation`);
  console.log(`   - Complete StockMovement audit trail`);
  console.log('');
  console.log('✅ Database ready for Phase 2: Core Business Logic!');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Error during enhanced seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

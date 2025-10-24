const { PrismaClient } = require('@prisma/client');
const { randomUUID } = require('crypto');

const prisma = new PrismaClient();

async function main() {
  console.log('🎨 Seeding data konsinyasi/titipan...');

  // Get admin user
  const admin = await prisma.users.findFirst({ where: { role: 'ADMIN' } });
  if (!admin) {
    console.log('❌ User admin tidak ditemukan, jalankan seed.ts dulu');
    return;
  }

  // Create consignment suppliers
  const consignmentSuppliers = [
    {
      code: 'SUP-CONS-001',
      businessName: 'CV Berkah Jaya',
      ownerName: 'Ibu Siti Nurhaliza',
      phone: '081234567890',
      email: 'siti@berkahjaya.com',
      address: 'Jl. Mawar No. 45, Jakarta Selatan',
      productCategory: 'Makanan Ringan',
      description: 'Supplier makanan ringan titipan',
    },
    {
      code: 'SUP-CONS-002',
      businessName: 'UD Maju Sejahtera',
      ownerName: 'Bapak Ahmad Dahlan',
      phone: '082345678901',
      email: 'ahmad@majusejahtera.com',
      address: 'Jl. Melati No. 78, Jakarta Barat',
      productCategory: 'Minuman',
      description: 'Supplier minuman kemasan titipan',
    },
    {
      code: 'SUP-CONS-003',
      businessName: 'Toko Sumber Rezeki',
      ownerName: 'Ibu Dewi Kartika',
      phone: '083456789012',
      email: 'dewi@sumberrezeki.com',
      address: 'Jl. Anggrek No. 12, Jakarta Utara',
      productCategory: 'Sembako',
      description: 'Supplier sembako titipan',
    },
  ];

  console.log('📦 Membuat supplier konsinyasi...');
  const createdSuppliers = [];

  for (const sup of consignmentSuppliers) {
    const supplier = await prisma.suppliers.upsert({
      where: { code: sup.code },
      update: {
        businessName: sup.businessName,
        ownerName: sup.ownerName,
        phone: sup.phone,
        address: sup.address,
        productCategory: sup.productCategory,
        description: sup.description,
        updatedAt: new Date(),
      },
      create: {
        id: randomUUID(),
        code: sup.code,
        businessName: sup.businessName,
        ownerName: sup.ownerName,
        phone: sup.phone,
        email: sup.email,
        address: sup.address,
        productCategory: sup.productCategory,
        description: sup.description,
        status: 'APPROVED',
        paymentStatus: 'PAID_APPROVED',
        isPaymentActive: true,
        password: '$2a$10$YourHashedPassword', // dummy hash
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    createdSuppliers.push(supplier);
    console.log(`✅ Created/Updated supplier: ${sup.businessName}`);
  }

  // Create consignment products
  console.log('📦 Membuat produk konsinyasi...');
  
  const consignmentProducts = [
    // CV Berkah Jaya - Makanan Ringan
    { name: 'Chitato Rasa Sapi Panggang', price: 12000, cost: 9000, stock: 50, supplier: createdSuppliers[0] },
    { name: 'Cheetos Cheese', price: 10000, cost: 7500, stock: 60, supplier: createdSuppliers[0] },
    { name: 'Lays Rumput Laut', price: 11000, cost: 8500, stock: 45, supplier: createdSuppliers[0] },
    { name: 'Oreo Vanilla', price: 8000, cost: 6000, stock: 70, supplier: createdSuppliers[0] },
    
    // UD Maju Sejahtera - Minuman
    { name: 'Teh Botol Sosro 500ml', price: 5000, cost: 3500, stock: 100, supplier: createdSuppliers[1] },
    { name: 'Coca Cola 390ml', price: 6000, cost: 4500, stock: 80, supplier: createdSuppliers[1] },
    { name: 'Fruit Tea Apple', price: 5500, cost: 4000, stock: 90, supplier: createdSuppliers[1] },
    { name: 'Aqua Botol 600ml', price: 4000, cost: 3000, stock: 120, supplier: createdSuppliers[1] },
    
    // Toko Sumber Rezeki - Sembako
    { name: 'Indomie Goreng Original', price: 3500, cost: 2800, stock: 200, supplier: createdSuppliers[2] },
    { name: 'Beras Rojolele 1kg', price: 15000, cost: 12000, stock: 50, supplier: createdSuppliers[2] },
    { name: 'Minyak Sunco 2L', price: 35000, cost: 30000, stock: 30, supplier: createdSuppliers[2] },
    { name: 'Gula Pasir Gulaku 1kg', price: 18000, cost: 15000, stock: 40, supplier: createdSuppliers[2] },
  ];

  // Get or create Consignment category
  let consignmentCategory = await prisma.categories.findFirst({
    where: { name: 'Konsinyasi' }
  });

  if (!consignmentCategory) {
    consignmentCategory = await prisma.categories.create({
      data: {
        id: randomUUID(),
        name: 'Konsinyasi',
        description: 'Produk titipan dari supplier',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  for (const prod of consignmentProducts) {
    const product = await prisma.products.create({
      data: {
        id: randomUUID(),
        sku: `CONS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        name: prod.name,
        buyPrice: prod.cost,
        sellPrice: prod.price,
        stock: prod.stock,
        threshold: 10,
        unit: 'pcs',
        categoryId: consignmentCategory.id,
        supplierId: prod.supplier.id,
        ownershipType: 'TITIPAN',
        isConsignment: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    console.log(`✅ Created product: ${prod.name}`);
  }

  // Create consignment sales transactions for the last 7 days
  console.log('💰 Membuat transaksi penjualan konsinyasi...');
  
  const now = new Date();
  const products = await prisma.products.findMany({
    where: { ownershipType: 'TITIPAN' },
    include: { suppliers: true },
  });

  let totalTransactions = 0;

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date(now);
    date.setDate(date.getDate() - dayOffset);
    date.setHours(10, 0, 0, 0);

    // 3-8 consignment transactions per day
    const txCount = Math.floor(Math.random() * 6) + 3;

    for (let i = 0; i < txCount; i++) {
      const txDate = new Date(date);
      const hour = Math.floor(Math.random() * 9) + 8; // 8 AM - 5 PM
      const minute = Math.floor(Math.random() * 60);
      txDate.setHours(hour, minute, 0, 0);

      // Random 1-3 consignment items
      const itemCount = Math.floor(Math.random() * 3) + 1;
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
      const items = [];

      for (const product of selectedProducts) {
        const quantity = Math.floor(Math.random() * 3) + 1;
        const unitPrice = parseFloat(product.sellPrice.toString());
        const totalPrice = unitPrice * quantity;
        totalAmount += totalPrice;

        const cogsPerUnit = parseFloat(product.buyPrice.toString());
        const totalCogs = cogsPerUnit * quantity;
        const grossProfit = totalPrice - totalCogs;

        items.push({
          product,
          quantity,
          unitPrice,
          totalPrice,
          cogsPerUnit,
          totalCogs,
          grossProfit,
        });
      }

      // Create transaction
      const txId = `txn-${Date.now()}-${randomUUID().substring(0, 8)}`;
      const paymentMethods = ['CASH', 'TRANSFER', 'CREDIT'];
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

      const transaction = await prisma.transactions.create({
        data: {
          id: txId,
          type: 'SALE',
          totalAmount: totalAmount,
          paymentMethod: paymentMethod,
          status: 'COMPLETED',
          date: txDate,
          createdAt: txDate,
          updatedAt: txDate,
          isProduction: true,
        },
      });

      // Create transaction items and consignment sales
      for (let itemIdx = 0; itemIdx < items.length; itemIdx++) {
        const item = items[itemIdx];
        const itemId = `${txId}-item-${itemIdx}`;

        const transactionItem = await prisma.transaction_items.create({
          data: {
            id: itemId,
            transactionId: txId,
            productId: item.product.id,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            cogsPerUnit: item.cogsPerUnit,
            totalCogs: item.totalCogs,
            grossProfit: item.grossProfit,
            createdAt: txDate,
            isProduction: true,
          },
        });

        // Create consignment sales record
        await prisma.consignment_sales.create({
          data: {
            id: `cons-${Date.now()}-${itemIdx}`,
            transactionItemId: itemId,
            supplierId: item.product.supplierId,
            productId: item.product.id,
            quantity: item.quantity,
            sellingPrice: item.unitPrice,
            costPrice: item.cogsPerUnit,
            storeShare: item.grossProfit,
            supplierShare: item.totalCogs,
            saleDate: txDate,
            createdAt: txDate,
            updatedAt: txDate,
          },
        });
      }

      totalTransactions++;
    }
  }

  console.log(`✅ Created ${totalTransactions} consignment transactions`);

  console.log('\n🎉 Data konsinyasi berhasil ditambahkan!');
  console.log('\n📋 Summary:');
  console.log(`- ${createdSuppliers.length} supplier konsinyasi`);
  console.log(`- ${consignmentProducts.length} produk konsinyasi`);
  console.log(`- ${totalTransactions} transaksi penjualan konsinyasi (7 hari terakhir)`);
  console.log('\n✅ Cek di Inventory > Pembayaran Titipan untuk melihat tagihan supplier');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding consignment data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

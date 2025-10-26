const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedConsignmentPaymentTest() {
  console.log('🌱 Starting Consignment Payment Test Data Seeding...');

  try {
    // 1. Buat suppliers untuk produk titipan
    const suppliers = [
      {
        id: 'sup-titipan-001',
        code: 'SUP-KERIPIK-001',
        businessName: 'Bu Sari Keripik',
        ownerName: 'Ibu Sari',
        phone: '081234567890',
        address: 'Jl. Keripik No. 15, Jakarta',
        email: 'sari.keripik@email.com',
        password: '$2b$10$abcdefghijklmnopqrstuvwxyz', // dummy hash
        updatedAt: new Date()
      },
      {
        id: 'sup-titipan-002',
        code: 'SUP-SNACK-002',
        businessName: 'Pak Joko Snack',
        ownerName: 'Bapak Joko',
        phone: '082345678901',
        address: 'Jl. Snack Raya No. 22, Bogor',
        email: 'joko.snack@email.com',
        password: '$2b$10$abcdefghijklmnopqrstuvwxyz', // dummy hash
        updatedAt: new Date()
      },
      {
        id: 'sup-titipan-003',
        code: 'SUP-KUE-003',
        businessName: 'Toko Kue Melati',
        ownerName: 'Ibu Melati',
        phone: '083456789012',
        address: 'Jl. Manis No. 8, Depok',
        email: 'kue.melati@email.com',
        password: '$2b$10$abcdefghijklmnopqrstuvwxyz', // dummy hash
        updatedAt: new Date()
      },
      {
        id: 'sup-titipan-004',
        code: 'SUP-ROTI-004',
        businessName: 'CV. Roti Bahagia',
        ownerName: 'Bapak Anton',
        phone: '084567890123', 
        address: 'Jl. Roti No. 33, Tangerang',
        email: 'roti.bahagia@email.com',
        password: '$2b$10$abcdefghijklmnopqrstuvwxyz', // dummy hash
        updatedAt: new Date()
      },
      {
        id: 'sup-titipan-005',
        code: 'SUP-MINUMAN-005',
        businessName: 'Minuman Segar Pak Budi',
        ownerName: 'Bapak Budi',
        phone: '085678901234',
        address: 'Jl. Segar No. 12, Bekasi',
        email: 'minuman.segar@email.com',
        password: '$2b$10$abcdefghijklmnopqrstuvwxyz', // dummy hash
        updatedAt: new Date()
      }
    ];

    for (const supplier of suppliers) {
      await prisma.suppliers.upsert({
        where: { id: supplier.id },
        update: supplier,
        create: supplier
      });
    }
    console.log('✅ Created/Updated 5 suppliers');

    // 2. Buat kategori untuk produk titipan
    const categories = [
      { 
        id: 'cat-test-snack', 
        name: 'Test Snack & Keripik', 
        description: 'Kategori test untuk makanan ringan dan keripik',
        updatedAt: new Date()
      },
      { 
        id: 'cat-test-kue', 
        name: 'Test Kue & Pastry', 
        description: 'Kategori test untuk kue dan roti',
        updatedAt: new Date()
      },
      { 
        id: 'cat-test-minuman', 
        name: 'Test Minuman', 
        description: 'Kategori test untuk minuman segar dan kemasan',
        updatedAt: new Date()
      }
    ];

    for (const category of categories) {
      await prisma.categories.upsert({
        where: { id: category.id },
        update: category,
        create: category
      });
    }
    console.log('✅ Created/Updated categories');

    // 3. Buat produk titipan
    const consignmentProducts = [
      // Supplier Bu Sari Keripik
      {
        id: 'prod-keripik-001',
        name: 'Keripik Singkong Original',
        sku: 'KSO-001',
        categoryId: 'cat-test-snack',
        buyPrice: 8000,
        sellPrice: 12000,
        stock: 50,
        unit: 'pack',
        ownershipType: 'TITIPAN',
        supplierId: 'sup-titipan-001',
        threshold: 10,
        updatedAt: new Date()
      },
      {
        id: 'prod-keripik-002', 
        name: 'Keripik Pisang Balado',
        sku: 'KPB-002',
        categoryId: 'cat-test-snack',
        buyPrice: 9000,
        sellPrice: 14000,
        stock: 30,
        unit: 'pack',
        ownershipType: 'TITIPAN',
        supplierId: 'sup-titipan-001',
        threshold: 10,
        updatedAt: new Date()
      },
      
      // Supplier Pak Joko Snack
      {
        id: 'prod-snack-001',
        name: 'Kacang Telur Pedas', 
        sku: 'KTP-001',
        categoryId: 'cat-test-snack',
        buyPrice: 7500,
        sellPrice: 11000,
        stock: 40,
        unit: 'pack',
        ownershipType: 'TITIPAN',
        supplierId: 'sup-titipan-002',
        threshold: 8,
        updatedAt: new Date()
      },
      {
        id: 'prod-snack-002',
        name: 'Emping Melinjo Manis',
        sku: 'EMM-002', 
        categoryId: 'cat-test-snack',
        buyPrice: 12000,
        sellPrice: 18000,
        stock: 25,
        unit: 'pack',
        ownershipType: 'TITIPAN',
        supplierId: 'sup-titipan-002',
        threshold: 5,
        updatedAt: new Date()
      },

      // Supplier Toko Kue Melati
      {
        id: 'prod-kue-001',
        name: 'Donat Coklat Premium',
        sku: 'DCP-001',
        categoryId: 'cat-test-kue',
        buyPrice: 15000,
        sellPrice: 22000,
        stock: 20,
        unit: 'box',
        ownershipType: 'TITIPAN',
        supplierId: 'sup-titipan-003',
        threshold: 5,
        updatedAt: new Date()
      },
      {
        id: 'prod-kue-002',
        name: 'Brownies Pandan',
        sku: 'BRP-002',
        categoryId: 'cat-test-kue', 
        buyPrice: 18000,
        sellPrice: 26000,
        stock: 15,
        unit: 'box',
        ownershipType: 'TITIPAN',
        supplierId: 'sup-titipan-003',
        threshold: 5,
        updatedAt: new Date()
      },

      // Supplier CV. Roti Bahagia
      {
        id: 'prod-roti-001',
        name: 'Roti Tawar Gandum',
        sku: 'RTG-001',
        categoryId: 'cat-test-kue',
        buyPrice: 8500,
        sellPrice: 12500,
        stock: 35,
        unit: 'loaf',
        ownershipType: 'TITIPAN',
        supplierId: 'sup-titipan-004',
        threshold: 10,
        updatedAt: new Date()
      },
      {
        id: 'prod-roti-002',
        name: 'Croissant Butter',
        sku: 'CRB-002',
        categoryId: 'cat-test-kue',
        buyPrice: 6000,
        sellPrice: 10000,
        stock: 45,
        unit: 'pcs',
        ownershipType: 'TITIPAN',
        supplierId: 'sup-titipan-004',
        threshold: 15,
        updatedAt: new Date()
      },

      // Supplier Minuman Segar Pak Budi
      {
        id: 'prod-minuman-001',
        name: 'Jus Jeruk Fresh',
        sku: 'JJF-001',
        categoryId: 'cat-test-minuman',
        buyPrice: 5000,
        sellPrice: 8000,
        stock: 60,
        unit: 'botol',
        ownershipType: 'TITIPAN',
        supplierId: 'sup-titipan-005',
        threshold: 20,
        updatedAt: new Date()
      },
      {
        id: 'prod-minuman-002',
        name: 'Es Teh Manis',
        sku: 'ETM-002',
        categoryId: 'cat-test-minuman',
        buyPrice: 3000,
        sellPrice: 5500,
        stock: 80,
        unit: 'gelas',
        ownershipType: 'TITIPAN',
        supplierId: 'sup-titipan-005',
        threshold: 25,
        updatedAt: new Date()
      }
    ];

    for (const product of consignmentProducts) {
      await prisma.products.upsert({
        where: { id: product.id },
        update: product,
        create: product
      });
    }
    console.log('✅ Created/Updated 10 consignment products');

    // 4. Simulasi penjualan untuk 7 hari ke depan
    const today = new Date();
    const salesData = [];

    for (let day = 0; day < 7; day++) {
      const saleDate = new Date(today);
      saleDate.setDate(today.getDate() + day);
      
      // Random sales per day (5-15 transactions)
      const salesCount = Math.floor(Math.random() * 10) + 5;
      
      for (let sale = 0; sale < salesCount; sale++) {
        // Random product selection
        const randomProduct = consignmentProducts[Math.floor(Math.random() * consignmentProducts.length)];
        const quantity = Math.floor(Math.random() * 5) + 1; // 1-5 items
        
        const saleTime = new Date(saleDate);
        saleTime.setHours(Math.floor(Math.random() * 12) + 8); // 8AM - 8PM
        saleTime.setMinutes(Math.floor(Math.random() * 60));
        
        salesData.push({
          id: `sm-consign-${day}-${sale}-${Date.now()}`,
          productId: randomProduct.id,
          movementType: 'SALE_OUT',
          quantity: -quantity, // Negative for OUT
          note: `Penjualan hari ke-${day + 1}`,
          occurredAt: saleTime,
          unitCost: randomProduct.buyPrice, // COGS
          referenceType: 'SALE',
          referenceId: `sale-${day}-${sale}`
        });
      }
    }

    // Insert sales data
    for (const sale of salesData) {
      await prisma.stock_movements.create({
        data: sale
      });
    }
    console.log(`✅ Created ${salesData.length} consignment sales transactions for 7 days`);

    // 6. Update stock produk berdasarkan penjualan
    for (const product of consignmentProducts) {
      const totalSold = salesData
        .filter(sale => sale.productId === product.id)
        .reduce((sum, sale) => sum + Math.abs(sale.quantity), 0);
      
      await prisma.products.update({
        where: { id: product.id },
        data: {
          stock: Math.max(0, product.stock - totalSold)
        }
      });
    }
    console.log('✅ Updated product stocks based on sales');

    // 7. Summary report
    const totalProducts = consignmentProducts.length;
    const totalSuppliers = suppliers.length;
    const totalSales = salesData.length;
    const totalRevenue = salesData.reduce((sum, sale) => {
      return sum + (Math.abs(sale.quantity) * sale.unitPrice);
    }, 0);
    const totalCOGS = salesData.reduce((sum, sale) => {
      return sum + (Math.abs(sale.quantity) * sale.unitCost);
    }, 0);

    console.log('\n🎉 SEEDING COMPLETED SUCCESSFULLY!');
    console.log('📊 SUMMARY:');
    console.log(`   • ${totalSuppliers} Suppliers created`);
    console.log(`   • ${totalProducts} Consignment products created`);
    console.log(`   • ${totalSales} Sales transactions for 7 days`);
    console.log(`   • Total Revenue: Rp ${totalRevenue.toLocaleString('id-ID')}`);
    console.log(`   • Total COGS (Debt to Suppliers): Rp ${totalCOGS.toLocaleString('id-ID')}`);
    console.log(`   • Profit for Koperasi: Rp ${(totalRevenue - totalCOGS).toLocaleString('id-ID')}`);
    console.log('\n💡 Tips untuk Testing:');
    console.log('   1. Buka halaman Inventory → Pembayaran Titipan');
    console.log('   2. Pilih periode "7 hari terakhir" atau "1 bulan"');
    console.log('   3. Coba bayar beberapa supplier');
    console.log('   4. Lihat perubahan real-time di total tagihan');
    console.log('   5. Refresh untuk melihat perubahan persisten\n');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
seedConsignmentPaymentTest()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  });

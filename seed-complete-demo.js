const { PrismaClient } = require('@prisma/client');
const { randomUUID } = require('crypto');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Helper untuk generate ID
const generateId = (prefix) => `${prefix}-${Date.now()}-${randomUUID().substring(0, 8)}`;

// Data supplier realistis
const suppliersData = [
  {
    businessName: 'CV Maju Jaya Sembako',
    ownerName: 'Budi Santoso',
    email: 'budisantoso@majujaya.com',
    phone: '08123456789',
    address: 'Jl. Soekarno Hatta No. 123, Bandung',
    bankName: 'BCA',
    accountNumber: '1234567890',
    accountName: 'Budi Santoso',
  },
  {
    businessName: 'PT Snack Indonesia',
    ownerName: 'Siti Nurhaliza',
    email: 'siti@snackindonesia.com',
    phone: '08234567890',
    address: 'Jl. Cibaduyut No. 45, Bandung',
    bankName: 'Mandiri',
    accountNumber: '9876543210',
    accountName: 'Siti Nurhaliza',
  },
  {
    businessName: 'UD Minuman Segar',
    ownerName: 'Ahmad Dahlan',
    email: 'ahmad@minumansegar.com',
    phone: '08345678901',
    address: 'Jl. Dago No. 78, Bandung',
    bankName: 'BNI',
    accountNumber: '5555666677',
    accountName: 'Ahmad Dahlan',
  },
  {
    businessName: 'Toko Roti Manis',
    ownerName: 'Lisa Wijaya',
    email: 'lisa@rotimanis.com',
    phone: '08456789012',
    address: 'Jl. Pasir Kaliki No. 90, Bandung',
    bankName: 'BRI',
    accountNumber: '3333444455',
    accountName: 'Lisa Wijaya',
  },
  {
    businessName: 'CV Fresh Mart',
    ownerName: 'Hendra Gunawan',
    email: 'hendra@freshmart.com',
    phone: '08567890123',
    address: 'Jl. Buah Batu No. 56, Bandung',
    bankName: 'BCA',
    accountNumber: '7777888899',
    accountName: 'Hendra Gunawan',
  },
  {
    businessName: 'UD Alat Tulis Sejahtera',
    ownerName: 'Dewi Lestari',
    email: 'dewi@alattulis.com',
    phone: '08678901234',
    address: 'Jl. Cihampelas No. 34, Bandung',
    bankName: 'Mandiri',
    accountNumber: '2222333344',
    accountName: 'Dewi Lestari',
  },
  {
    businessName: 'PT Elektronik Jaya',
    ownerName: 'Bambang Suryadi',
    email: 'bambang@elektronikjaya.com',
    phone: '08789012345',
    address: 'Jl. Asia Afrika No. 12, Bandung',
    bankName: 'BNI',
    accountNumber: '6666777788',
    accountName: 'Bambang Suryadi',
  },
  {
    businessName: 'Toko Kopi Nusantara',
    ownerName: 'Ratna Sari',
    email: 'ratna@kopinusantara.com',
    phone: '08890123456',
    address: 'Jl. Braga No. 67, Bandung',
    bankName: 'BRI',
    accountNumber: '4444555566',
    accountName: 'Ratna Sari',
  },
];

// Data produk untuk setiap kategori
const productsData = [
  // Makanan
  { name: 'Indomie Goreng', category: 'Makanan', buyPrice: 2500, sellPrice: 3000, stock: 150, minStock: 30, ownership: 'TOKO' },
  { name: 'Indomie Soto', category: 'Makanan', buyPrice: 2500, sellPrice: 3000, stock: 120, minStock: 30, ownership: 'TOKO' },
  { name: 'Mie Sedaap Goreng', category: 'Makanan', buyPrice: 2500, sellPrice: 3000, stock: 100, minStock: 25, ownership: 'TOKO' },
  { name: 'Beras Premium 5kg', category: 'Makanan', buyPrice: 65000, sellPrice: 75000, stock: 50, minStock: 10, ownership: 'TOKO' },
  { name: 'Minyak Goreng 2L', category: 'Makanan', buyPrice: 28000, sellPrice: 32000, stock: 80, minStock: 20, ownership: 'TOKO' },
  { name: 'Gula Pasir 1kg', category: 'Makanan', buyPrice: 12000, sellPrice: 15000, stock: 70, minStock: 15, ownership: 'TOKO' },
  { name: 'Tepung Terigu 1kg', category: 'Makanan', buyPrice: 9000, sellPrice: 12000, stock: 60, minStock: 15, ownership: 'TOKO' },
  { name: 'Kecap Manis ABC 600ml', category: 'Makanan', buyPrice: 15000, sellPrice: 18000, stock: 45, minStock: 10, ownership: 'TOKO' },
  { name: 'Saus Sambal ABC 340ml', category: 'Makanan', buyPrice: 12000, sellPrice: 15000, stock: 50, minStock: 10, ownership: 'TOKO' },
  { name: 'Roti Tawar Sari Roti', category: 'Makanan', buyPrice: 11000, sellPrice: 14000, stock: 30, minStock: 10, ownership: 'TITIPAN', supplierId: 3 },
  
  // Minuman
  { name: 'Aqua 600ml', category: 'Minuman', buyPrice: 3000, sellPrice: 4000, stock: 200, minStock: 50, ownership: 'TOKO' },
  { name: 'Aqua Galon 19L', category: 'Minuman', buyPrice: 17000, sellPrice: 20000, stock: 40, minStock: 10, ownership: 'TOKO' },
  { name: 'Teh Botol Sosro 450ml', category: 'Minuman', buyPrice: 4000, sellPrice: 5000, stock: 150, minStock: 30, ownership: 'TOKO' },
  { name: 'Coca Cola 390ml', category: 'Minuman', buyPrice: 5000, sellPrice: 6500, stock: 120, minStock: 30, ownership: 'TOKO' },
  { name: 'Fanta 390ml', category: 'Minuman', buyPrice: 5000, sellPrice: 6500, stock: 100, minStock: 25, ownership: 'TOKO' },
  { name: 'Sprite 390ml', category: 'Minuman', buyPrice: 5000, sellPrice: 6500, stock: 100, minStock: 25, ownership: 'TOKO' },
  { name: 'Susu Ultra Full Cream 1L', category: 'Minuman', buyPrice: 15000, sellPrice: 18000, stock: 60, minStock: 15, ownership: 'TOKO' },
  { name: 'Susu Dancow Coklat Sachet', category: 'Minuman', buyPrice: 2000, sellPrice: 2500, stock: 200, minStock: 50, ownership: 'TOKO' },
  { name: 'Kopi Kapal Api Spesial', category: 'Minuman', buyPrice: 11000, sellPrice: 14000, stock: 80, minStock: 20, ownership: 'TITIPAN', supplierId: 7 },
  { name: 'Energen Sereal Coklat', category: 'Minuman', buyPrice: 8000, sellPrice: 10000, stock: 90, minStock: 20, ownership: 'TOKO' },

  // Snack
  { name: 'Chitato Rasa Sapi Panggang', category: 'Snack', buyPrice: 8000, sellPrice: 10000, stock: 75, minStock: 20, ownership: 'TITIPAN', supplierId: 1 },
  { name: 'Chitato Rasa Ayam', category: 'Snack', buyPrice: 8000, sellPrice: 10000, stock: 70, minStock: 20, ownership: 'TITIPAN', supplierId: 1 },
  { name: 'Cheetos Cheese', category: 'Snack', buyPrice: 7500, sellPrice: 9500, stock: 65, minStock: 15, ownership: 'TITIPAN', supplierId: 1 },
  { name: 'Taro Net 160g', category: 'Snack', buyPrice: 12000, sellPrice: 15000, stock: 55, minStock: 15, ownership: 'TITIPAN', supplierId: 1 },
  { name: 'Oreo Vanilla 137g', category: 'Snack', buyPrice: 9000, sellPrice: 11500, stock: 80, minStock: 20, ownership: 'TOKO' },
  { name: 'Biskuat Coklat', category: 'Snack', buyPrice: 8000, sellPrice: 10000, stock: 90, minStock: 20, ownership: 'TOKO' },
  { name: 'Wafer Tango Coklat', category: 'Snack', buyPrice: 6000, sellPrice: 8000, stock: 100, minStock: 25, ownership: 'TOKO' },
  { name: 'Pocky Chocolate', category: 'Snack', buyPrice: 11000, sellPrice: 14000, stock: 60, minStock: 15, ownership: 'TOKO' },
  { name: 'Pilus Garuda', category: 'Snack', buyPrice: 5000, sellPrice: 6500, stock: 85, minStock: 20, ownership: 'TITIPAN', supplierId: 1 },
  { name: 'Kacang Garuda', category: 'Snack', buyPrice: 7500, sellPrice: 9500, stock: 70, minStock: 15, ownership: 'TITIPAN', supplierId: 1 },

  // Alat Tulis
  { name: 'Pulpen Standard AE7', category: 'Alat Tulis', buyPrice: 2000, sellPrice: 3000, stock: 150, minStock: 30, ownership: 'TITIPAN', supplierId: 5 },
  { name: 'Pensil 2B Faber Castell', category: 'Alat Tulis', buyPrice: 2500, sellPrice: 3500, stock: 120, minStock: 30, ownership: 'TITIPAN', supplierId: 5 },
  { name: 'Penghapus Steadtler', category: 'Alat Tulis', buyPrice: 3000, sellPrice: 4000, stock: 100, minStock: 25, ownership: 'TITIPAN', supplierId: 5 },
  { name: 'Penggaris 30cm', category: 'Alat Tulis', buyPrice: 3500, sellPrice: 5000, stock: 80, minStock: 20, ownership: 'TITIPAN', supplierId: 5 },
  { name: 'Buku Tulis Sinar Dunia 38 lembar', category: 'Alat Tulis', buyPrice: 3500, sellPrice: 5000, stock: 200, minStock: 50, ownership: 'TOKO' },
  { name: 'Correction Pen Tip-Ex', category: 'Alat Tulis', buyPrice: 8000, sellPrice: 10000, stock: 60, minStock: 15, ownership: 'TITIPAN', supplierId: 5 },
  { name: 'Spidol Snowman Permanent', category: 'Alat Tulis', buyPrice: 5000, sellPrice: 7000, stock: 70, minStock: 15, ownership: 'TOKO' },
  { name: 'Stabilo Boss', category: 'Alat Tulis', buyPrice: 7000, sellPrice: 9000, stock: 50, minStock: 10, ownership: 'TITIPAN', supplierId: 5 },
  { name: 'Lem Kertas Povinal 350g', category: 'Alat Tulis', buyPrice: 12000, sellPrice: 15000, stock: 40, minStock: 10, ownership: 'TOKO' },
  { name: 'Gunting Joyko', category: 'Alat Tulis', buyPrice: 8000, sellPrice: 11000, stock: 45, minStock: 10, ownership: 'TOKO' },

  // Peralatan
  { name: 'Sapu Ijuk', category: 'Peralatan', buyPrice: 15000, sellPrice: 20000, stock: 30, minStock: 5, ownership: 'TOKO' },
  { name: 'Pel Lantai', category: 'Peralatan', buyPrice: 25000, sellPrice: 32000, stock: 25, minStock: 5, ownership: 'TOKO' },
  { name: 'Kemoceng', category: 'Peralatan', buyPrice: 8000, sellPrice: 12000, stock: 35, minStock: 8, ownership: 'TOKO' },
  { name: 'Sikat WC', category: 'Peralatan', buyPrice: 12000, sellPrice: 16000, stock: 28, minStock: 6, ownership: 'TOKO' },
  { name: 'Ember Plastik', category: 'Peralatan', buyPrice: 18000, sellPrice: 25000, stock: 40, minStock: 10, ownership: 'TOKO' },
  { name: 'Gayung Plastik', category: 'Peralatan', buyPrice: 5000, sellPrice: 8000, stock: 50, minStock: 10, ownership: 'TOKO' },
  { name: 'Gantungan Baju Plastik', category: 'Peralatan', buyPrice: 2000, sellPrice: 3000, stock: 100, minStock: 20, ownership: 'TOKO' },
  { name: 'Jemuran Baju Lipat', category: 'Peralatan', buyPrice: 45000, sellPrice: 60000, stock: 15, minStock: 3, ownership: 'TOKO' },
  { name: 'Baskom Plastik', category: 'Peralatan', buyPrice: 15000, sellPrice: 20000, stock: 35, minStock: 8, ownership: 'TOKO' },
  { name: 'Tempat Sampah Plastik', category: 'Peralatan', buyPrice: 25000, sellPrice: 35000, stock: 20, minStock: 5, ownership: 'TOKO' },
];

// Data members (anggota koperasi)
const membersData = [
  { name: 'Agus Wijaya', unit: 'Teknik Informatika', studentId: '1301210001', phone: '08111222333', simpananPokok: 100000, simpananWajib: 50000 },
  { name: 'Rina Marlina', unit: 'Manajemen', studentId: '1401210002', phone: '08111222334', simpananPokok: 100000, simpananWajib: 50000 },
  { name: 'Doni Pratama', unit: 'Teknik Sipil', studentId: '1501210003', phone: '08111222335', simpananPokok: 100000, simpananWajib: 50000 },
  { name: 'Sari Indah', unit: 'Akuntansi', studentId: '1601210004', phone: '08111222336', simpananPokok: 100000, simpananWajib: 50000 },
  { name: 'Rudi Hermawan', unit: 'Teknik Elektro', studentId: '1701210005', phone: '08111222337', simpananPokok: 100000, simpananWajib: 50000 },
  { name: 'Maya Putri', unit: 'Desain Komunikasi Visual', studentId: '1801210006', phone: '08111222338', simpananPokok: 100000, simpananWajib: 50000 },
  { name: 'Budi Setiawan', unit: 'Teknik Mesin', studentId: '1901210007', phone: '08111222339', simpananPokok: 100000, simpananWajib: 50000 },
  { name: 'Tina Kusuma', unit: 'Psikologi', studentId: '2001210008', phone: '08111222340', simpananPokok: 100000, simpananWajib: 50000 },
  { name: 'Andi Saputra', unit: 'Ilmu Komunikasi', studentId: '2101210009', phone: '08111222341', simpananPokok: 100000, simpananWajib: 50000 },
  { name: 'Yuni Astuti', unit: 'Farmasi', studentId: '2201210010', phone: '08111222342', simpananPokok: 100000, simpananWajib: 50000 },
];

async function main() {
  console.log('🚀 Starting comprehensive demo data seeding...\n');

  try {
    // 1. Create Categories
    console.log('📁 Creating categories...');
    const categories = ['Makanan', 'Minuman', 'Snack', 'Alat Tulis', 'Peralatan'];
    const categoryMap = {};
    
    for (const catName of categories) {
      const existing = await prisma.categories.findFirst({ where: { name: catName } });
      if (!existing) {
        const cat = await prisma.categories.create({
          data: {
            id: generateId('cat'),
            name: catName,
            description: `Kategori ${catName}`,
            updatedAt: new Date(),
          },
        });
        categoryMap[catName] = cat.id;
        console.log(`  ✓ ${catName}`);
      } else {
        categoryMap[catName] = existing.id;
        console.log(`  ↻ ${catName} (already exists)`);
      }
    }

    // 2. Create Supplier Users & Supplier Records
    console.log('\n👥 Creating suppliers...');
    const createdSuppliers = [];
    
    for (const supplierData of suppliersData) {
      // Check if email already exists
      const existingUser = await prisma.users.findFirst({ where: { email: supplierData.email } });
      if (existingUser) {
        console.log(`  ↻ ${supplierData.businessName} (already exists)`);
        const existingSupplier = await prisma.suppliers.findFirst({ where: { email: supplierData.email } });
        if (existingSupplier) {
          createdSuppliers.push(existingSupplier);
        }
        continue;
      }

      const hashedPassword = await bcrypt.hash('supplier123', 10);
      const userId = generateId('usr');
      const supplierId = generateId('sup');

      // Create user account
      await prisma.users.create({
        data: {
          id: userId,
          name: supplierData.ownerName,
          email: supplierData.email,
          password: hashedPassword,
          role: 'SUPPLIER',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Create supplier record
      const supplierCode = `SUP${String(createdSuppliers.length + 1).padStart(3, '0')}`;
      const supplier = await prisma.suppliers.create({
        data: {
          id: supplierId,
          code: supplierCode,
          businessName: supplierData.businessName,
          ownerName: supplierData.ownerName,
          email: supplierData.email,
          password: hashedPassword,
          phone: supplierData.phone,
          address: supplierData.address,
          status: 'ACTIVE',
          isActive: true,
          monthlyFee: 50000,
          paymentStatus: 'PAID',
          isPaymentActive: true,
          nextPaymentDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          approvedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      createdSuppliers.push(supplier);
      console.log(`  ✓ ${supplierData.businessName} - ${supplierData.ownerName}`);
    }

    // 3. Create Products
    console.log('\n📦 Creating products...');
    const createdProducts = [];
    
    for (const productData of productsData) {
      const existing = await prisma.products.findFirst({ where: { name: productData.name } });
      if (existing) {
        console.log(`  ↻ ${productData.name} (already exists)`);
        createdProducts.push(existing);
        continue;
      }

      const categoryId = categoryMap[productData.category];
      let supplierId = null;
      
      if (productData.ownership === 'TITIPAN' && productData.supplierId) {
        const supplierIndex = productData.supplierId - 1;
        if (supplierIndex < createdSuppliers.length) {
          supplierId = createdSuppliers[supplierIndex].id;
        }
      }

      const product = await prisma.products.create({
        data: {
          id: generateId('prd'),
          name: productData.name,
          categoryId: categoryId,
          sku: `SKU${Date.now()}${Math.floor(Math.random() * 1000)}`,
          buyPrice: productData.buyPrice,
          sellPrice: productData.sellPrice,
          stock: productData.stock,
          threshold: productData.minStock,
          unit: 'pcs',
          ownershipType: productData.ownership,
          supplierId: supplierId,
          isActive: true,
          status: 'ACTIVE',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      createdProducts.push(product);
      console.log(`  ✓ ${productData.name} (${productData.ownership})`);
    }

    // 4. Create Members (SKIP - requires user creation first)
    console.log('\n👤 Skipping members creation (requires user accounts)...');
    console.log('  ℹ Members can be created manually through the app');

    // 5. Create Transactions (last 30 days)
    console.log('\n💰 Creating transactions for last 30 days...');
    
    const now = new Date();
    let totalTransactions = 0;
    
    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      const date = new Date(now);
      date.setDate(date.getDate() - dayOffset);
      date.setHours(8, 0, 0, 0);
      
      // More transactions on recent days, fewer on older days
      const baseCount = Math.max(3, 15 - Math.floor(dayOffset / 5));
      const txCount = Math.floor(Math.random() * 5) + baseCount;
      
      for (let i = 0; i < txCount; i++) {
        const txDate = new Date(date);
        const hour = Math.floor(Math.random() * 9) + 8; // 8 AM - 5 PM
        const minute = Math.floor(Math.random() * 60);
        txDate.setHours(hour, minute, 0, 0);
        
        // Select random products
        const itemCount = Math.floor(Math.random() * 4) + 1;
        const selectedProducts = [];
        
        for (let j = 0; j < itemCount; j++) {
          const randomProduct = createdProducts[Math.floor(Math.random() * createdProducts.length)];
          selectedProducts.push(randomProduct);
        }
        
        let totalAmount = 0;
        const items = [];
        
        for (const product of selectedProducts) {
          const quantity = Math.floor(Math.random() * 3) + 1;
          const price = parseFloat(product.sellPrice.toString());
          const subtotal = price * quantity;
          totalAmount += subtotal;
          
          items.push({
            productId: product.id,
            quantity,
            price,
            subtotal,
          });
        }
        
        const paymentMethods = ['CASH', 'TRANSFER', 'CREDIT'];
        const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
        
        const txId = generateId('txn');
        
        await prisma.transactions.create({
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
            transaction_items: {
              create: items.map((item, idx) => ({
                id: `${txId}-item-${idx}`,
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.price,
                totalPrice: item.subtotal,
              })),
            },
          },
        });
        
        totalTransactions++;
      }
      
      if ((dayOffset + 1) % 7 === 0) {
        console.log(`  ✓ Created transactions for ${dayOffset + 1} days`);
      }
    }
    
    console.log(`  ✓ Total: ${totalTransactions} transactions created`);

    // 6. Create some EXPENSE transactions
    console.log('\n💸 Creating expense transactions...');
    
    const expenses = [
      { description: 'Listrik Bulan Ini', amount: 500000, date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { description: 'Air PDAM', amount: 150000, date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
      { description: 'Gaji Karyawan', amount: 3000000, date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
      { description: 'Pembelian Stok Barang', amount: 5000000, date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) },
      { description: 'Maintenance Peralatan', amount: 750000, date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000) },
    ];
    
    for (const expense of expenses) {
      await prisma.transactions.create({
        data: {
          id: generateId('txn'),
          type: 'EXPENSE',
          totalAmount: expense.amount,
          paymentMethod: 'TRANSFER',
          status: 'COMPLETED',
          note: expense.description,
          date: expense.date,
          createdAt: expense.date,
          updatedAt: expense.date,
          isProduction: true,
        },
      });
      
      console.log(`  ✓ ${expense.description} - Rp ${expense.amount.toLocaleString('id-ID')}`);
    }

    // 7. Create Broadcasts
    console.log('\n📢 Creating broadcast messages...');
    
    const admin = await prisma.users.findFirst({ where: { role: 'ADMIN' } });
    if (admin) {
      const broadcasts = [
        {
          title: 'Diskon Spesial Akhir Bulan!',
          message: 'Dapatkan diskon 10% untuk semua produk snack. Berlaku hingga akhir bulan ini!',
          type: 'ANNOUNCEMENT',
          targetAudience: 'ALL',
          status: 'SENT',
        },
        {
          title: 'Jam Operasional Libur Nasional',
          message: 'Koperasi akan tutup pada tanggal 17 Agustus. Terima kasih atas perhatiannya.',
          type: 'URGENT',
          targetAudience: 'ACTIVE_MEMBERS',
          status: 'SENT',
        },
        {
          title: 'Produk Baru Tersedia!',
          message: 'Kami kini menyediakan berbagai produk alat tulis berkualitas. Yuk mampir!',
          type: 'INFO',
          targetAudience: 'ALL',
          status: 'SENT',
        },
      ];
      
      for (const broadcast of broadcasts) {
        await prisma.broadcasts.create({
          data: {
            id: generateId('brc'),
            title: broadcast.title,
            message: broadcast.message,
            type: broadcast.type,
            targetAudience: broadcast.targetAudience,
            status: broadcast.status,
            totalRecipients: 100,
            successfulDeliveries: 98,
            failedDeliveries: 2,
            sentAt: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000),
            createdById: admin.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
        
        console.log(`  ✓ ${broadcast.title}`);
      }
    }

    console.log('\n✅ Demo data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • Categories: ${categories.length}`);
    console.log(`   • Suppliers: ${createdSuppliers.length}`);
    console.log(`   • Products: ${createdProducts.length}`);
    console.log(`   • Members: ${membersData.length}`);
    console.log(`   • Transactions: ${totalTransactions + expenses.length}`);
    console.log('\n🔐 Supplier Login Credentials:');
    console.log('   Email: (check suppliersData above)');
    console.log('   Password: supplier123');
    
  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

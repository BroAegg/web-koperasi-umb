const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

const prisma = new PrismaClient();

async function createAllUsers() {
  console.log('\n🔧 Creating all user accounts using raw SQL...\n');

  try {
    const hashedPassword = await bcrypt.hash('Password123!', 10);

    const users = [
      { id: randomUUID(), email: 'kasir@koperasi.com', name: 'Kasir', role: 'KASIR' },
      { id: randomUUID(), email: 'supplier@koperasi.com', name: 'Supplier', role: 'SUPPLIER' },
    ];

    for (const user of users) {
      // Check if exists
      const existing = await prisma.$queryRaw`
        SELECT id FROM users WHERE email = ${user.email}
      `;

      if (existing.length > 0) {
        console.log(`⚠️  ${user.email} already exists, skipping...`);
        continue;
      }

      // Insert user
      await prisma.$executeRaw`
        INSERT INTO users (id, email, name, password, role, isActive, mustChangePassword, createdAt, updatedAt)
        VALUES (
          ${user.id},
          ${user.email},
          ${user.name},
          ${hashedPassword},
          ${user.role},
          1,
          0,
          NOW(),
          NOW()
        )
      `;

      console.log(`✅ Created ${user.role}: ${user.email}`);

      // If SUPPLIER, create supplier profile
      if (user.role === 'SUPPLIER') {
        const supplierId = randomUUID();
        await prisma.$executeRaw`
          INSERT INTO suppliers (id, code, businessName, ownerName, email, phone, address, productCategory, status, paymentStatus, monthlyFee, isActive, isPaymentActive, lastPaymentDate, nextPaymentDue, createdAt, updatedAt)
          VALUES (
            ${supplierId},
            'SUP-001',
            'Toko Supplier Demo',
            'Supplier',
            ${user.email},
            '08123456789',
            'Jl. Demo No. 1',
            'Umum',
            'ACTIVE',
            'ACTIVE',
            25000,
            1,
            1,
            NOW(),
            DATE_ADD(NOW(), INTERVAL 30 DAY),
            NOW(),
            NOW()
          )
        `;
        console.log(`   ↳ Created supplier profile`);
      }
    }

    console.log('\n✅ All users created successfully!\n');
    console.log('📋 Login Credentials:\n');
    console.table([
      { Role: 'SUPER_ADMIN', Email: 'superadmin@koperasi.com', Password: 'Password123!' },
      { Role: 'ADMIN', Email: 'admin@koperasi.com', Password: 'Password123!' },
      { Role: 'KASIR', Email: 'kasir@koperasi.com', Password: 'Password123!' },
      { Role: 'SUPPLIER', Email: 'supplier@koperasi.com', Password: 'Password123!' },
    ]);

    console.log('\n🌐 Login URL: http://localhost:3000/login\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createAllUsers();

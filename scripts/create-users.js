const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

const prisma = new PrismaClient();

async function createUsers() {
  console.log('\n🔧 Creating user accounts...\n');

  try {
    const hashedPassword = await bcrypt.hash('Password123!', 10);

    const now = new Date();
    const users = [
      {
        id: randomUUID(),
        email: 'superadmin@koperasi.com',
        name: 'Super Admin',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        isActive: true,
        mustChangePassword: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        email: 'admin@koperasi.com',
        name: 'Admin',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
        mustChangePassword: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        email: 'kasir@koperasi.com',
        name: 'Kasir',
        password: hashedPassword,
        role: 'KASIR',
        isActive: true,
        mustChangePassword: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        email: 'supplier@koperasi.com',
        name: 'Supplier',
        password: hashedPassword,
        role: 'SUPPLIER',
        isActive: true,
        mustChangePassword: false,
        createdAt: now,
        updatedAt: now,
      },
    ];

    console.log('📝 Creating users...\n');

    for (const userData of users) {
      // Check if user already exists
      const existing = await prisma.users.findUnique({
        where: { email: userData.email },
      });

      if (existing) {
        console.log(`⚠️  User ${userData.email} already exists, skipping...`);
        continue;
      }

      // Create user
      const user = await prisma.users.create({
        data: userData,
      });

      console.log(`✅ Created ${user.role}: ${user.email}`);

      // If SUPPLIER, also create supplier profile
      if (user.role === 'SUPPLIER') {
        const existingSupplier = await prisma.suppliers.findFirst({
          where: { email: user.email },
        });

        if (!existingSupplier) {
          await prisma.suppliers.create({
            data: {
              id: randomUUID(),
              code: 'SUP-001',
              businessName: 'Toko Supplier Demo',
              ownerName: 'Supplier',
              email: user.email,
              phone: '08123456789',
              address: 'Jl. Demo No. 1',
              productCategory: 'Umum',
              status: 'ACTIVE',
              paymentStatus: 'ACTIVE',
              monthlyFee: 25000,
              isActive: true,
              isPaymentActive: true,
              lastPaymentDate: new Date(),
              nextPaymentDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            },
          });
          console.log(`   ↳ Created supplier profile for ${user.email}`);
        }
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
    console.error('❌ Error creating users:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createUsers();

/**
 * 🌱 MINIMAL SEED SCRIPT
 * 
 * Usage:
 *   node scripts/seed-minimal.js
 * 
 * This script seeds ONLY:
 * - Users (superadmin, admin, supplier, developer, 5 members)
 * - Categories (Sembako, Minuman, Makanan Ringan)
 * 
 * Perfect for starting fresh testing!
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

const prisma = new PrismaClient();

async function seedMinimal() {
  console.log('\n🌱 ========== MINIMAL SEED START ==========\n');

  try {
    // Clear existing data first
    console.log('🧹 Clearing existing data...');
    await prisma.consignment_sales.deleteMany({});
    await prisma.consignment_payments.deleteMany({});
    await prisma.consignment_batches.deleteMany({});
    await prisma.consignors.deleteMany({});
    await prisma.transaction_items.deleteMany({});
    await prisma.transactions.deleteMany({});
    await prisma.stock_movements.deleteMany({});
    await prisma.products.deleteMany({});
    await prisma.broadcasts.deleteMany({});
    await prisma.settlements.deleteMany({});
    await prisma.audit_logs.deleteMany({});
    await prisma.activity_logs.deleteMany({});
    console.log('✅ Cleanup complete\n');

    // Hash password
    const password = await bcrypt.hash('Password123!', 10);

    // Create users
    console.log('👤 Creating users...');
    
    const superAdmin = await prisma.users.upsert({
      where: { email: 'superadmin@koperasi.com' },
      update: {},
      create: {
        id: randomUUID(),
        email: 'superadmin@koperasi.com',
        name: 'Super Admin',
        password,
        role: 'SUPER_ADMIN',
        updatedAt: new Date(),
      },
    });

    const admin = await prisma.users.upsert({
      where: { email: 'admin@koperasi.com' },
      update: {},
      create: {
        id: randomUUID(),
        email: 'admin@koperasi.com',
        name: 'Admin Koperasi',
        password,
        role: 'ADMIN',
        updatedAt: new Date(),
      },
    });

    const supplier = await prisma.users.upsert({
      where: { email: 'supplier@koperasi.com' },
      update: {},
      create: {
        id: randomUUID(),
        email: 'supplier@koperasi.com',
        name: 'Supplier User',
        password,
        role: 'SUPPLIER',
        updatedAt: new Date(),
      },
    });

    const developer = await prisma.users.upsert({
      where: { email: 'developer@koperasi.com' },
      update: {},
      create: {
        id: randomUUID(),
        email: 'developer@koperasi.com',
        name: 'Developer',
        password,
        role: 'DEVELOPER',
        updatedAt: new Date(),
      },
    });

    console.log('✅ Core users created');

    // Create members
    console.log('👥 Creating members...');
    const members = [];
    for (let i = 1; i <= 5; i++) {
      const member = await prisma.users.upsert({
        where: { email: `member${i}@koperasi.com` },
        update: {},
        create: {
          id: randomUUID(),
          email: `member${i}@koperasi.com`,
          name: `Member ${i}`,
          password,
          role: 'USER',
          updatedAt: new Date(),
        },
      });

      const memberDetail = await prisma.members.create({
        data: {
          id: randomUUID(),
          userId: member.id,
          name: `Member ${i}`,
          memberNumber: `MEM-${String(i).padStart(5, '0')}`,
          phone: `08123456789${i}`,
          address: `Jalan Member ${i}, Jakarta`,
          joinDate: new Date(),
          status: 'ACTIVE',
          updatedAt: new Date(),
        },
      });

      members.push(memberDetail);
    }
    console.log('✅ 5 members created');

    // Create categories
    console.log('📁 Creating categories...');
    const categories = await Promise.all([
      prisma.categories.create({
        data: {
          id: randomUUID(),
          name: 'Sembako',
          description: 'Sembilan bahan pokok',
          updatedAt: new Date(),
        },
      }),
      prisma.categories.create({
        data: {
          id: randomUUID(),
          name: 'Minuman',
          description: 'Berbagai jenis minuman',
          updatedAt: new Date(),
        },
      }),
      prisma.categories.create({
        data: {
          id: randomUUID(),
          name: 'Makanan Ringan',
          description: 'Snack dan makanan ringan',
          updatedAt: new Date(),
        },
      }),
    ]);
    console.log('✅ 3 categories created');

    console.log('\n✅ ========== MINIMAL SEED COMPLETED ==========');
    console.log('📝 Users created:');
    console.log('   - superadmin@koperasi.com (SUPER_ADMIN)');
    console.log('   - admin@koperasi.com (ADMIN)');
    console.log('   - supplier@koperasi.com (SUPPLIER)');
    console.log('   - developer@koperasi.com (DEVELOPER)');
    console.log('   - member1-5@koperasi.com (USER)');
    console.log('\n📁 Categories created:');
    console.log('   - Sembako');
    console.log('   - Minuman');
    console.log('   - Makanan Ringan');
    console.log('\n💡 Password for all users: Password123!');
    console.log('\n🎯 Ready for manual testing!');
    console.log('   Add products, make transactions, test features!');
    console.log('=============================================\n');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedMinimal();

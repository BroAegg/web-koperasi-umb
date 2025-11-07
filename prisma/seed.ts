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
  console.log('   No products, transactions, or stock movements.');
  console.log('   You can now test POS, Inventory, and other features manually.');
  console.log('=============================================\n');

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
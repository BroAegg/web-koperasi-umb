// Seed simple users with easy username & password
// Run: npx tsx prisma/seed-simple-users.ts

import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting simple users seed...\n');

  // Hash password "password" untuk semua user
  const hashedPassword = await bcrypt.hash('password', 10);

  // Define users with hierarchy: SUPER_ADMIN > ADMIN > KASIR
  const users = [
    {
      id: 'superadmin-001',
      email: 'superadmin',
      name: 'Super Admin',
      role: Role.SUPER_ADMIN,
      mustChangePassword: false,
    },
    {
      id: 'admin-001',
      email: 'admin',
      name: 'Admin',
      role: Role.ADMIN,
      mustChangePassword: false,
    },
    {
      id: 'kasir-001',
      email: 'kasir1',
      name: 'Kasir 1',
      role: Role.KASIR,
      mustChangePassword: false,
    },
    {
      id: 'kasir-002',
      email: 'kasir2',
      name: 'Kasir 2',
      role: Role.KASIR,
      mustChangePassword: false,
    },
    {
      id: 'developer-aegner',
      email: 'developer',
      name: 'Developer',
      role: Role.DEVELOPER,
      mustChangePassword: false,
    },
  ];

  console.log('👥 Creating users...\n');

  // Delete existing users first
  await prisma.users.deleteMany({});
  console.log('🗑️  Cleared existing users\n');

  // Create new users
  for (const userData of users) {
    const user = await prisma.users.create({
      data: {
        ...userData,
        password: hashedPassword,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log(`✅ Created: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Password: password\n`);
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 Seed Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Total users created: ${users.length}\n`);

  console.log('🔐 Login Credentials (All use password: "password"):\n');
  
  console.log('📧 superadmin');
  console.log('   Password: password');
  console.log('   Role: SUPER_ADMIN');
  console.log('   Access: Full system access\n');

  console.log('📧 admin');
  console.log('   Password: password');
  console.log('   Role: ADMIN');
  console.log('   Access: Management & oversight\n');

  console.log('📧 kasir1');
  console.log('   Password: password');
  console.log('   Role: KASIR');
  console.log('   Access: POS & store operations only\n');

  console.log('📧 kasir2');
  console.log('   Password: password');
  console.log('   Role: KASIR');
  console.log('   Access: POS & store operations only\n');

  console.log('📧 developer');
  console.log('   Password: password');
  console.log('   Role: DEVELOPER');
  console.log('   Access: God mode (all features + dev tools)\n');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('💡 Role Hierarchy:');
  console.log('   1. SUPER_ADMIN - Full system control');
  console.log('   2. ADMIN - Management & reporting');
  console.log('   3. KASIR - Store operations only');
  console.log('   4. DEVELOPER - Technical access');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('🎉 Simple users seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

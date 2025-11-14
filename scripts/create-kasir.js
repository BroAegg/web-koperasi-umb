const { PrismaClient, Role } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

const prisma = new PrismaClient();

async function createKasir() {
  console.log('\n🔧 Creating Kasir user...\n');

  try {
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    const now = new Date();

    // Check if user already exists
    const existing = await prisma.users.findUnique({
      where: { email: 'kasir@koperasi.com' },
    });

    if (existing) {
      console.log(`⚠️  User kasir@koperasi.com already exists!`);
      console.log(`Role: ${existing.role}`);
      await prisma.$disconnect();
      return;
    }

    // Create user
    const user = await prisma.users.create({
      data: {
        id: randomUUID(),
        email: 'kasir@koperasi.com',
        name: 'Kasir',
        password: hashedPassword,
        role: Role.KASIR, // Use enum directly
        isActive: true,
        mustChangePassword: false,
        createdAt: now,
        updatedAt: now,
      },
    });

    console.log(`✅ Created KASIR: ${user.email}`);
    console.log('\n📋 Login Credentials:\n');
    console.log(`Email: kasir@koperasi.com`);
    console.log(`Password: Password123!`);
    console.log('\n🌐 Login URL: http://localhost:3000/login\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createKasir();

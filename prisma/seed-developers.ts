import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Creating Developer Accounts...\n');

  // Hash password yang kuat
  const hashedPassword = await bcrypt.hash('DevSecure2025!@#', 10);

  // Reyvan (Backend Lead)
  const reyvan = await prisma.users.upsert({
    where: { email: 'reyvan.dev@koperasi-umb.com' },
    update: {},
    create: {
      id: 'dev-reyvan-' + Date.now(),
      name: 'Reyvan Developer',
      email: 'reyvan.dev@koperasi-umb.com',
      password: hashedPassword,
      role: 'DEVELOPER' as Role, // Use string literal with type assertion
      isActive: true,
      updatedAt: new Date(),
    },
  });
  console.log('✅ Created:', reyvan.email);

  // Aegner (Frontend Lead)
  const aegner = await prisma.users.upsert({
    where: { email: 'aegner.dev@koperasi-umb.com' },
    update: {},
    create: {
      id: 'dev-aegner-' + Date.now(),
      name: 'Aegner Developer',
      email: 'aegner.dev@koperasi-umb.com',
      password: hashedPassword,
      role: 'DEVELOPER' as Role, // Use string literal with type assertion
      isActive: true,
      updatedAt: new Date(),
    },
  });
  console.log('✅ Created:', aegner.email);

  console.log('\n📝 Developer Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Email    : reyvan.dev@koperasi-umb.com');
  console.log('Email    : aegner.dev@koperasi-umb.com');
  console.log('Password : DevSecure2025!@#');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⚠️  IMPORTANT: CHANGE PASSWORD AFTER FIRST LOGIN!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error creating developer accounts:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

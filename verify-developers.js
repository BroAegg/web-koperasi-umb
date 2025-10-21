const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyDevelopers() {
  console.log('🔍 Checking for Developer accounts...\n');

  try {
    // Check for all users (we'll filter by role in JS)
    const allUsers = await prisma.users.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      }
    });

    // Filter developers in JavaScript
    const developers = allUsers.filter(u => u.role === 'DEVELOPER');

    console.log(`Total users found: ${allUsers.length}`);
    console.log(`Roles in database: ${[...new Set(allUsers.map(u => u.role))].join(', ')}\n`);

    if (developers.length === 0) {
      console.log('❌ NO DEVELOPER ACCOUNTS FOUND!\n');
      console.log('📝 To create developer accounts, run:');
      console.log('   npx tsx prisma/seed-developers.ts\n');
      return false;
    }

    console.log(`✅ Found ${developers.length} Developer account(s):\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    developers.forEach((dev, index) => {
      console.log(`${index + 1}. ${dev.name}`);
      console.log(`   Email     : ${dev.email}`);
      console.log(`   Role      : ${dev.role}`);
      console.log(`   Active    : ${dev.isActive ? '✅ Yes' : '❌ No'}`);
      console.log(`   Created   : ${dev.createdAt.toLocaleDateString('id-ID')}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });

    console.log('\n📋 Developer Credentials (default):');
    console.log('   Email    : reyvan.dev@koperasi-umb.com');
    console.log('   Email    : aegner.dev@koperasi-umb.com');
    console.log('   Password : DevSecure2025!@#');
    console.log('   ⚠️  Change password after first login!\n');

    return true;
  } catch (error) {
    console.error('❌ Error checking developers:', error.message);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

verifyDevelopers();

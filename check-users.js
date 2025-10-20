const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  console.log('📊 Checking Database Users...\n');
  
  const users = await prisma.users.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
    orderBy: {
      role: 'asc'
    }
  });
  
  console.log(`Total Users: ${users.length}\n`);
  
  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.name || 'No Name'}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   ID: ${user.id}\n`);
  });
  
  // Check for specific test users
  console.log('🔍 Looking for test accounts...');
  const admin = users.find(u => u.email === 'admin@umb.ac.id');
  const superadmin = users.find(u => u.email === 'superadmin@umb.ac.id');
  
  console.log(`✓ admin@umb.ac.id: ${admin ? '✅ EXISTS' : '❌ NOT FOUND'}`);
  console.log(`✓ superadmin@umb.ac.id: ${superadmin ? '✅ EXISTS' : '❌ NOT FOUND'}`);
  
  await prisma.$disconnect();
}

checkUsers().catch(console.error);

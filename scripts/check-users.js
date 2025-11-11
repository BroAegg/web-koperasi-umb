const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  const users = await prisma.users.findMany({
    select: {
      email: true,
      name: true,
      role: true,
      isActive: true,
    }
  });
  
  console.log('\n=== Available Users ===\n');
  users.forEach(u => {
    console.log(`Name: ${u.name}`);
    console.log(`Email: ${u.email}`);
    console.log(`Role: ${u.role}`);
    console.log(`Active: ${u.isActive}`);
    console.log(`Password: (check seed-auth.ts for default password)`);
    console.log('---');
  });
  
  console.log('\n💡 Default password biasanya: "password123" atau "admin123"\n');
  console.log('📝 Cek prisma/seed-auth.ts untuk password detailnya\n');
  
  await prisma.$disconnect();
}

checkUsers();

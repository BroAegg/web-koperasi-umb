const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyDevelopers() {
  const developers = await prisma.users.findMany({
    where: { role: 'DEVELOPER' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  console.log('\n=== Developer Accounts ===');
  developers.forEach((dev) => {
    console.log(`ID: ${dev.id}`);
    console.log(`Name: ${dev.name}`);
    console.log(`Email: ${dev.email}`);
    console.log(`Role: ${dev.role}`);
    console.log(`Active: ${dev.isActive}`);
    console.log(`Created: ${dev.createdAt.toLocaleString('id-ID')}`);
    console.log('---');
  });
  console.log(`Total: ${developers.length} developer account(s)\n`);

  await prisma.$disconnect();
}

verifyDevelopers().catch(console.error);

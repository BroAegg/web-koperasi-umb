const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Checking suppliers...\n');
  
  // Check all users with SUPPLIER role
  const supplierUsers = await prisma.users.findMany({
    where: { role: 'SUPPLIER' },
    select: { id: true, email: true, name: true, role: true },
  });
  
  console.log(`Found ${supplierUsers.length} users with SUPPLIER role:`);
  supplierUsers.forEach(u => console.log(`  - ${u.email} (${u.name})`));
  
  console.log('\n---\n');
  
  // Check suppliers table
  const suppliers = await prisma.suppliers.findMany({
    select: { 
      id: true, 
      email: true, 
      businessName: true, 
      status: true,
      isSuspendedForPayment: true,
      maxActiveProducts: true,
      currentActiveProducts: true,
    },
  });
  
  console.log(`Found ${suppliers.length} registered suppliers:`);
  suppliers.forEach(s => console.log(`  - ${s.email} (${s.businessName}) - Status: ${s.status}, Suspended: ${s.isSuspendedForPayment}`));
  
  await prisma.$disconnect();
}

main().catch(console.error);

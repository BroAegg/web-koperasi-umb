const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('Checking users table...');
    const users = await prisma.users.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      }
    });
    
    console.log(`\nTotal users found: ${users.length}`);
    console.log('\nUsers:');
    users.forEach(user => {
      console.log(`- ${user.email} (${user.role}) - ${user.name} - Active: ${user.isActive}`);
    });

    console.log('\n\nChecking supplier_profiles table...');
    const suppliers = await prisma.supplier_profiles.findMany({
      select: {
        id: true,
        email: true,
        businessName: true,
        status: true,
      }
    });

    console.log(`\nTotal suppliers found: ${suppliers.length}`);
    console.log('\nSuppliers:');
    suppliers.forEach(supplier => {
      console.log(`- ${supplier.email} - ${supplier.businessName} - Status: ${supplier.status}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAuth() {
  try {
    console.log('Testing database connections...\n');
    
    // Test users table
    const users = await prisma.users.findMany({
      select: { id: true, email: true, name: true, role: true }
    });
    console.log('✅ Users found:', users.length);
    users.forEach(u => console.log(`  - ${u.email} (${u.role})`));
    
    console.log('');
    
    // Test supplier_profiles table
    const suppliers = await prisma.supplier_profiles.findMany({
      select: { 
        id: true, 
        email: true, 
        businessName: true, 
        status: true,
        paymentStatus: true,
        password: true 
      }
    });
    console.log('✅ Suppliers found:', suppliers.length);
    suppliers.forEach(s => console.log(`  - ${s.email} (${s.businessName}) - Status: ${s.status}, Payment: ${s.paymentStatus}, Has password: ${!!s.password}`));
    
    console.log('');
    
    // Test dashboard API data
    const totalMembers = await prisma.members.count();
    const totalProducts = await prisma.products.count();
    console.log('✅ Dashboard stats:');
    console.log(`  - Total members: ${totalMembers}`);
    console.log(`  - Total products: ${totalProducts}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuth();

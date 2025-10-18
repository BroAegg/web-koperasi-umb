const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testSupplierLogin() {
  try {
    console.log('🧪 Testing Supplier Login Flow\n');
    
    const email = 'supplier@test.com';
    const password = 'Password123!';
    
    console.log(`1. Looking for supplier: ${email}`);
    
    // Simulate login API flow
    const supplier = await prisma.supplier_profiles.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        businessName: true,
        password: true,
        status: true,
        paymentStatus: true
      }
    });
    
    if (!supplier) {
      console.log('❌ Supplier not found');
      return;
    }
    
    console.log('✅ Supplier found:', supplier.businessName);
    console.log(`   Status: ${supplier.status}`);
    console.log(`   Payment: ${supplier.paymentStatus}`);
    
    if (!supplier.password) {
      console.log('❌ No password set');
      return;
    }
    
    console.log('\n2. Verifying password...');
    const isMatch = await bcrypt.compare(password, supplier.password);
    
    if (!isMatch) {
      console.log('❌ Password incorrect');
      return;
    }
    
    console.log('✅ Password correct');
    
    console.log('\n3. Login would succeed!');
    console.log('   Token would be generated with:');
    console.log(`   - userId: ${supplier.id}`);
    console.log(`   - role: SUPPLIER`);
    console.log(`   - Redirect to: /koperasi/supplier`);
    
    console.log('\n✅ SUPPLIER LOGIN TEST: PASSED');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSupplierLogin();

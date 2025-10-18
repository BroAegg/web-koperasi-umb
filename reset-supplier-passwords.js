const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetSupplierPasswords() {
  try {
    console.log('🔄 Resetting all supplier passwords to: Password123!\n');
    
    const suppliers = await prisma.supplier_profiles.findMany({
      select: { id: true, email: true, businessName: true }
    });
    
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    
    for (const supplier of suppliers) {
      await prisma.supplier_profiles.update({
        where: { id: supplier.id },
        data: { password: hashedPassword }
      });
      console.log(`✅ Reset password for: ${supplier.email}`);
    }
    
    console.log('\n✅ All passwords reset successfully!');
    console.log('\n📋 Supplier Login Credentials:');
    console.log('═'.repeat(60));
    
    suppliers.forEach(s => {
      console.log(`\n🔑 ${s.businessName}`);
      console.log(`   Email: ${s.email}`);
      console.log(`   Password: Password123!`);
    });
    console.log('\n' + '═'.repeat(60));
    
    // Verify one password
    console.log('\n🧪 Verifying password for supplier@test.com...');
    const testSupplier = await prisma.supplier_profiles.findUnique({
      where: { email: 'supplier@test.com' },
      select: { password: true }
    });
    
    const isValid = await bcrypt.compare('Password123!', testSupplier.password);
    console.log(`✅ Password verification: ${isValid ? 'PASSED' : 'FAILED'}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetSupplierPasswords();

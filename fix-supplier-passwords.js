const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function fixSupplierPasswords() {
  try {
    console.log('🔧 Fixing supplier passwords...\n');
    
    // Set password for all suppliers
    const suppliers = await prisma.supplier_profiles.findMany({
      select: { id: true, email: true, businessName: true, password: true }
    });
    
    console.log(`Found ${suppliers.length} suppliers\n`);
    
    for (const supplier of suppliers) {
      if (!supplier.password) {
        console.log(`❌ ${supplier.email} - No password, setting default...`);
        const hashedPassword = await bcrypt.hash('Password123!', 10);
        await prisma.supplier_profiles.update({
          where: { id: supplier.id },
          data: { password: hashedPassword }
        });
        console.log(`✅ Password set for ${supplier.email}`);
      } else {
        console.log(`✅ ${supplier.email} - Already has password`);
        
        // Test if password is 'Password123!'
        const isMatch = await bcrypt.compare('Password123!', supplier.password);
        console.log(`   Password is 'Password123!': ${isMatch ? 'YES' : 'NO'}`);
      }
    }
    
    console.log('\n✅ All suppliers have passwords now!');
    console.log('\n📋 Supplier Login Credentials:');
    console.log('─'.repeat(60));
    
    const updatedSuppliers = await prisma.supplier_profiles.findMany({
      select: { 
        email: true, 
        businessName: true, 
        status: true,
        paymentStatus: true 
      }
    });
    
    updatedSuppliers.forEach(s => {
      console.log(`Email: ${s.email}`);
      console.log(`Business: ${s.businessName}`);
      console.log(`Password: Password123!`);
      console.log(`Status: ${s.status} | Payment: ${s.paymentStatus}`);
      console.log('─'.repeat(60));
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixSupplierPasswords();

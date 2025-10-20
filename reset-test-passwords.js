const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetPasswords() {
  console.log('🔐 Resetting test user passwords...\n');
  
  const testUsers = [
    { email: 'admin@koperasi.com', password: 'admin123', name: 'Admin User' },
    { email: 'superadmin@koperasi.com', password: 'superadmin123', name: 'Super Admin' },
    { email: 'supplier@koperasi.com', password: 'supplier123', name: 'Supplier User' },
    { email: 'member1@koperasi.com', password: 'member123', name: 'Anggota 1' },
  ];
  
  for (const user of testUsers) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    
    await prisma.users.update({
      where: { email: user.email },
      data: { password: hashedPassword }
    });
    
    console.log(`✅ ${user.name} (${user.email})`);
    console.log(`   Password: ${user.password}\n`);
  }
  
  console.log('🎉 All test passwords reset successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('   Admin: admin@koperasi.com / admin123');
  console.log('   Super Admin: superadmin@koperasi.com / superadmin123');
  console.log('   Supplier: supplier@koperasi.com / supplier123');
  console.log('   Member: member1@koperasi.com / member123');
  
  await prisma.$disconnect();
}

resetPasswords().catch(console.error);

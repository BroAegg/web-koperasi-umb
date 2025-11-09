/**
 * Quick fix for Nur Saputra's balance
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixBalance() {
  const result = await prisma.members.update({
    where: { nomorAnggota: 'A0013' },
    data: { 
      simpananPokok: 0,
      simpananWajib: 0,
      simpananSukarela: 30000000 
    }
  });
  
  console.log('✅ Fixed Nur Saputra balance:');
  console.log(`   Sukarela: Rp ${Number(result.simpananSukarela).toLocaleString('id-ID')}`);
  
  await prisma.$disconnect();
}

fixBalance();

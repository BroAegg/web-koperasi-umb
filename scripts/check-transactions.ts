/**
 * Script to check recent transactions for debugging
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTransactions() {
  console.log('🔍 Checking recent savings transactions...\n');

  try {
    // Get Nur Saputra's data
    const member = await prisma.members.findFirst({
      where: { name: { contains: 'Nur Saputra' } },
      select: {
        id: true,
        name: true,
        nomorAnggota: true,
        simpananPokok: true,
        simpananWajib: true,
        simpananSukarela: true,
      },
    });

    if (!member) {
      console.log('❌ Nur Saputra not found!');
      return;
    }

    console.log('👤 Member Info:');
    console.log(`   Name: ${member.name} (${member.nomorAnggota})`);
    console.log(`   Pokok: Rp ${Number(member.simpananPokok).toLocaleString('id-ID')}`);
    console.log(`   Wajib: Rp ${Number(member.simpananWajib).toLocaleString('id-ID')}`);
    console.log(`   Sukarela: Rp ${Number(member.simpananSukarela).toLocaleString('id-ID')}`);
    console.log(`   Total: Rp ${(Number(member.simpananPokok) + Number(member.simpananWajib) + Number(member.simpananSukarela)).toLocaleString('id-ID')}\n`);

    // Get all savings transactions
    const transactions = await prisma.transactions.findMany({
      where: {
        OR: [
          {
            type: 'INCOME',
            note: { startsWith: 'Setor Simpanan' },
          },
          {
            type: 'EXPENSE',
            note: { startsWith: 'Penarikan Simpanan' },
          },
        ],
        status: 'COMPLETED',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });

    console.log(`📋 Found ${transactions.length} savings transactions (showing latest 20):\n`);

    transactions.forEach((t, index) => {
      const amount = Number(t.totalAmount);
      const sign = t.type === 'INCOME' ? '➕' : '➖';
      console.log(`${index + 1}. ${sign} ${t.type} - Rp ${amount.toLocaleString('id-ID')}`);
      console.log(`   Note: ${t.note}`);
      console.log(`   Date: ${t.date.toISOString()}`);
      console.log(`   Created: ${t.createdAt.toISOString()}`);
      console.log(`   Status: ${t.status}\n`);
    });

    // Calculate total for Nur Saputra
    const nurTransactions = transactions.filter(t => t.note?.includes('Nur Saputra'));
    console.log(`\n💰 Nur Saputra's transactions: ${nurTransactions.length}`);
    
    let calculatedBalance = {
      pokok: 0,
      wajib: 0,
      sukarela: 0,
    };

    nurTransactions.forEach(t => {
      const amount = Number(t.totalAmount);
      if (t.type === 'INCOME') {
        if (t.note?.includes('POKOK')) calculatedBalance.pokok += amount;
        else if (t.note?.includes('WAJIB')) calculatedBalance.wajib += amount;
        else if (t.note?.includes('SUKARELA')) calculatedBalance.sukarela += amount;
      } else if (t.type === 'EXPENSE') {
        calculatedBalance.sukarela -= amount;
      }
    });

    console.log('\n🧮 Calculated from transactions:');
    console.log(`   Pokok: Rp ${calculatedBalance.pokok.toLocaleString('id-ID')}`);
    console.log(`   Wajib: Rp ${calculatedBalance.wajib.toLocaleString('id-ID')}`);
    console.log(`   Sukarela: Rp ${calculatedBalance.sukarela.toLocaleString('id-ID')}`);
    console.log(`   Total: Rp ${(calculatedBalance.pokok + calculatedBalance.wajib + calculatedBalance.sukarela).toLocaleString('id-ID')}`);

    console.log('\n🔄 Difference:');
    console.log(`   Pokok: ${Number(member.simpananPokok) === calculatedBalance.pokok ? '✅ Match' : '❌ ' + (Number(member.simpananPokok) - calculatedBalance.pokok)}`);
    console.log(`   Wajib: ${Number(member.simpananWajib) === calculatedBalance.wajib ? '✅ Match' : '❌ ' + (Number(member.simpananWajib) - calculatedBalance.wajib)}`);
    console.log(`   Sukarela: ${Number(member.simpananSukarela) === calculatedBalance.sukarela ? '✅ Match' : '❌ ' + (Number(member.simpananSukarela) - calculatedBalance.sukarela)}`);

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkTransactions()
  .then(() => {
    console.log('\n✅ Check completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Check failed:', error);
    process.exit(1);
  });

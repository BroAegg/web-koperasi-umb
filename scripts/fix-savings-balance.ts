/**
 * Script to recalculate and fix member savings balances
 * Run this with: npx tsx scripts/fix-savings-balance.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixSavingsBalances() {
  console.log('🔧 Starting savings balance recalculation...\n');

  try {
    // Get all members
    const members = await prisma.members.findMany({
      select: {
        id: true,
        name: true,
        nomorAnggota: true,
        simpananPokok: true,
        simpananWajib: true,
        simpananSukarela: true,
      },
    });

    console.log(`Found ${members.length} members to process\n`);

    for (const member of members) {
      console.log(`\n📝 Processing: ${member.name} (${member.nomorAnggota})`);
      console.log(`   Current balances:`);
      console.log(`   - Pokok: Rp ${Number(member.simpananPokok).toLocaleString('id-ID')}`);
      console.log(`   - Wajib: Rp ${Number(member.simpananWajib).toLocaleString('id-ID')}`);
      console.log(`   - Sukarela: Rp ${Number(member.simpananSukarela).toLocaleString('id-ID')}`);

      // Get all savings transactions for this member
      // Note format: "Setor Simpanan {TYPE} - {member.name}" or "Penarikan Simpanan Sukarela - {member.name}"
      const allTransactions = await prisma.transactions.findMany({
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
          date: 'asc',
        },
      });

      // Filter transactions for this specific member
      const transactions = allTransactions.filter(t => 
        t.note?.includes(member.name)
      );

      console.log(`   Found ${transactions.length} transactions`);

      // Calculate correct balances
      let newPokok = 0;
      let newWajib = 0;
      let newSukarela = 0;

      transactions.forEach((t) => {
        const amount = Number(t.totalAmount);
        
        if (t.type === 'INCOME') {
          // Deposits
          if (t.note?.includes('POKOK')) {
            newPokok += amount;
          } else if (t.note?.includes('WAJIB')) {
            newWajib += amount;
          } else if (t.note?.includes('SUKARELA')) {
            newSukarela += amount;
          }
        } else if (t.type === 'EXPENSE') {
          // Withdrawals (only for SUKARELA)
          if (t.note?.includes('Penarikan Simpanan')) {
            newSukarela -= amount;
          }
        }
      });

      console.log(`   Calculated balances:`);
      console.log(`   - Pokok: Rp ${newPokok.toLocaleString('id-ID')}`);
      console.log(`   - Wajib: Rp ${newWajib.toLocaleString('id-ID')}`);
      console.log(`   - Sukarela: Rp ${newSukarela.toLocaleString('id-ID')}`);

      // Check if update is needed
      const needsUpdate = 
        Number(member.simpananPokok) !== newPokok ||
        Number(member.simpananWajib) !== newWajib ||
        Number(member.simpananSukarela) !== newSukarela;

      if (needsUpdate) {
        // Update member balances
        await prisma.members.update({
          where: { id: member.id },
          data: {
            simpananPokok: newPokok,
            simpananWajib: newWajib,
            simpananSukarela: newSukarela,
          },
        });
        console.log(`   ✅ Updated balances`);
      } else {
        console.log(`   ✔️  Balances already correct`);
      }
    }

    console.log('\n\n✨ All member balances have been recalculated and updated!');
    console.log('\nSummary:');
    console.log(`- Total members processed: ${members.length}`);
    
  } catch (error) {
    console.error('❌ Error during recalculation:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixSavingsBalances()
  .then(() => {
    console.log('\n🎉 Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });

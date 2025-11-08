import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

// Generate realistic test member data
export async function POST() {
  try {
    const firstNames = [
      'Budi', 'Siti', 'Ahmad', 'Dewi', 'Eko', 'Fitri', 'Hadi', 'Indah', 
      'Joko', 'Kartika', 'Lukman', 'Maya', 'Nur', 'Putri', 'Rudi'
    ];
    
    const lastNames = [
      'Santoso', 'Wijaya', 'Kusuma', 'Pratama', 'Lestari', 'Saputra', 
      'Hidayat', 'Nugroho', 'Setiawan', 'Wulandari', 'Firmansyah', 'Rahayu'
    ];

    const units = [
      'IT Department', 'Finance', 'HR', 'Marketing', 'Operations', 
      'Sales', 'Production', 'Quality Control', 'Logistics', 'R&D'
    ];

    const genders = ['MALE', 'FEMALE'];
    const savingTypes = ['POKOK', 'WAJIB', 'SUKARELA', 'WITHDRAWAL'];
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AUG', 'SEP', 'OKT', 'NOV', 'DES'];

    const membersToCreate = 15;
    const createdMembers = [];
    let totalSavings = 0;

    // Get the highest member number
    const lastMember = await prisma.members.findFirst({
      orderBy: { nomorAnggota: 'desc' },
      select: { nomorAnggota: true }
    });

    let nextNumber = 1;
    if (lastMember?.nomorAnggota) {
      const match = lastMember.nomorAnggota.match(/A(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }

    for (let i = 0; i < membersToCreate; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const fullName = `${firstName} ${lastName}`;
      const gender = genders[Math.floor(Math.random() * genders.length)] as 'MALE' | 'FEMALE';
      const unitKerja = units[Math.floor(Math.random() * units.length)];
      const nomorAnggota = `A${String(nextNumber + i).padStart(4, '0')}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${nextNumber + i}@koperasi.test`;
      const phone = `08${Math.floor(Math.random() * 900000000 + 100000000)}`;
      const address = `Jl. Raya No. ${Math.floor(Math.random() * 100 + 1)}, Jakarta`;

      // Generate join date (random between Jan-Jun 2024)
      const joinMonth = Math.floor(Math.random() * 6); // 0-5 (Jan-Jun)
      const joinDate = new Date(2024, joinMonth, 1);
      
      // Calculate months active (from join date to now - Nov 2024)
      const monthsActive = 11 - joinMonth; // Nov is month 10 (0-indexed), so 11 total months in year
      
      // Generate realistic savings amounts
      const simpananPokok = 200000; // Fixed Rp 200.000 saat pendaftaran
      const simpananWajib = monthsActive * 50000; // Rp 50.000 per bulan × bulan aktif
      const simpananSukarela = Math.floor(Math.random() * 10) * 100000; // 0 - 900k (optional)

      const userId = randomUUID();
      const memberId = randomUUID();

      // Create user
      await prisma.users.create({
        data: {
          id: userId,
          email,
          name: fullName,
          password: '$2a$10$dummyhashedpassword', // Dummy hash
          role: 'USER',
          isActive: true,
          updatedAt: new Date(),
        }
      });

      // Create member
      await prisma.members.create({
        data: {
          id: memberId,
          userId,
          nomorAnggota,
          name: fullName,
          email,
          phone,
          address,
          gender,
          unitKerja,
          simpananPokok,
          simpananWajib,
          simpananSukarela,
          status: 'ACTIVE',
          joinDate: joinDate,
          updatedAt: new Date(),
        }
      });

      // Generate savings transaction history
      const savingsHistory = [];

      // 1. Simpanan Pokok (once, at join date)
      savingsHistory.push({
        id: randomUUID(),
        memberId,
        type: 'POKOK',
        amount: simpananPokok,
        description: 'Simpanan Pokok - Pendaftaran',
        date: joinDate,
        createdAt: new Date(),
      });

      // 2. Simpanan Wajib (monthly - Rp 50.000/month since join date)
      const monthlyWajib = 50000;
      for (let m = 0; m < monthsActive; m++) {
        const wajibMonth = joinMonth + m;
        savingsHistory.push({
          id: randomUUID(),
          memberId,
          type: 'WAJIB',
          amount: monthlyWajib,
          description: `Simpanan Wajib - ${months[wajibMonth]} 2024`,
          date: new Date(2024, wajibMonth, 10),
          createdAt: new Date(),
        });
      }

      // 3. Simpanan Sukarela (random deposits and withdrawals)
      if (simpananSukarela > 0) {
        const sukarelaTx = Math.floor(Math.random() * 8 + 5); // 5-12 transactions
        let currentSukarela = 0;

        for (let s = 0; s < sukarelaTx; s++) {
          const month = Math.floor(Math.random() * 10); // Random month in 2024
          const isDeposit = Math.random() > 0.3; // 70% deposit, 30% withdrawal

          if (isDeposit) {
            const amount = Math.floor(Math.random() * 3 + 1) * 50000; // 50k-150k
            currentSukarela += amount;
            savingsHistory.push({
              id: randomUUID(),
              memberId,
              type: 'SUKARELA',
              amount,
              description: `Setor Sukarela - ${months[month]} 2024`,
              date: new Date(2024, month, Math.floor(Math.random() * 28 + 1)),
              createdAt: new Date(),
            });
          } else if (currentSukarela > 0) {
            // Withdrawal (only if there's balance)
            const amount = Math.min(
              Math.floor(Math.random() * 2 + 1) * 25000, // 25k-75k
              currentSukarela
            );
            currentSukarela -= amount;
            savingsHistory.push({
              id: randomUUID(),
              memberId,
              type: 'WITHDRAWAL',
              amount,
              description: `Tarik Sukarela - ${months[month]} 2024`,
              date: new Date(2024, month, Math.floor(Math.random() * 28 + 1)),
              createdAt: new Date(),
            });
          }
        }

        // Adjust last transaction to match final sukarela amount
        const calculatedSukarela = savingsHistory
          .filter(s => s.type === 'SUKARELA' || s.type === 'WITHDRAWAL')
          .reduce((sum, s) => sum + (s.type === 'WITHDRAWAL' ? -s.amount : s.amount), 0);

        if (calculatedSukarela !== simpananSukarela) {
          const diff = simpananSukarela - calculatedSukarela;
          if (diff > 0) {
            savingsHistory.push({
              id: randomUUID(),
              memberId,
              type: 'SUKARELA',
              amount: diff,
              description: `Setor Sukarela - DES 2024`,
              date: new Date(2024, 11, 15),
              createdAt: new Date(),
            });
          }
        }
      }

      // Save all transactions
      for (const saving of savingsHistory) {
        await prisma.savings.create({ 
          data: {
            ...saving,
            type: saving.type as any, // Type assertion for enum
          }
        });
        totalSavings++;
      }

      createdMembers.push({
        name: fullName,
        nomorAnggota,
        totalSimpanan: simpananPokok + simpananWajib + simpananSukarela,
        transactions: savingsHistory.length,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully generated ${membersToCreate} test members with ${totalSavings} savings transactions`,
      data: {
        membersCreated: membersToCreate,
        savingsCreated: totalSavings,
        members: createdMembers,
      }
    });

  } catch (error: any) {
    console.error('Generate test members error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate test members',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

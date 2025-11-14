import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding member data...');

  // Create USER role account with simple credentials: member / password
  const hashedPassword = await bcrypt.hash('password', 10);

  const userId = randomUUID();
  const memberId = randomUUID();

  // Create user account
  const user = await prisma.users.upsert({
    where: { email: 'member' },
    update: {},
    create: {
      id: userId,
      email: 'member',
      password: hashedPassword,
      name: 'Ahmad Fauzi',
      role: 'USER',
      isActive: true,
      mustChangePassword: false,
      updatedAt: new Date(),
    },
  });

  console.log('✅ User created:', user.email);

  // Create member profile
  const member = await prisma.members.upsert({
    where: { email: 'member' },
    update: {},
    create: {
      id: memberId,
      userId: user.id,
      nomorAnggota: 'UMB-2024-001',
      name: 'Ahmad Fauzi',
      email: 'member',
      phone: '081234567890',
      address: 'Jl. Cikutra No. 204, Bandung',
      gender: 'MALE',
      unitKerja: 'Fakultas Teknik',
      status: 'ACTIVE',
      isMemberKoperasi: true,
      simpananPokok: 100000,
      simpananWajib: 250000,
      simpananSukarela: 500000,
      points: 1250,
      tier: 'SILVER',
      totalSpent: 2500000,
      joinDate: new Date('2024-01-15'),
      updatedAt: new Date(),
    },
  });

  console.log('✅ Member created:', member.nomorAnggota);

  // Create sample loan
  const loanId = randomUUID();
  const loan = await prisma.loans.create({
    data: {
      id: loanId,
      memberId: member.id,
      amount: 5000000,
      interestRate: 12,
      tenor: 12,
      monthlyPayment: 444352,
      remainingAmount: 3554816,
      status: 'ACTIVE',
      purpose: 'Renovasi rumah',
      approvedAt: new Date('2024-05-25'),
      approvedBy: 'admin',
      startDate: new Date('2024-06-01'),
      endDate: new Date('2025-06-01'),
      description: 'Pinjaman untuk renovasi rumah - Disetujui',
      updatedAt: new Date(),
    },
  });

  console.log('✅ Loan created:', formatCurrency(Number(loan.amount)));

  // Create sample savings history
  const savingsHistory = await prisma.savings.createMany({
    data: [
      {
        id: randomUUID(),
        memberId: member.id,
        type: 'POKOK',
        amount: 100000,
        description: 'Simpanan pokok awal',
        date: new Date('2024-01-15'),
      },
      {
        id: randomUUID(),
        memberId: member.id,
        type: 'WAJIB',
        amount: 50000,
        description: 'Simpanan wajib Januari 2024',
        date: new Date('2024-01-15'),
      },
      {
        id: randomUUID(),
        memberId: member.id,
        type: 'WAJIB',
        amount: 50000,
        description: 'Simpanan wajib Februari 2024',
        date: new Date('2024-02-15'),
      },
      {
        id: randomUUID(),
        memberId: member.id,
        type: 'SUKARELA',
        amount: 200000,
        description: 'Tabungan sukarela',
        date: new Date('2024-03-10'),
      },
      {
        id: randomUUID(),
        memberId: member.id,
        type: 'SUKARELA',
        amount: 300000,
        description: 'Tabungan sukarela tambahan',
        date: new Date('2024-05-20'),
      },
    ],
  });

  console.log('✅ Savings history created:', savingsHistory.count, 'records');

  // Create points history
  await prisma.member_points_history.createMany({
    data: [
      {
        id: randomUUID(),
        memberId: member.id,
        type: 'EARNED',
        points: 500,
        balance: 500,
        description: 'Pembelian Rp 500,000',
        createdAt: new Date('2024-10-01'),
      },
      {
        id: randomUUID(),
        memberId: member.id,
        type: 'EARNED',
        points: 350,
        balance: 850,
        description: 'Pembelian Rp 350,000',
        createdAt: new Date('2024-10-15'),
      },
      {
        id: randomUUID(),
        memberId: member.id,
        type: 'REDEEMED',
        points: -100,
        balance: 750,
        description: 'Tukar poin senilai Rp 10,000',
        createdAt: new Date('2024-10-20'),
      },
      {
        id: randomUUID(),
        memberId: member.id,
        type: 'EARNED',
        points: 500,
        balance: 1250,
        description: 'Pembelian Rp 500,000',
        createdAt: new Date('2024-11-05'),
      },
    ],
  });

  console.log('✅ Points history created');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 Login credentials:');
  console.log('   Username: member');
  console.log('   Password: password');
  console.log('   No. Anggota:', member.nomorAnggota);
  console.log('\n💰 Member Stats:');
  console.log('   Total Simpanan:', formatCurrency(Number(member.simpananPokok) + Number(member.simpananWajib) + Number(member.simpananSukarela)));
  console.log('   Points:', member.points);
  console.log('   Tier:', member.tier);
  console.log('   Active Loan:', formatCurrency(Number(loan.remainingAmount)));
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

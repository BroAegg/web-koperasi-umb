const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkMembers() {
  const members = await prisma.members.findMany({
    select: {
      name: true,
      simpananPokok: true,
      simpananWajib: true,
      simpananSukarela: true,
    }
  });
  
  console.log('Members data:');
  console.log(JSON.stringify(members, null, 2));
  
  let totalPokok = 0;
  let totalWajib = 0;
  let totalSukarela = 0;
  
  members.forEach(m => {
    totalPokok += Number(m.simpananPokok || 0);
    totalWajib += Number(m.simpananWajib || 0);
    totalSukarela += Number(m.simpananSukarela || 0);
  });
  
  console.log('\nTotals:');
  console.log('Pokok:', totalPokok);
  console.log('Wajib:', totalWajib);
  console.log('Sukarela:', totalSukarela);
  console.log('Total:', totalPokok + totalWajib + totalSukarela);
  
  await prisma.$disconnect();
}

checkMembers();

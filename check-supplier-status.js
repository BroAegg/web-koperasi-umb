const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const suppliers = await prisma.suppliers.findMany({
      select: {
        id: true,
        businessName: true,
        status: true,
        paymentStatus: true,
        monthlyFee: true,
        supplier_payments: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            amount: true,
            status: true,
            paymentProof: true,
            createdAt: true,
          }
        }
      },
      take: 8
    });
    
    console.log('=== SUPPLIER STATUS ===\n');
    suppliers.forEach((s, i) => {
      console.log(`${i + 1}. ${s.businessName}`);
      console.log(`   Status: ${s.status}`);
      console.log(`   Payment: ${s.paymentStatus}`);
      console.log(`   Monthly Fee: Rp ${s.monthlyFee.toLocaleString()}`);
      if (s.supplier_payments.length > 0) {
        const payment = s.supplier_payments[0];
        console.log(`   Last Payment:`);
        console.log(`     - Amount: Rp ${payment.amount.toLocaleString()}`);
        console.log(`     - Status: ${payment.status}`);
        console.log(`     - Proof: ${payment.paymentProof ? 'YES' : 'NO'}`);
      }
      console.log('');
    });
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function testWorkflow() {
  console.log('🚀 TESTING 3-STAGE SUPPLIER VERIFICATION WORKFLOW\n');
  console.log('=' .repeat(60));
  
  try {
    // ========== STAGE 1: REGISTRATION ==========
    console.log('\n📝 STAGE 1: Supplier Registration');
    console.log('-'.repeat(60));
    
    const testSupplierEmail = `test.supplier.${Date.now()}@demo.com`;
    const hashedPassword = await bcrypt.hash('supplier123', 10);
    
    const newSupplier = await prisma.suppliers.create({
      data: {
        id: `sup-test-${Date.now()}`,
        code: `SUP${Date.now().toString().slice(-6)}`,
        businessName: 'Toko Testing Workflow',
        ownerName: 'Budi Test',
        email: testSupplierEmail,
        phone: '081234567890',
        address: 'Jl. Testing No. 123',
        password: hashedPassword,
        productCategory: 'Makanan',
        description: 'Supplier untuk testing workflow',
        monthlyFee: 25000,
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });
    
    console.log(`✅ Supplier Created:`);
    console.log(`   Email: ${newSupplier.email}`);
    console.log(`   Status: ${newSupplier.status}`);
    console.log(`   Payment Status: ${newSupplier.paymentStatus}`);
    console.log(`   👉 Supplier sees: "Menunggu Persetujuan Admin" screen`);
    
    // ========== STAGE 2: ADMIN APPROVAL ==========
    console.log('\n\n✅ STAGE 2: Super Admin Approves Supplier');
    console.log('-'.repeat(60));
    
    const approvedSupplier = await prisma.suppliers.update({
      where: { id: newSupplier.id },
      data: {
        status: 'ACTIVE',
        approvedAt: new Date(),
        updatedAt: new Date(),
      }
    });
    
    console.log(`✅ Supplier Approved:`);
    console.log(`   Status: ${approvedSupplier.status}`);
    console.log(`   Payment Status: ${approvedSupplier.paymentStatus}`);
    console.log(`   👉 Supplier sees: Payment submission form (Rp 25.000)`);
    
    // ========== STAGE 3: PAYMENT SUBMISSION ==========
    console.log('\n\n💰 STAGE 3: Supplier Submits Payment Proof');
    console.log('-'.repeat(60));
    
    const paymentProofUrl = 'https://example.com/bukti-transfer-demo.jpg';
    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    const paymentRecord = await prisma.supplier_payments.create({
      data: {
        id: `spay-test-${Date.now()}`,
        supplierId: newSupplier.id,
        amount: 25000,
        paymentDate: now,
        paymentMethod: 'TRANSFER',
        paymentProof: paymentProofUrl,
        periodStart: now,
        periodEnd: nextMonth,
        status: 'PENDING',
        note: 'Pembayaran biaya bulanan (TEST)',
        createdAt: now,
        updatedAt: now,
      }
    });
    
    const supplierWithPayment = await prisma.suppliers.update({
      where: { id: newSupplier.id },
      data: {
        paymentStatus: 'PAID_PENDING_APPROVAL',
        updatedAt: new Date(),
      }
    });
    
    console.log(`✅ Payment Submitted:`);
    console.log(`   Amount: Rp ${paymentRecord.amount.toLocaleString()}`);
    console.log(`   Proof URL: ${paymentRecord.paymentProof}`);
    console.log(`   Payment Status: ${supplierWithPayment.paymentStatus}`);
    console.log(`   Payment Record Status: ${paymentRecord.status}`);
    console.log(`   👉 Super Admin sees: "Menunggu Verifikasi" badge + View Proof button`);
    
    // ========== STAGE 4: PAYMENT VERIFICATION ==========
    console.log('\n\n🔍 STAGE 4: Super Admin Verifies Payment');
    console.log('-'.repeat(60));
    
    // Simulate super admin approval
    const verifiedPayment = await prisma.supplier_payments.update({
      where: { id: paymentRecord.id },
      data: {
        status: 'VERIFIED',
        verifiedAt: new Date(),
        updatedAt: new Date(),
      }
    });
    
    const finalSupplier = await prisma.suppliers.update({
      where: { id: newSupplier.id },
      data: {
        paymentStatus: 'PAID_APPROVED',
        isPaymentActive: true,
        lastPaymentDate: now,
        nextPaymentDue: nextMonth,
        updatedAt: new Date(),
      }
    });
    
    console.log(`✅ Payment Approved:`);
    console.log(`   Payment Status: ${finalSupplier.paymentStatus}`);
    console.log(`   Payment Active: ${finalSupplier.isPaymentActive}`);
    console.log(`   Payment Record Status: ${verifiedPayment.status}`);
    console.log(`   👉 Supplier sees: Full dashboard with product management access`);
    
    // ========== SUMMARY ==========
    console.log('\n\n📊 WORKFLOW SUMMARY');
    console.log('='.repeat(60));
    console.log(`Supplier ID: ${finalSupplier.id}`);
    console.log(`Email: ${finalSupplier.email}`);
    console.log(`Password: supplier123`);
    console.log(`\nStatus Progression:`);
    console.log(`  1️⃣  PENDING → Waiting approval screen`);
    console.log(`  2️⃣  ACTIVE + UNPAID → Payment form`);
    console.log(`  3️⃣  ACTIVE + PAID_PENDING_APPROVAL → Waiting verification`);
    console.log(`  4️⃣  ACTIVE + PAID_APPROVED → Full dashboard access ✅`);
    
    console.log('\n\n🎯 TESTING CREDENTIALS:');
    console.log('='.repeat(60));
    console.log('Supplier Login:');
    console.log(`  Email: ${finalSupplier.email}`);
    console.log(`  Password: supplier123`);
    console.log(`  URL: http://localhost:3000/supplier`);
    console.log('\nSuper Admin Login:');
    console.log(`  Email: superadmin@koperasi.com`);
    console.log(`  Password: superadmin123`);
    console.log(`  URL: http://localhost:3000/koperasi/super-admin/suppliers`);
    
    console.log('\n✅ Workflow testing completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Error during workflow test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testWorkflow();

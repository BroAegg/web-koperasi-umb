/**
 * Manual Testing Script - Supplier System
 * 
 * Run this after starting the dev server to verify core functionality
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runTests() {
  console.log('\n🧪 === MANUAL TESTING CHECKLIST === \n');
  
  let passedTests = 0;
  let failedTests = 0;
  let totalTests = 0;
  
  // Test 1: Database Connection
  totalTests++;
  try {
    await prisma.$connect();
    console.log('✅ Test 1: Database connection successful');
    passedTests++;
  } catch (error) {
    console.log('❌ Test 1: Database connection failed', error.message);
    failedTests++;
    return;
  }
  
  // Test 2: Check Suppliers Exist
  totalTests++;
  try {
    const suppliers = await prisma.suppliers.findMany();
    if (suppliers.length > 0) {
      console.log(`✅ Test 2: Found ${suppliers.length} supplier(s) in database`);
      passedTests++;
      
      suppliers.forEach((s, idx) => {
        console.log(`   ${idx + 1}. ${s.businessName} (${s.status})`);
      });
    } else {
      console.log('⚠️  Test 2: No suppliers found in database');
      console.log('   Action: Create a supplier through registration or seed data');
    }
  } catch (error) {
    console.log('❌ Test 2: Failed to query suppliers', error.message);
    failedTests++;
  }
  
  // Test 3: Check Monthly Fee Configuration
  totalTests++;
  try {
    const supplier = await prisma.suppliers.findFirst({
      where: { status: 'APPROVED' },
    });
    
    if (supplier) {
      const fee = Number(supplier.monthlyFee || 0);
      if (fee === 25000) {
        console.log('✅ Test 3: Monthly fee correctly set to Rp 25,000');
        passedTests++;
      } else {
        console.log(`⚠️  Test 3: Monthly fee is Rp ${fee.toLocaleString('id-ID')} (expected: Rp 25,000)`);
      }
    } else {
      console.log('⚠️  Test 3: No approved supplier found to check fee');
    }
  } catch (error) {
    console.log('❌ Test 3: Failed to check monthly fee', error.message);
    failedTests++;
  }
  
  // Test 4: Check Supplier Products
  totalTests++;
  try {
    const products = await prisma.products.findMany({
      where: { ownershipType: 'SUPPLIER' },
      include: {
        suppliers: {
          select: { businessName: true }
        }
      }
    });
    
    if (products.length > 0) {
      console.log(`✅ Test 4: Found ${products.length} supplier product(s)`);
      passedTests++;
      
      products.slice(0, 3).forEach((p, idx) => {
        const profitShare = Number(p.profitShareRate || 90);
        console.log(`   ${idx + 1}. ${p.name} - ${p.suppliers?.businessName || 'N/A'}`);
        console.log(`      Sell Price: Rp ${Number(p.sellPrice).toLocaleString('id-ID')}`);
        console.log(`      Profit Split: ${profitShare}% supplier, ${100 - profitShare}% koperasi`);
        console.log(`      Stock: ${p.stock} ${p.unit}`);
      });
    } else {
      console.log('⚠️  Test 4: No supplier products found');
      console.log('   Action: Submit a product through supplier portal or admin approval');
    }
  } catch (error) {
    console.log('❌ Test 4: Failed to check products', error.message);
    failedTests++;
  }
  
  // Test 5: Check Stock Movements Table
  totalTests++;
  try {
    const movements = await prisma.stock_movements.findMany({
      where: { movementType: 'ADJUSTMENT' },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });
    
    if (movements.length > 0) {
      console.log(`✅ Test 5: Found ${movements.length} stock adjustment record(s)`);
      passedTests++;
      
      movements.forEach((m, idx) => {
        console.log(`   ${idx + 1}. ${m.note || 'No note'}`);
        console.log(`      Quantity: ${m.quantity}, Balance After: ${m.balanceAfter}`);
        console.log(`      Date: ${m.createdAt.toLocaleString('id-ID')}`);
      });
    } else {
      console.log('ℹ️  Test 5: No stock adjustments yet (this is normal for fresh install)');
    }
  } catch (error) {
    console.log('❌ Test 5: Failed to check stock movements', error.message);
    failedTests++;
  }
  
  // Test 6: Check Stock Requests Table
  totalTests++;
  try {
    const requests = await prisma.stock_requests.findMany({
      orderBy: { requestedAt: 'desc' },
      take: 3,
    });
    
    if (requests.length > 0) {
      console.log(`✅ Test 6: Found ${requests.length} stock request(s)`);
      passedTests++;
      
      requests.forEach((r, idx) => {
        console.log(`   ${idx + 1}. Qty: ${r.qtyRequested}, Status: ${r.status}`);
        console.log(`      Reason: ${r.reason || 'N/A'}`);
      });
    } else {
      console.log('ℹ️  Test 6: No stock requests yet (normal for fresh install)');
    }
  } catch (error) {
    console.log('❌ Test 6: Failed to check stock requests', error.message);
    failedTests++;
  }
  
  // Test 7: Check Consignment Sales
  totalTests++;
  try {
    const sales = await prisma.consignment_sales.findMany({
      where: { supplierId: { not: null } },
      orderBy: { saleDate: 'desc' },
      take: 3,
    });
    
    if (sales.length > 0) {
      console.log(`✅ Test 7: Found ${sales.length} supplier sale(s)`);
      passedTests++;
      
      sales.forEach((s, idx) => {
        const revenue = Number(s.totalRevenue);
        const fee = Number(s.feeAmount);
        const net = Number(s.netToConsignor);
        console.log(`   ${idx + 1}. Total: Rp ${revenue.toLocaleString('id-ID')}`);
        console.log(`      Koperasi Share: Rp ${fee.toLocaleString('id-ID')}`);
        console.log(`      Supplier Share: Rp ${net.toLocaleString('id-ID')}`);
      });
    } else {
      console.log('ℹ️  Test 7: No supplier sales yet');
      console.log('   Action: Make a POS transaction with supplier products');
    }
  } catch (error) {
    console.log('❌ Test 7: Failed to check consignment sales', error.message);
    failedTests++;
  }
  
  // Test 8: Verify Users Table
  totalTests++;
  try {
    const users = await prisma.users.findMany({
      where: { role: 'SUPPLIER' },
      select: {
        name: true,
        email: true,
        role: true,
      }
    });
    
    if (users.length > 0) {
      console.log(`✅ Test 8: Found ${users.length} supplier user(s)`);
      passedTests++;
      
      users.forEach((u, idx) => {
        console.log(`   ${idx + 1}. ${u.name} (${u.email})`);
      });
    } else {
      console.log('⚠️  Test 8: No supplier users found');
      console.log('   Action: Create supplier user account');
    }
  } catch (error) {
    console.log('❌ Test 8: Failed to check users', error.message);
    failedTests++;
  }
  
  // Summary
  console.log('\n📊 === TEST SUMMARY === \n');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`⚠️  Warnings: ${totalTests - passedTests - failedTests}`);
  
  const percentage = Math.round((passedTests / totalTests) * 100);
  console.log(`\nSuccess Rate: ${percentage}%`);
  
  if (failedTests === 0) {
    console.log('\n🎉 All critical tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed. Check errors above.');
  }
  
  console.log('\n📝 === NEXT STEPS === \n');
  console.log('1. Open browser: http://localhost:3000');
  console.log('2. Login as admin to create test supplier');
  console.log('3. Or login as supplier: supplier@koperasi.com');
  console.log('4. Test manual stock adjustment: /koperasi/super-admin/stock/adjust');
  console.log('5. Test supplier dashboard: /koperasi/supplier/dashboard');
  console.log('6. Make a POS transaction to test profit sharing');
  
  await prisma.$disconnect();
}

runTests().catch(console.error);

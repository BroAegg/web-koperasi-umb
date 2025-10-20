// @ts-nocheck
// SuperAdmin Dashboard Test Script
// Run with: node test-superadmin-dashboard.js

const API_BASE = 'http://localhost:3001';

async function testSuperAdminDashboard() {
  console.log('🚀 Testing SuperAdmin Dashboard...\n');

  // Step 1: Login as SuperAdmin
  console.log('1. Testing SuperAdmin Login...');
  try {
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'superadmin@koperasi.com',
        password: 'Password123!'
      })
    });

    const loginResult = await loginResponse.json();
    console.log('Login response:', loginResponse.status, loginResult);

    if (!loginResponse.ok || !loginResult.success) {
      console.error('❌ SuperAdmin login failed');
      return;
    }

    const token = loginResult.token;
    console.log('✅ SuperAdmin login successful\n');

    // Step 2: Test SuperAdmin Dashboard API
    console.log('2. Testing SuperAdmin Dashboard API...');
    const dashboardResponse = await fetch(`${API_BASE}/api/super-admin/dashboard`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    const dashboardResult = await dashboardResponse.json();
    console.log('Dashboard API response:', dashboardResponse.status);

    if (!dashboardResponse.ok) {
      console.error('❌ SuperAdmin dashboard API failed:', dashboardResult);
      return;
    }

    console.log('✅ SuperAdmin dashboard API successful');
    console.log('Dashboard data structure:', {
      suppliers: dashboardResult.data?.suppliers || 'Missing',
      members: dashboardResult.data?.members || 'Missing',
      products: dashboardResult.data?.products || 'Missing',
      financial: dashboardResult.data?.financial || 'Missing',
      recentActivities: dashboardResult.data?.recentActivities ? 'Present' : 'Missing'
    });

    // Step 3: Test specific data points
    console.log('\n3. Testing specific data...');
    const data = dashboardResult.data;
    
    console.log('📊 SuperAdmin Dashboard Stats:');
    console.log(`   Total Suppliers: ${data.suppliers?.total || 0}`);
    console.log(`   Pending Suppliers: ${data.suppliers?.pending || 0}`);
    console.log(`   Active Suppliers: ${data.suppliers?.active || 0}`);
    console.log(`   Total Members: ${data.members?.total || 0}`);
    console.log(`   Total Products: ${data.products?.total || 0}`);
    console.log(`   Monthly Revenue: Rp ${(data.financial?.monthlyRevenue || 0).toLocaleString('id-ID')}`);

    console.log('\n🎉 SuperAdmin Dashboard Test PASSED! ✅');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Check if we can run fetch (Node.js 18+ or with node-fetch)
if (typeof fetch === 'undefined') {
  console.log('❌ This script requires Node.js 18+ or install node-fetch');
  console.log('Run: npm install node-fetch@2');
  process.exit(1);
}

// Run the test
testSuperAdminDashboard()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });
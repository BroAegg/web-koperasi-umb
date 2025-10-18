const fetch = require('node-fetch');

const API_URL = 'http://localhost:3000';

async function testLogin() {
  console.log('🧪 Testing Login API\n');
  
  // Test 1: Super Admin Login
  console.log('Test 1: Super Admin Login');
  console.log('Email: superadmin@koperasi.com');
  try {
    const res1 = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'superadmin@koperasi.com',
        password: 'Password123!'
      })
    });
    const data1 = await res1.json();
    console.log('Response:', data1.success ? '✅ SUCCESS' : '❌ FAILED');
    if (data1.success) {
      console.log('Role:', data1.data.user.role);
      console.log('Token:', data1.data.token.substring(0, 20) + '...');
      
      // Test /api/auth/me
      console.log('\nTesting /api/auth/me with token...');
      const meRes = await fetch(`${API_URL}/api/auth/me`, {
        headers: { 
          'Authorization': `Bearer ${data1.data.token}`
        }
      });
      const meData = await meRes.json();
      console.log('Me Response:', meData.success ? '✅ SUCCESS' : '❌ FAILED');
      if (meData.success) {
        console.log('User:', meData.data);
      }
      
      // Test dashboard API
      console.log('\nTesting /api/dashboard...');
      const dashRes = await fetch(`${API_URL}/api/dashboard`);
      const dashData = await dashRes.json();
      console.log('Dashboard Response:', dashData.success ? '✅ SUCCESS' : '❌ FAILED');
      if (dashData.success) {
        console.log('Dashboard Stats:');
        console.log('  - Total Members:', dashData.data.totalMembers);
        console.log('  - Total Products:', dashData.data.totalProducts);
        console.log('  - Low Stock Products:', dashData.data.lowStockProducts);
      }
    } else {
      console.log('Error:', data1.error);
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: Supplier Login
  console.log('Test 2: Supplier Login');
  console.log('Email: supplier@test.com');
  try {
    const res2 = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'supplier@test.com',
        password: 'Password123!'
      })
    });
    const data2 = await res2.json();
    console.log('Response:', data2.success ? '✅ SUCCESS' : '❌ FAILED');
    if (data2.success) {
      console.log('Role:', data2.data.user.role);
      console.log('Status:', data2.data.user.status);
      console.log('Token:', data2.data.token.substring(0, 20) + '...');
    } else {
      console.log('Error:', data2.error);
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 3: Admin Login
  console.log('Test 3: Admin Login');
  console.log('Email: admin@koperasi.com');
  try {
    const res3 = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@koperasi.com',
        password: 'Password123!'
      })
    });
    const data3 = await res3.json();
    console.log('Response:', data3.success ? '✅ SUCCESS' : '❌ FAILED');
    if (data3.success) {
      console.log('Role:', data3.data.user.role);
      console.log('Token:', data3.data.token.substring(0, 20) + '...');
    } else {
      console.log('Error:', data3.error);
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
  }
}

// Run test
testLogin().catch(console.error);

const fetch = require('node-fetch');

const API_URL = 'http://localhost:3000';

async function testDashboards() {
  console.log('🧪 Testing Dashboard APIs\n');
  
  // Test 1: Login as Super Admin
  console.log('1. Testing Super Admin Login...');
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
    
    if (!data1.success) {
      console.log('❌ Login failed:', data1.error);
      return;
    }
    
    console.log('✅ Login success');
    const token = data1.data.token;
    
    // Test super admin dashboard API
    console.log('\n2. Testing Super Admin Dashboard API...');
    const dashRes = await fetch(`${API_URL}/api/super-admin/dashboard`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const dashData = await dashRes.json();
    
    console.log('Status:', dashRes.status);
    console.log('Response:', JSON.stringify(dashData, null, 2));
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Test 2: Login as Supplier
  console.log('3. Testing Supplier Login...');
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
    
    if (!data2.success) {
      console.log('❌ Login failed:', data2.error);
      return;
    }
    
    console.log('✅ Login success');
    console.log('User:', data2.data.user);
    const token2 = data2.data.token;
    
    // Test supplier dashboard API
    console.log('\n4. Testing Supplier Dashboard API...');
    const suppDashRes = await fetch(`${API_URL}/api/supplier/dashboard`, {
      headers: { 'Authorization': `Bearer ${token2}` }
    });
    const suppDashData = await suppDashRes.json();
    
    console.log('Status:', suppDashRes.status);
    console.log('Response:', JSON.stringify(suppDashData, null, 2));
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

// Wait for server to be ready
setTimeout(() => {
  testDashboards().catch(console.error);
}, 2000);

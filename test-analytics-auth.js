const fetch = require('node-fetch');

async function testAnalyticsAuth() {
  console.log('🔐 TESTING ANALYTICS AUTHENTICATION\n');
  console.log('============================================================\n');

  // Step 1: Login as Super Admin
  console.log('📝 Step 1: Logging in as Super Admin...');
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'superadmin@koperasi.com',
      password: 'admin123'
    })
  });

  const loginData = await loginRes.json();
  
  if (!loginData.success) {
    console.log('❌ Login failed:', loginData.error);
    return;
  }

  const token = loginData.data.token;
  console.log('✅ Login successful!');
  console.log('   Token:', token.substring(0, 50) + '...\n');

  // Step 2: Test /api/auth/me (should work)
  console.log('📝 Step 2: Testing /api/auth/me...');
  const meRes = await fetch('http://localhost:3000/api/auth/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const meData = await meRes.json();
  
  if (meData.success) {
    console.log('✅ /api/auth/me:', meData.data.email, meData.data.role);
  } else {
    console.log('❌ /api/auth/me failed:', meData.error);
  }
  console.log('');

  // Step 3: Test Analytics APIs
  const analyticsAPIs = [
    { name: 'Best Sellers', url: '/api/analytics/best-sellers?period=7days&limit=5' },
    { name: 'Sales Trends', url: '/api/analytics/sales-trends?days=30' },
    { name: 'Peak Hours', url: '/api/analytics/peak-hours?days=30' },
    { name: 'Customers', url: '/api/analytics/customers?period=30days&limit=10' }
  ];

  console.log('📝 Step 3: Testing Analytics APIs...\n');
  
  for (const api of analyticsAPIs) {
    console.log(`Testing ${api.name}...`);
    const res = await fetch(`http://localhost:3000${api.url}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await res.json();
    
    if (res.status === 200 && data.success) {
      console.log(`✅ ${api.name}: SUCCESS`);
      console.log(`   Status: ${res.status} | Data present: ${!!data.data}`);
    } else {
      console.log(`❌ ${api.name}: FAILED`);
      console.log(`   Status: ${res.status} | Error: ${data.error || 'Unknown'}`);
    }
    console.log('');
  }

  console.log('============================================================');
  console.log('✅ Analytics Authentication Test Complete!\n');
  console.log('📌 Check terminal logs for detailed debug output from APIs');
}

testAnalyticsAuth().catch(console.error);

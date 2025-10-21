// Direct SuperAdmin API test via curl command
// Test SuperAdmin dashboard endpoint

console.log('Testing SuperAdmin Dashboard API...');

// First, let's test the auth endpoint to get a token
const testAuthAndDashboard = async () => {
  console.log('1. Testing SuperAdmin login...');
  
  try {
    const loginRes = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'superadmin@koperasi.com',
        password: 'Password123!'
      })
    });
    
    const loginData = await loginRes.json();
    console.log('Login result:', loginData);
    
    if (!loginData.success) {
      console.error('❌ Login failed');
      return;
    }
    
    console.log('✅ Login successful');
    const token = loginData.token;
    
    console.log('2. Testing SuperAdmin dashboard API...');
    const dashRes = await fetch('/api/super-admin/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const dashData = await dashRes.json();
    console.log('Dashboard API status:', dashRes.status);
    console.log('Dashboard data:', dashData);
    
    if (dashRes.ok && dashData.success) {
      console.log('✅ SuperAdmin Dashboard API working!');
      console.log('Data structure:', Object.keys(dashData.data || {}));
      return dashData;
    } else {
      console.error('❌ Dashboard API failed:', dashData.error);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
};

// Auto-run the test
testAuthAndDashboard();
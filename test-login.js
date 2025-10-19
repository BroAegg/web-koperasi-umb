// Test login API
async function testLogin() {
  console.log('🔐 Testing login API...\n');
  
  const testCases = [
    { email: 'admin@umb.ac.id', password: 'Password123!', label: 'Admin' },
    { email: 'superadmin@umb.ac.id', password: 'Password123!', label: 'Super Admin' }
  ];
  
  for (const test of testCases) {
    console.log(`\n📝 Testing ${test.label} login...`);
    console.log(`   Email: ${test.email}`);
    
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: test.email,
          password: test.password
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log(`   ✅ SUCCESS - ${test.label} login worked!`);
        console.log(`   User: ${data.data.user.name}`);
        console.log(`   Role: ${data.data.user.role}`);
      } else {
        console.log(`   ❌ FAILED - ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`   ❌ ERROR - ${error.message}`);
    }
  }
  
  console.log('\n✅ Login test complete!');
}

testLogin();

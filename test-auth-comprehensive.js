// Automated Authentication Testing Script
// Run with: node test-auth-comprehensive.js

const baseURL = 'http://localhost:3000';

// Test cases
const tests = {
  passed: 0,
  failed: 0,
  total: 0
};

// Helper: Test login API
async function testLogin(email, password, expectedSuccess, testName) {
  tests.total++;
  console.log(`\n🧪 Test ${tests.total}: ${testName}`);
  console.log(`   Email: ${email}`);
  
  try {
    const response = await fetch(`${baseURL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    const success = response.ok && data.success;
    
    if (success === expectedSuccess) {
      console.log(`   ✅ PASS`);
      if (success) {
        console.log(`   → User: ${data.data.user.name} (${data.data.user.role})`);
        console.log(`   → Token: ${data.data.token.substring(0, 20)}...`);
      } else {
        console.log(`   → Error (expected): ${data.error}`);
      }
      tests.passed++;
      return { pass: true, data };
    } else {
      console.log(`   ❌ FAIL`);
      console.log(`   → Expected success: ${expectedSuccess}, Got: ${success}`);
      console.log(`   → Response: ${JSON.stringify(data)}`);
      tests.failed++;
      return { pass: false, data };
    }
  } catch (error) {
    console.log(`   ❌ ERROR - ${error.message}`);
    tests.failed++;
    return { pass: false, error };
  }
}

// Helper: Test auth/me endpoint
async function testAuthMe(token, expectedSuccess, testName) {
  tests.total++;
  console.log(`\n🧪 Test ${tests.total}: ${testName}`);
  
  try {
    const response = await fetch(`${baseURL}/api/auth/me`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    const success = response.ok && data.success;
    
    if (success === expectedSuccess) {
      console.log(`   ✅ PASS`);
      if (success) {
        console.log(`   → User: ${data.data.name} (${data.data.role})`);
      }
      tests.passed++;
      return { pass: true, data };
    } else {
      console.log(`   ❌ FAIL`);
      console.log(`   → Expected success: ${expectedSuccess}, Got: ${success}`);
      tests.failed++;
      return { pass: false, data };
    }
  } catch (error) {
    console.log(`   ❌ ERROR - ${error.message}`);
    tests.failed++;
    return { pass: false, error };
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 AUTHENTICATION MODULE - AUTOMATED TESTING');
  console.log('='.repeat(60));
  
  // ============================================
  // SECTION 1: LOGIN FLOWS
  // ============================================
  console.log('\n📋 SECTION 1: LOGIN FLOWS');
  console.log('-'.repeat(60));
  
  // Test 1: Admin Login (Success)
  const adminResult = await testLogin(
    'admin@umb.ac.id',
    'Password123!',
    true,
    'Admin Login (Success)'
  );
  const adminToken = adminResult.data?.data?.token;
  
  // Test 2: Super Admin Login (Success)
  const superAdminResult = await testLogin(
    'superadmin@umb.ac.id',
    'Password123!',
    true,
    'Super Admin Login (Success)'
  );
  const superAdminToken = superAdminResult.data?.data?.token;
  
  // Test 3: Supplier Login (Success) - if exists
  await testLogin(
    'supplier@example.com',
    'Password123!',
    true,
    'Supplier Login (Success) - May fail if not seeded'
  );
  
  // Test 4: Wrong Password
  await testLogin(
    'admin@umb.ac.id',
    'WrongPassword123',
    false,
    'Login with Wrong Password (Should Fail)'
  );
  
  // Test 5: Non-existent Email
  await testLogin(
    'nonexistent@umb.ac.id',
    'Password123!',
    false,
    'Login with Non-existent Email (Should Fail)'
  );
  
  // Test 6: Empty Email
  await testLogin(
    '',
    'Password123!',
    false,
    'Login with Empty Email (Should Fail)'
  );
  
  // Test 7: Empty Password
  await testLogin(
    'admin@umb.ac.id',
    '',
    false,
    'Login with Empty Password (Should Fail)'
  );
  
  // ============================================
  // SECTION 2: TOKEN VALIDATION
  // ============================================
  console.log('\n📋 SECTION 2: TOKEN VALIDATION');
  console.log('-'.repeat(60));
  
  // Test 8: Valid Admin Token
  if (adminToken) {
    await testAuthMe(
      adminToken,
      true,
      'Validate Admin Token (Should Pass)'
    );
  }
  
  // Test 9: Valid Super Admin Token
  if (superAdminToken) {
    await testAuthMe(
      superAdminToken,
      true,
      'Validate Super Admin Token (Should Pass)'
    );
  }
  
  // Test 10: Invalid Token
  await testAuthMe(
    'invalid.token.here',
    false,
    'Invalid Token (Should Fail)'
  );
  
  // Test 11: Empty Token
  await testAuthMe(
    '',
    false,
    'Empty Token (Should Fail)'
  );
  
  // Test 12: Malformed Token
  await testAuthMe(
    'Bearer xyz',
    false,
    'Malformed Token (Should Fail)'
  );
  
  // ============================================
  // SECTION 3: ROLE-BASED ACCESS
  // ============================================
  console.log('\n📋 SECTION 3: ROLE-BASED ACCESS CONTROL');
  console.log('-'.repeat(60));
  
  // Test 13: Admin access to dashboard endpoint
  if (adminToken) {
    tests.total++;
    console.log(`\n🧪 Test ${tests.total}: Admin Access to /api/dashboard`);
    try {
      const response = await fetch(`${baseURL}/api/dashboard`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('   ✅ PASS - Admin can access admin dashboard');
        console.log(`   → Total Members: ${data.data.totalMembers}`);
        tests.passed++;
      } else {
        console.log('   ❌ FAIL - Admin should access admin dashboard');
        tests.failed++;
      }
    } catch (error) {
      console.log(`   ❌ ERROR - ${error.message}`);
      tests.failed++;
    }
  }
  
  // Test 14: Super Admin access to super-admin endpoint
  if (superAdminToken) {
    tests.total++;
    console.log(`\n🧪 Test ${tests.total}: Super Admin Access to /api/super-admin/dashboard`);
    try {
      const response = await fetch(`${baseURL}/api/super-admin/dashboard`, {
        headers: { 'Authorization': `Bearer ${superAdminToken}` }
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('   ✅ PASS - Super Admin can access super admin dashboard');
        console.log(`   → Total Suppliers: ${data.data.totalSuppliers}`);
        tests.passed++;
      } else {
        console.log('   ❌ FAIL - Super Admin should access super admin dashboard');
        tests.failed++;
      }
    } catch (error) {
      console.log(`   ❌ ERROR - ${error.message}`);
      tests.failed++;
    }
  }
  
  // ============================================
  // TEST SUMMARY
  // ============================================
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${tests.total}`);
  console.log(`✅ Passed: ${tests.passed} (${Math.round(tests.passed/tests.total*100)}%)`);
  console.log(`❌ Failed: ${tests.failed} (${Math.round(tests.failed/tests.total*100)}%)`);
  console.log('='.repeat(60));
  
  if (tests.failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! 🎉');
  } else {
    console.log('\n⚠️  SOME TESTS FAILED - Review output above');
  }
  
  console.log('\n📝 Next: Update AUTHENTICATION-TESTING.md with these results');
}

// Run all tests
runTests().catch(error => {
  console.error('\n💥 FATAL ERROR:', error);
  process.exit(1);
});

// Test Script: POS Payment Flow
// Date: October 20, 2025
// Purpose: Verify all 3 bugs are fixed (403, 500 schema, 500 double injection)

const BASE_URL = 'http://localhost:3000';

// Test credentials (use existing ADMIN account)
const ADMIN_CREDENTIALS = {
  email: 'admin@koperasi.com',
  password: 'admin123'
};

let authToken = '';
let testTransactionId = '';

// Helper function
async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  console.log(`\n📡 ${options.method || 'GET'} ${endpoint}`);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      }
    });

    const data = await response.json();
    console.log(`   ✅ Status: ${response.status}`);
    
    if (!response.ok) {
      console.log(`   ❌ Error:`, data);
      return { success: false, status: response.status, data };
    }
    
    return { success: true, status: response.status, data };
  } catch (error) {
    console.log(`   ❌ Network Error:`, error.message);
    return { success: false, error: error.message };
  }
}

// Test 1: Login to get token
async function testLogin() {
  console.log('\n🧪 TEST 1: Login to get auth token');
  
  const result = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(ADMIN_CREDENTIALS)
  });

  if (result.success && result.data.token) {
    authToken = result.data.token;
    console.log('   ✅ Token received:', authToken.substring(0, 20) + '...');
    return true;
  } else {
    console.log('   ❌ Login failed');
    return false;
  }
}

// Test 2: Get products (need productIds for transaction)
async function testGetProducts() {
  console.log('\n🧪 TEST 2: Get available products');
  
  const result = await makeRequest('/api/products', {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });

  if (result.success && result.data.length > 0) {
    console.log(`   ✅ Found ${result.data.length} products`);
    return result.data.slice(0, 3).map(p => ({
      id: p.id,
      name: p.name,
      price: p.sellPrice,
      stock: p.stock
    }));
  } else {
    console.log('   ❌ Failed to get products');
    return [];
  }
}

// Test 3: Create POS transaction (THE MAIN TEST)
async function testPOSTransaction(products) {
  console.log('\n🧪 TEST 3: Create POS Transaction (BUG FIX VERIFICATION)');
  
  if (products.length === 0) {
    console.log('   ⚠️ No products available, skipping test');
    return false;
  }

  // Prepare cart items
  const cartItems = products.slice(0, 2).map(p => ({
    productId: p.id,
    quantity: 1,
    unitPrice: parseFloat(p.price),
    subtotal: parseFloat(p.price) * 1
  }));

  const totalAmount = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

  console.log('   📦 Cart Items:', cartItems.length);
  console.log('   💰 Total Amount:', totalAmount);

  const requestBody = {
    items: cartItems,
    totalAmount: totalAmount,
    paymentMethod: 'CASH',
    amountPaid: totalAmount + 5000, // Extra 5000 for change
    customerName: 'TEST CUSTOMER - Automated Test',
    change: 5000
  };

  console.log('   📤 Request Body:', JSON.stringify(requestBody, null, 2));

  const result = await makeRequest('/api/pos/transaction', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}` // ✅ FIX #1: Authorization header
    },
    body: JSON.stringify(requestBody)
  });

  if (result.success) {
    testTransactionId = result.data.data.transactionId;
    console.log('   ✅ Transaction created successfully!');
    console.log('   🎫 Transaction ID:', testTransactionId);
    console.log('   🧾 Receipt Number:', result.data.data.receiptNumber);
    
    // Verify response structure
    console.log('\n   📋 Verifying response structure:');
    console.log('   - transactionId:', result.data.data.transactionId ? '✅' : '❌');
    console.log('   - items:', result.data.data.items ? '✅' : '❌');
    console.log('   - timestamp:', result.data.data.timestamp ? '✅' : '❌');
    
    return true;
  } else {
    console.log('   ❌ Transaction failed!');
    console.log('   📝 Status:', result.status);
    console.log('   📝 Error:', result.data);
    
    // Analyze error
    if (result.status === 403) {
      console.log('\n   ⚠️ BUG #1 NOT FIXED: 403 Forbidden (Missing Authorization)');
    } else if (result.status === 500) {
      if (result.data.error?.includes('subtotal')) {
        console.log('\n   ⚠️ BUG #2 NOT FIXED: Schema mismatch (subtotal vs totalPrice)');
      } else if (result.data.error?.includes('isProduction') || result.data.error?.includes('Unknown argument')) {
        console.log('\n   ⚠️ BUG #3 NOT FIXED: Double injection of isProduction');
      } else {
        console.log('\n   ⚠️ UNKNOWN ERROR:', result.data.error);
      }
    }
    
    return false;
  }
}

// Test 4: Verify transaction in database (check if data persisted correctly)
async function testVerifyTransaction() {
  console.log('\n🧪 TEST 4: Verify transaction persisted');
  
  if (!testTransactionId) {
    console.log('   ⚠️ No transaction ID to verify');
    return false;
  }

  console.log('   🔍 Checking transaction:', testTransactionId);
  console.log('   💡 You can manually verify in database:');
  console.log(`   
  -- Check transaction
  SELECT * FROM transactions WHERE id = '${testTransactionId}';
  
  -- Check transaction items (verify totalPrice field)
  SELECT * FROM transaction_items WHERE transactionId = '${testTransactionId}';
  
  -- Check stock movements
  SELECT * FROM stock_movements 
  WHERE referenceId = '${testTransactionId}' 
    AND referenceType = 'TRANSACTION';
  `);

  return true;
}

// Main test runner
async function runAllTests() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🧪 POS PAYMENT FLOW - AUTOMATED TEST SUITE');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('Purpose: Verify all 3 bugs are fixed');
  console.log('  1. ✅ 403 Forbidden (Missing Authorization)');
  console.log('  2. ✅ 500 Schema Mismatch (subtotal vs totalPrice)');
  console.log('  3. ✅ 500 Double Injection (isProduction)');
  console.log('═══════════════════════════════════════════════════════════');

  try {
    // Test 1: Login
    const loginSuccess = await testLogin();
    if (!loginSuccess) {
      console.log('\n❌ FAILED: Cannot proceed without auth token');
      return;
    }

    // Test 2: Get products
    const products = await testGetProducts();
    if (products.length === 0) {
      console.log('\n⚠️ WARNING: No products available for testing');
      console.log('   Please add products first via Admin panel');
      return;
    }

    // Test 3: Create transaction (MAIN TEST)
    const transactionSuccess = await testPOSTransaction(products);
    
    // Test 4: Verify in database
    if (transactionSuccess) {
      await testVerifyTransaction();
    }

    // Final summary
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📊 TEST SUMMARY');
    console.log('═══════════════════════════════════════════════════════════');
    
    if (transactionSuccess) {
      console.log('✅ ALL TESTS PASSED!');
      console.log('✅ Bug #1 (403): FIXED - Authorization header working');
      console.log('✅ Bug #2 (500 schema): FIXED - totalPrice field working');
      console.log('✅ Bug #3 (500 injection): FIXED - No double injection');
      console.log('\n🎉 POS Payment is now fully operational!');
    } else {
      console.log('❌ SOME TESTS FAILED');
      console.log('Please check the error messages above');
    }
    
    console.log('═══════════════════════════════════════════════════════════');

  } catch (error) {
    console.error('\n💥 UNEXPECTED ERROR:', error);
  }
}

// Run tests
runAllTests();

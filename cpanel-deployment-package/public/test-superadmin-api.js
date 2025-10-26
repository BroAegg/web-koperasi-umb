// Simple test for SuperAdmin dashboard - works with existing login session
// This checks the data structure returned by the API

fetch('/api/super-admin/dashboard', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
  }
})
.then(response => response.json())
.then(data => {
  console.log('🚀 SuperAdmin Dashboard API Response:');
  console.log('Status:', data.success ? '✅ SUCCESS' : '❌ FAILED');
  
  if (data.success) {
    console.log('\n📊 Data Structure:');
    console.log('Suppliers:', data.data.suppliers);
    console.log('Members:', data.data.members);
    console.log('Products:', data.data.products);
    console.log('Financial:', data.data.financial);
    console.log('Recent Activities:', data.data.recentActivities);
    
    console.log('\n📈 Key Metrics:');
    console.log(`Total Suppliers: ${data.data.suppliers.total}`);
    console.log(`Pending Suppliers: ${data.data.suppliers.pending}`);
    console.log(`Total Members: ${data.data.members.total}`);
    console.log(`Total Products: ${data.data.products.total}`);
    console.log(`Monthly Revenue: Rp ${(data.data.financial.monthlyRevenue || 0).toLocaleString('id-ID')}`);
  } else {
    console.error('❌ API Error:', data.error);
  }
})
.catch(error => {
  console.error('❌ Network Error:', error);
});

console.log('📡 SuperAdmin Dashboard API test initiated...');
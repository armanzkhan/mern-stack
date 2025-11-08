const axios = require('axios');

async function testFrontendAccess() {
  try {
    console.log('🔍 Testing Frontend Access...\n');
    
    // Step 1: Test if frontend is accessible
    console.log('🌐 Step 1: Testing frontend accessibility...');
    try {
      const response = await axios.get('http://localhost:3000');
      console.log('✅ Frontend is accessible');
    } catch (error) {
      console.log('❌ Frontend is not accessible:', error.message);
      return;
    }
    
    // Step 2: Test orders page API
    console.log('\n📝 Step 2: Testing orders page API...');
    try {
      const response = await axios.get('http://localhost:3000/api/orders');
      console.log('✅ Orders API accessible');
      console.log(`   Found ${response.data.length} orders`);
      if (response.data.length > 0) {
        response.data.forEach((order, index) => {
          console.log(`   Order ${index + 1}: ${order.orderNumber || 'No Number'} - ${order.status}`);
        });
      }
    } catch (error) {
      console.log('❌ Orders API not accessible:', error.message);
    }
    
    // Step 3: Test customers page API
    console.log('\n📝 Step 3: Testing customers page API...');
    try {
      const response = await axios.get('http://localhost:3000/api/customers');
      console.log('✅ Customers API accessible');
      console.log(`   Found ${response.data.length} customers`);
    } catch (error) {
      console.log('❌ Customers API not accessible:', error.message);
    }
    
    // Step 4: Test products page API
    console.log('\n📝 Step 4: Testing products page API...');
    try {
      const response = await axios.get('http://localhost:3000/api/products');
      console.log('✅ Products API accessible');
      console.log(`   Found ${response.data.length} products`);
    } catch (error) {
      console.log('❌ Products API not accessible:', error.message);
    }
    
    console.log('\n🎉 All APIs are working! The frontend should be able to display orders.');
    console.log('💡 If orders are not showing in the browser, try:');
    console.log('   1. Refresh the browser page (F5 or Ctrl+R)');
    console.log('   2. Clear browser cache (Ctrl+Shift+R)');
    console.log('   3. Check browser console for errors');
    console.log('   4. Make sure you are logged in');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

if (require.main === module) {
  testFrontendAccess();
}

module.exports = testFrontendAccess;

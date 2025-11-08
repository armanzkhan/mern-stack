const axios = require('axios');

async function testFrontendOrderStatus() {
  try {
    console.log('🔍 Testing Frontend Order Status Updates...\n');
    
    // Step 1: Login to get token
    console.log('🔐 Step 1: Login to get token...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'flowtest@example.com',
      password: 'password123'
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data.message);
      return;
    }
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Step 2: Get current orders
    console.log('\n📝 Step 2: Getting current orders...');
    const ordersResponse = await axios.get('http://localhost:5000/api/orders', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const orders = ordersResponse.data;
    console.log(`✅ Found ${orders.length} orders`);
    
    if (orders.length === 0) {
      console.log('❌ No orders found to test');
      return;
    }
    
    // Step 3: Test different status updates
    console.log('\n📝 Step 3: Testing different status updates...');
    const testOrder = orders[0];
    console.log(`   Testing with order: ${testOrder.orderNumber} (current status: ${testOrder.status})`);
    
    const statusTests = [
      { status: 'approved', description: 'Approve order' },
      { status: 'confirmed', description: 'Confirm order' },
      { status: 'shipped', description: 'Ship order' },
      { status: 'completed', description: 'Complete order' }
    ];
    
    for (const test of statusTests) {
      try {
        console.log(`\n   🔄 Testing: ${test.description}...`);
        
        // Test via frontend API proxy
        const frontendResponse = await axios.put(`http://localhost:3000/api/orders/${testOrder._id}`, {
          status: test.status
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`   ✅ ${test.description} successful`);
        console.log(`   Status changed to: ${frontendResponse.data.status}`);
        
        // Verify the change
        const verifyResponse = await axios.get(`http://localhost:3000/api/orders`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const updatedOrder = verifyResponse.data.find(o => o._id === testOrder._id);
        if (updatedOrder && updatedOrder.status === test.status) {
          console.log(`   ✅ Status verified: ${updatedOrder.status}`);
        } else {
          console.log(`   ❌ Status verification failed: expected ${test.status}, got ${updatedOrder?.status}`);
        }
        
      } catch (error) {
        console.log(`   ❌ ${test.description} failed:`, error.message);
        if (error.response) {
          console.log(`      Status: ${error.response.status}`);
          console.log(`      Data: ${error.response.data}`);
        }
      }
    }
    
    // Step 4: Test notes update
    console.log('\n📝 Step 4: Testing notes update...');
    try {
      const notesResponse = await axios.put(`http://localhost:3000/api/orders/${testOrder._id}`, {
        notes: 'Updated via frontend API - ' + new Date().toISOString()
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Notes update successful');
      console.log('   Notes:', notesResponse.data.notes);
    } catch (error) {
      console.log('❌ Notes update failed:', error.message);
    }
    
    console.log('\n🎉 Frontend order status update test completed!');
    console.log('💡 The order status changes should now work in the frontend UI');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    }
  }
}

if (require.main === module) {
  testFrontendOrderStatus();
}

module.exports = testFrontendOrderStatus;

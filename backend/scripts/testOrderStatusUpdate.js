const axios = require('axios');

async function testOrderStatusUpdate() {
  try {
    console.log('🔍 Testing Order Status Update...\n');
    
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
    
    // Step 3: Test status update via backend directly
    console.log('\n📝 Step 3: Testing status update via backend...');
    const testOrder = orders[0];
    console.log(`   Testing with order: ${testOrder.orderNumber} (current status: ${testOrder.status})`);
    
    try {
      const updateResponse = await axios.put(`http://localhost:5000/api/orders/${testOrder._id}`, {
        status: 'approved'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Backend status update successful');
      console.log('   Response status:', updateResponse.status);
      console.log('   Updated order:', updateResponse.data);
    } catch (error) {
      console.log('❌ Backend status update failed:', error.message);
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Data:', error.response.data);
      }
    }
    
    // Step 4: Test status update via frontend API proxy
    console.log('\n📝 Step 4: Testing status update via frontend API proxy...');
    try {
      const frontendResponse = await axios.put(`http://localhost:3000/api/orders/${testOrder._id}`, {
        status: 'shipped'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Frontend API proxy status update successful');
      console.log('   Response status:', frontendResponse.status);
      console.log('   Updated order:', frontendResponse.data);
    } catch (error) {
      console.log('❌ Frontend API proxy status update failed:', error.message);
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Data:', error.response.data);
      }
    }
    
    // Step 5: Verify the changes
    console.log('\n📝 Step 5: Verifying status changes...');
    const updatedOrdersResponse = await axios.get('http://localhost:5000/api/orders', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const updatedOrders = updatedOrdersResponse.data;
    const updatedOrder = updatedOrders.find(o => o._id === testOrder._id);
    
    if (updatedOrder) {
      console.log(`✅ Order status updated: ${updatedOrder.orderNumber} - ${updatedOrder.status}`);
    } else {
      console.log('❌ Order not found after update');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    }
  }
}

if (require.main === module) {
  testOrderStatusUpdate();
}

module.exports = testOrderStatusUpdate;

const axios = require('axios');

async function testFullOrderFlow() {
  try {
    console.log('🔍 Testing Full Order Flow...\n');
    
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
    
    // Step 2: Get current orders count
    console.log('\n📝 Step 2: Getting current orders...');
    const ordersResponse = await axios.get('http://localhost:5000/api/orders', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const currentOrders = ordersResponse.data;
    console.log(`✅ Found ${currentOrders.length} current orders`);
    
    // Step 3: Get customers for order creation
    console.log('\n📝 Step 3: Getting customers...');
    const customersResponse = await axios.get('http://localhost:5000/api/customers', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const customers = customersResponse.data;
    console.log(`✅ Found ${customers.length} customers`);
    
    if (customers.length === 0) {
      console.log('❌ No customers found, cannot create order');
      return;
    }
    
    // Step 4: Get products for order creation
    console.log('\n📝 Step 4: Getting products...');
    const productsResponse = await axios.get('http://localhost:5000/api/products', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const products = productsResponse.data.products || productsResponse.data;
    console.log(`✅ Found ${products.length} products`);
    
    if (products.length === 0) {
      console.log('❌ No products found, cannot create order');
      return;
    }
    
    // Step 5: Create a new order
    console.log('\n📝 Step 5: Creating new order...');
    const orderData = {
      customer: customers[0]._id,
      items: [{
        product: products[0]._id,
        quantity: 2,
        unitPrice: 100,
        total: 200
      }],
      subtotal: 200,
      tax: 20,
      total: 220,
      notes: 'Test order from script',
      company_id: 'RESSICHEM'
    };
    
    const createResponse = await axios.post('http://localhost:5000/api/orders', orderData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (createResponse.status === 201) {
      console.log('✅ Order created successfully');
      console.log('   Order ID:', createResponse.data._id);
      console.log('   Order Number:', createResponse.data.orderNumber);
    } else {
      console.log('❌ Order creation failed:', createResponse.status, createResponse.data);
      return;
    }
    
    // Step 6: Get orders again to verify
    console.log('\n📝 Step 6: Verifying order was added...');
    const updatedOrdersResponse = await axios.get('http://localhost:5000/api/orders', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const updatedOrders = updatedOrdersResponse.data;
    console.log(`✅ Found ${updatedOrders.length} orders after creation`);
    
    if (updatedOrders.length > currentOrders.length) {
      console.log('🎉 Order was successfully added to the database!');
      console.log('   New order count:', updatedOrders.length);
      console.log('   Previous count:', currentOrders.length);
    } else {
      console.log('❌ Order was not added to the database');
    }
    
    // Step 7: Test frontend API proxy
    console.log('\n📝 Step 7: Testing frontend API proxy...');
    try {
      const frontendResponse = await axios.get('http://localhost:3000/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Frontend API proxy working');
      console.log(`   Frontend shows ${frontendResponse.data.length} orders`);
      
      if (frontendResponse.data.length === updatedOrders.length) {
        console.log('🎉 Frontend and backend are in sync!');
      } else {
        console.log('⚠️ Frontend and backend have different order counts');
        console.log('   Backend:', updatedOrders.length);
        console.log('   Frontend:', frontendResponse.data.length);
      }
    } catch (error) {
      console.log('❌ Frontend API proxy failed:', error.message);
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
  testFullOrderFlow();
}

module.exports = testFullOrderFlow;

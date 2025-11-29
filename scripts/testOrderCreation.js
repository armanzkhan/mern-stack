const axios = require('axios');

async function testOrderCreation() {
  try {
    console.log('🔍 Testing Order Creation Process...\n');
    
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
    console.log('\n📝 Step 2: Getting current orders count...');
    const ordersResponse = await axios.get('http://localhost:5000/api/orders', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const currentCount = ordersResponse.data.length;
    console.log(`✅ Current orders count: ${currentCount}`);
    
    // Step 3: Get customers and products
    console.log('\n📝 Step 3: Getting customers and products...');
    const [customersRes, productsRes] = await Promise.all([
      axios.get('http://localhost:5000/api/customers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }),
      axios.get('http://localhost:5000/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
    ]);
    
    const customers = customersRes.data;
    const products = productsRes.data.products || productsRes.data;
    
    console.log(`✅ Found ${customers.length} customers and ${products.length} products`);
    
    if (customers.length === 0 || products.length === 0) {
      console.log('❌ No customers or products found');
      return;
    }
    
    // Step 4: Create order via backend directly
    console.log('\n📝 Step 4: Creating order via backend directly...');
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
      notes: 'Test order via backend',
      company_id: 'RESSICHEM'
    };
    
    const createResponse = await axios.post('http://localhost:5000/api/orders', orderData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (createResponse.status === 201) {
      console.log('✅ Order created successfully via backend');
      console.log('   Order ID:', createResponse.data._id);
      console.log('   Order Number:', createResponse.data.orderNumber);
    } else {
      console.log('❌ Backend order creation failed:', createResponse.status, createResponse.data);
      return;
    }
    
    // Step 5: Create order via frontend API proxy
    console.log('\n📝 Step 5: Creating order via frontend API proxy...');
    const frontendOrderData = {
      customer: customers[0]._id,
      items: [{
        product: products[0]._id,
        quantity: 3,
        unitPrice: 150,
        total: 450
      }],
      subtotal: 450,
      tax: 45,
      total: 495,
      notes: 'Test order via frontend proxy',
      company_id: 'RESSICHEM'
    };
    
    try {
      const frontendResponse = await axios.post('http://localhost:3000/api/orders', frontendOrderData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Frontend API proxy order creation successful');
      console.log('   Status:', frontendResponse.status);
      console.log('   Order ID:', frontendResponse.data._id);
      console.log('   Order Number:', frontendResponse.data.orderNumber);
    } catch (error) {
      console.log('❌ Frontend API proxy order creation failed:', error.message);
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Data:', error.response.data);
      }
    }
    
    // Step 6: Check final orders count
    console.log('\n📝 Step 6: Checking final orders count...');
    const finalOrdersResponse = await axios.get('http://localhost:5000/api/orders', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const finalCount = finalOrdersResponse.data.length;
    console.log(`✅ Final orders count: ${finalCount}`);
    console.log(`   Previous count: ${currentCount}`);
    console.log(`   New orders added: ${finalCount - currentCount}`);
    
    if (finalCount > currentCount) {
      console.log('🎉 Orders are being saved to the database!');
    } else {
      console.log('❌ Orders are not being saved to the database');
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
  testOrderCreation();
}

module.exports = testOrderCreation;
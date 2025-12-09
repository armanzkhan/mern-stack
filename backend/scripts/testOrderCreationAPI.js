const axios = require('axios');

async function testOrderCreationAPI() {
  try {
    console.log('🔍 Testing Order Creation API...\n');
    
    // Step 1: Login
    console.log('🔐 Step 1: Login...');
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
    
    // Step 2: Get customers
    console.log('\n📝 Step 2: Getting customers...');
    const customersResponse = await axios.get('http://localhost:5000/api/customers', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (customersResponse.data.length === 0) {
      console.log('❌ No customers found');
      return;
    }
    
    const customer = customersResponse.data[0];
    console.log(`✅ Found customer: ${customer.companyName}`);
    
    // Step 3: Get products
    console.log('\n📝 Step 3: Getting products...');
    const productsResponse = await axios.get('http://localhost:5000/api/products', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const products = productsResponse.data.products || productsResponse.data;
    if (!products || products.length === 0) {
      console.log('❌ No products found');
      return;
    }
    
    const product = products[0];
    console.log(`✅ Found product: ${product.name}`);
    
    // Step 4: Create order
    console.log('\n📝 Step 4: Creating order...');
    const orderData = {
      customer: customer._id,
      items: [{
        product: product._id,
        quantity: 2,
        unitPrice: product.price,
        total: product.price * 2
      }],
      subtotal: product.price * 2,
      tax: (product.price * 2) * 0.1,
      total: (product.price * 2) * 1.1,
      notes: 'Test order from API',
      company_id: 'RESSICHEM'
    };
    
    try {
      const createResponse = await axios.post('http://localhost:5000/api/orders', orderData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Order created successfully');
      console.log('   Order ID:', createResponse.data._id);
      console.log('   Order Number:', createResponse.data.orderNumber);
      console.log('   Status:', createResponse.data.status);
      console.log('   Total:', createResponse.data.total);
      
    } catch (error) {
      console.log('❌ Order creation failed:');
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Message:', error.response.data.message);
        console.log('   Error:', error.response.data.error);
      } else {
        console.log('   Error:', error.message);
      }
      return;
    }
    
    // Step 5: Verify order in database
    console.log('\n📝 Step 5: Verifying order in database...');
    const ordersResponse = await axios.get('http://localhost:5000/api/orders', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ Found ${ordersResponse.data.length} orders in database`);
    if (ordersResponse.data.length > 0) {
      ordersResponse.data.forEach((order, index) => {
        console.log(`   Order ${index + 1}: ${order.orderNumber || 'No Number'} - ${order.status} - $${order.total}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

if (require.main === module) {
  testOrderCreationAPI();
}

module.exports = testOrderCreationAPI;

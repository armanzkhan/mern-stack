const axios = require('axios');

async function getRealIDs() {
  try {
    console.log('🔍 Getting Real Customer and Product IDs...\n');
    
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
    
    console.log('✅ Customers:');
    customersResponse.data.forEach((customer, index) => {
      console.log(`   Customer ${index + 1}:`);
      console.log(`     ID: ${customer._id}`);
      console.log(`     Name: ${customer.companyName}`);
      console.log(`     Contact: ${customer.contactName}`);
    });
    
    // Step 3: Get products
    console.log('\n📝 Step 3: Getting products...');
    const productsResponse = await axios.get('http://localhost:5000/api/products', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Products:');
    const products = productsResponse.data.products || productsResponse.data;
    if (Array.isArray(products)) {
      products.forEach((product, index) => {
        console.log(`   Product ${index + 1}:`);
        console.log(`     ID: ${product._id}`);
        console.log(`     Name: ${product.name}`);
        console.log(`     Price: $${product.price}`);
      });
    } else {
      console.log('   Products data:', JSON.stringify(products, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

if (require.main === module) {
  getRealIDs();
}

module.exports = getRealIDs;

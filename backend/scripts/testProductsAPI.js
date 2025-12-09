const axios = require('axios');

async function testProductsAPI() {
  try {
    console.log('🔍 Testing Products API...\n');
    
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
    
    // Step 2: Test products API directly
    console.log('\n📝 Step 2: Testing products API...');
    const productsResponse = await axios.get('http://localhost:5000/api/products', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Products API response status:', productsResponse.status);
    console.log('📋 Products response data:');
    console.log(JSON.stringify(productsResponse.data, null, 2));
    
    if (productsResponse.data.products) {
      console.log(`✅ Found ${productsResponse.data.products.length} products`);
      productsResponse.data.products.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} - $${product.price}`);
      });
    } else {
      console.log('❌ No products array in response');
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
  testProductsAPI();
}

module.exports = testProductsAPI;

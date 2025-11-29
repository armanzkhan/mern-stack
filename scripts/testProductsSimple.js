const axios = require('axios');

async function testProductsSimple() {
  try {
    console.log('🔍 Testing Products Simple...\n');
    
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
    
    // Step 2: Test backend products API directly
    console.log('\n📝 Step 2: Testing backend products API...');
    try {
      const backendResponse = await axios.get('http://localhost:5000/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Backend products API successful');
      console.log('   Response type:', typeof backendResponse.data);
      console.log('   Has products array:', !!backendResponse.data.products);
      console.log('   Products count:', backendResponse.data.products?.length || 0);
      
      if (backendResponse.data.products && backendResponse.data.products.length > 0) {
        console.log('   First product:', backendResponse.data.products[0].name);
        console.log('   First product ID:', backendResponse.data.products[0]._id);
      }
    } catch (error) {
      console.log('❌ Backend products API failed:', error.message);
    }
    
    // Step 3: Test frontend products API
    console.log('\n📝 Step 3: Testing frontend products API...');
    try {
      const frontendResponse = await axios.get('http://localhost:3000/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Frontend products API successful');
      console.log('   Response type:', typeof frontendResponse.data);
      console.log('   Is array:', Array.isArray(frontendResponse.data));
      console.log('   Products count:', frontendResponse.data.length || 0);
      
      if (frontendResponse.data.length > 0) {
        console.log('   First product:', frontendResponse.data[0].name);
        console.log('   First product ID:', frontendResponse.data[0]._id);
      }
    } catch (error) {
      console.log('❌ Frontend products API failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

if (require.main === module) {
  testProductsSimple();
}

module.exports = testProductsSimple;

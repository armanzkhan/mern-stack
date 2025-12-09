// Test the API directly
const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('🔍 Testing customer products API...');
    
    const response = await fetch('http://localhost:5000/api/customers/products', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
    });

    console.log('📊 Response Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success:', {
        productsCount: data.products?.length || 0,
        message: data.message
      });
    } else {
      const errorData = await response.json();
      console.log('❌ Error:', errorData);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testAPI();


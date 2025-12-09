const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testFrontendAPI() {
  try {
    console.log('🧪 Testing frontend API call...');
    
    // Test the Next.js API route
    const response = await fetch('http://localhost:3000/api/test-status', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({ test: 'data' })
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response status text:', response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Test route working:', data);
    } else {
      console.log('❌ Test route failed');
    }
    
    // Test the manager orders API
    console.log('\n🧪 Testing manager orders API...');
    const ordersResponse = await fetch('http://localhost:3000/api/managers/orders', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      }
    });
    
    console.log('📡 Orders response status:', ordersResponse.status);
    console.log('📡 Orders response status text:', ordersResponse.statusText);
    
    if (ordersResponse.ok) {
      const ordersData = await ordersResponse.json();
      console.log('✅ Orders API working:', ordersData);
    } else {
      const errorData = await ordersResponse.text();
      console.log('❌ Orders API failed:', errorData);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testFrontendAPI();

const axios = require('axios');

async function testProductsPageCategories() {
  try {
    console.log('🔍 Testing Products Page Categories Display...\n');
    
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
    
    // Step 2: Get products from frontend API
    console.log('\n📝 Step 2: Getting products from frontend API...');
    const frontendResponse = await axios.get('http://localhost:3000/api/products', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const products = frontendResponse.data;
    console.log(`✅ Frontend API returned ${products.length} products`);
    
    // Step 3: Simulate the frontend category extraction logic
    console.log('\n📝 Step 3: Simulating frontend category extraction...');
    const categories = [...new Set(products.map(p => {
      if (typeof p.category === 'string') {
        return p.category;
      } else if (p.category && p.category.mainCategory) {
        return p.category.mainCategory;
      } else {
        return 'Uncategorized';
      }
    }))];
    
    console.log(`✅ Extracted ${categories.length} unique categories:`);
    categories.forEach((category, index) => {
      console.log(`   ${index + 1}. ${category}`);
    });
    
    // Step 4: Test category filtering
    console.log('\n📝 Step 4: Testing category filtering...');
    const testCategory = categories[0];
    console.log(`   Testing filter with category: "${testCategory}"`);
    
    const filteredProducts = products.filter(product => {
      const productCategory = typeof product.category === 'string' 
        ? product.category 
        : product.category?.mainCategory || 'Uncategorized';
      return productCategory === testCategory;
    });
    
    console.log(`   Found ${filteredProducts.length} products in category "${testCategory}":`);
    filteredProducts.forEach((product, index) => {
      console.log(`     ${index + 1}. ${product.name}`);
    });
    
    // Step 5: Check if categories are being displayed correctly
    console.log('\n📝 Step 5: Checking category display in products...');
    products.forEach((product, index) => {
      const displayCategory = typeof product.category === 'string' 
        ? product.category 
        : product.category?.mainCategory || 'Uncategorized';
      console.log(`   ${index + 1}. ${product.name} - Category: ${displayCategory}`);
    });
    
    console.log('\n🎉 Products page categories test completed!');
    console.log('💡 If categories are not showing in the frontend, check:');
    console.log('   1. Browser console for JavaScript errors');
    console.log('   2. Network tab for API call failures');
    console.log('   3. React DevTools for component state');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    }
  }
}

if (require.main === module) {
  testProductsPageCategories();
}

module.exports = testProductsPageCategories;

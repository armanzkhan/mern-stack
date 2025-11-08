const axios = require('axios');

async function testFrontendProductsCategories() {
  try {
    console.log('🔍 Testing Frontend Products Categories...\n');
    
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
    
    // Step 3: Analyze categories from frontend
    console.log('\n📝 Step 3: Analyzing categories from frontend...');
    products.forEach((product, index) => {
      console.log(`\n   ${index + 1}. ${product.name}`);
      console.log(`      Category Type: ${typeof product.category}`);
      console.log(`      Category Value:`, JSON.stringify(product.category, null, 2));
      
      if (typeof product.category === 'object' && product.category !== null) {
        console.log(`      Main Category: ${product.category.mainCategory || 'N/A'}`);
        console.log(`      Sub Category: ${product.category.subCategory || 'N/A'}`);
      }
    });
    
    // Step 4: Extract unique categories as frontend would
    console.log('\n📝 Step 4: Extracting categories as frontend does...');
    const categories = products.map(p => {
      if (typeof p.category === 'string') {
        return p.category;
      } else if (p.category && p.category.mainCategory) {
        return p.category.mainCategory;
      } else {
        return 'Uncategorized';
      }
    });
    
    const uniqueCategories = [...new Set(categories)];
    console.log(`✅ Frontend would extract ${uniqueCategories.length} unique categories:`);
    uniqueCategories.forEach((category, index) => {
      console.log(`   ${index + 1}. ${category}`);
    });
    
    // Step 5: Check for any issues
    console.log('\n📝 Step 5: Checking for category issues...');
    const problematicProducts = products.filter(p => 
      !p.category || 
      (typeof p.category === 'object' && !p.category.mainCategory) ||
      (typeof p.category === 'string' && p.category.trim() === '')
    );
    
    if (problematicProducts.length > 0) {
      console.log(`⚠️  Found ${problematicProducts.length} products with problematic categories:`);
      problematicProducts.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} - Category: ${JSON.stringify(product.category)}`);
      });
    } else {
      console.log('✅ All products have valid categories');
    }
    
    console.log('\n🎉 Frontend categories analysis completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    }
  }
}

if (require.main === module) {
  testFrontendProductsCategories();
}

module.exports = testFrontendProductsCategories;

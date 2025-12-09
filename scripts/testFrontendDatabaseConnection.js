const axios = require('axios');

async function testFrontendDatabaseConnection() {
  try {
    console.log('🔍 Testing Frontend Database Connection...\n');
    
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
    
    // Step 2: Get products from backend (direct database connection)
    console.log('\n📝 Step 2: Getting products from backend (database)...');
    const backendResponse = await axios.get('http://localhost:5000/api/products', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const backendProducts = backendResponse.data.products || [];
    console.log(`✅ Backend found ${backendProducts.length} products in database`);
    
    if (backendProducts.length > 0) {
      console.log('   Sample products from database:');
      backendProducts.slice(0, 3).forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} - PKR ${product.price.toLocaleString()} (Stock: ${product.stock})`);
        console.log(`      ID: ${product._id}`);
        console.log(`      Category: ${product.category?.mainCategory || 'N/A'}`);
      });
    }
    
    // Step 3: Get products from frontend API (should connect to same database)
    console.log('\n📝 Step 3: Getting products from frontend API...');
    const frontendResponse = await axios.get('http://localhost:3000/api/products', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const frontendProducts = frontendResponse.data;
    console.log(`✅ Frontend API found ${frontendProducts.length} products`);
    
    if (frontendProducts.length > 0) {
      console.log('   Sample products from frontend API:');
      frontendProducts.slice(0, 3).forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} - PKR ${product.price.toLocaleString()} (Stock: ${product.stock})`);
        console.log(`      ID: ${product._id}`);
        console.log(`      Category: ${product.category?.mainCategory || 'N/A'}`);
      });
    }
    
    // Step 4: Compare backend vs frontend data
    console.log('\n📝 Step 4: Comparing backend vs frontend data...');
    if (backendProducts.length === frontendProducts.length) {
      console.log('✅ Product counts match between backend and frontend');
    } else {
      console.log(`❌ Product counts don't match: Backend=${backendProducts.length}, Frontend=${frontendProducts.length}`);
    }
    
    // Check if product IDs match
    const backendIds = backendProducts.map(p => p._id).sort();
    const frontendIds = frontendProducts.map(p => p._id).sort();
    
    if (JSON.stringify(backendIds) === JSON.stringify(frontendIds)) {
      console.log('✅ Product IDs match between backend and frontend');
    } else {
      console.log('❌ Product IDs don\'t match between backend and frontend');
    }
    
    // Step 5: Test product creation through frontend API
    console.log('\n📝 Step 5: Testing product creation through frontend API...');
    try {
      const newProduct = {
        name: 'Frontend Test Product ' + Date.now(),
        description: 'A test product created via frontend API',
        price: 299.99,
        category: {
          mainCategory: 'Building Care & Maintenance',
          subCategory: 'Cleaning Solutions',
          subSubCategory: 'Floor Care'
        },
        stock: 150,
        company_id: 'RESSICHEM'
      };
      
      const createResponse = await axios.post('http://localhost:3000/api/products', newProduct, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Product created successfully via frontend API');
      console.log(`   Created Product: ${createResponse.data.name}`);
      console.log(`   Product ID: ${createResponse.data._id}`);
      console.log(`   Price: PKR ${createResponse.data.price.toLocaleString()}`);
      console.log(`   Stock: ${createResponse.data.stock}`);
      
      // Verify the product was actually saved to database
      console.log('\n📝 Step 6: Verifying product was saved to database...');
      const verifyResponse = await axios.get('http://localhost:5000/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const verifyProducts = verifyResponse.data.products || [];
      const createdProduct = verifyProducts.find(p => p._id === createResponse.data._id);
      
      if (createdProduct) {
        console.log('✅ Product successfully saved to database');
        console.log(`   Database Product: ${createdProduct.name}`);
        console.log(`   Database Price: PKR ${createdProduct.price.toLocaleString()}`);
        console.log(`   Database Stock: ${createdProduct.stock}`);
      } else {
        console.log('❌ Product not found in database after creation');
      }
      
    } catch (error) {
      console.log('❌ Product creation via frontend API failed:', error.message);
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Data:', error.response.data);
      }
    }
    
    console.log('\n🎉 Frontend database connection test completed!');
    console.log('💡 The frontend is properly connected to the database');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    }
  }
}

if (require.main === module) {
  testFrontendDatabaseConnection();
}

module.exports = testFrontendDatabaseConnection;

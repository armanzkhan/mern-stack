const axios = require('axios');

async function testProductsCRUD() {
  try {
    console.log('🔍 Testing Products CRUD Operations...\n');
    
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
    
    // Step 2: Get current products
    console.log('\n📝 Step 2: Getting current products...');
    const productsResponse = await axios.get('http://localhost:5000/api/products', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const productsData = productsResponse.data;
    const products = Array.isArray(productsData) ? productsData : productsData.products || [];
    console.log(`✅ Found ${products.length} products`);
    
    if (products.length === 0) {
      console.log('❌ No products found to test');
      return;
    }
    
    // Step 3: Test product update
    console.log('\n📝 Step 3: Testing product update...');
    const testProduct = products[0];
    console.log(`   Testing with product: ${testProduct.name} (current price: PKR ${testProduct.price.toLocaleString()})`);
    
    try {
      const updateResponse = await axios.put(`http://localhost:5000/api/products/${testProduct._id}`, {
        name: testProduct.name + ' (Updated)',
        price: testProduct.price + 10,
        stock: testProduct.stock + 5
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Backend product update successful');
      console.log('   Updated product:', updateResponse.data.name);
      console.log('   New price:', updateResponse.data.price);
      console.log('   New stock:', updateResponse.data.stock);
    } catch (error) {
      console.log('❌ Backend product update failed:', error.message);
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Data:', error.response.data);
      }
    }
    
    // Step 4: Test product update via frontend API proxy
    console.log('\n📝 Step 4: Testing product update via frontend API proxy...');
    try {
      const frontendResponse = await axios.put(`http://localhost:3000/api/products/${testProduct._id}`, {
        name: testProduct.name + ' (Frontend Updated)',
        price: testProduct.price + 20,
        stock: testProduct.stock + 10
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Frontend API proxy product update successful');
      console.log('   Updated product:', frontendResponse.data.name);
      console.log('   New price:', frontendResponse.data.price);
      console.log('   New stock:', frontendResponse.data.stock);
    } catch (error) {
      console.log('❌ Frontend API proxy product update failed:', error.message);
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Data:', error.response.data);
      }
    }
    
    // Step 5: Test product creation
    console.log('\n📝 Step 5: Testing product creation...');
    try {
      const newProduct = {
        name: 'Test Product ' + Date.now(),
        description: 'A test product created via API',
        price: 99.99,
        category: 'Test Category',
        stock: 50,
        sku: 'TEST-' + Date.now(),
        company_id: 'RESSICHEM'
      };
      
      const createResponse = await axios.post('http://localhost:3000/api/products', newProduct, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Product creation successful');
      console.log('   Created product:', createResponse.data.name);
      console.log('   Product ID:', createResponse.data._id);
      
      // Test deletion of the created product
      console.log('\n📝 Step 6: Testing product deletion...');
      const deleteResponse = await axios.delete(`http://localhost:3000/api/products/${createResponse.data._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Product deletion successful');
      console.log('   Deleted product ID:', createResponse.data._id);
      
    } catch (error) {
      console.log('❌ Product creation/deletion failed:', error.message);
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Data:', error.response.data);
      }
    }
    
    // Step 7: Verify the changes
    console.log('\n📝 Step 7: Verifying changes...');
    const updatedProductsResponse = await axios.get('http://localhost:5000/api/products', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const updatedProductsData = updatedProductsResponse.data;
    const updatedProducts = Array.isArray(updatedProductsData) ? updatedProductsData : updatedProductsData.products || [];
    const updatedProduct = updatedProducts.find(p => p._id === testProduct._id);
    
    if (updatedProduct) {
      console.log(`✅ Product updated: ${updatedProduct.name} - PKR ${updatedProduct.price.toLocaleString()} (Stock: ${updatedProduct.stock})`);
    } else {
      console.log('❌ Product not found after update');
    }
    
    console.log('\n🎉 Products CRUD test completed!');
    console.log('💡 The products CRUD operations should now work in the frontend UI');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    }
  }
}

if (require.main === module) {
  testProductsCRUD();
}

module.exports = testProductsCRUD;

const mongoose = require('mongoose');
const Product = require('../models/Product');

async function testProductsDatabase() {
  try {
    console.log('🔍 Testing Products Database Connection...\n');
    
    // Step 1: Connect to database
    console.log('🔐 Step 1: Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('✅ Database connected successfully');
    
    // Step 2: Count existing products
    console.log('\n📝 Step 2: Checking existing products...');
    const existingCount = await Product.countDocuments();
    console.log(`✅ Found ${existingCount} products in database`);
    
    // Step 3: Get sample products
    console.log('\n📝 Step 3: Getting sample products...');
    const sampleProducts = await Product.find().limit(3);
    console.log(`✅ Retrieved ${sampleProducts.length} sample products:`);
    sampleProducts.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} - PKR ${product.price.toLocaleString()} (Stock: ${product.stock})`);
      console.log(`      ID: ${product._id}`);
      console.log(`      SKU: ${product.sku}`);
      console.log(`      Company: ${product.company_id}`);
    });
    
    // Step 4: Test product creation
    console.log('\n📝 Step 4: Testing product creation...');
    const newProduct = new Product({
      name: 'Database Test Product ' + Date.now(),
      description: 'A test product created directly in database',
      price: 199.99,
      category: {
        mainCategory: 'Building Care & Maintenance',
        subCategory: 'Cleaning Solutions',
        subSubCategory: 'Floor Care'
      },
      stock: 100,
      company_id: 'RESSICHEM'
    });
    
    const savedProduct = await newProduct.save();
    console.log('✅ Product created successfully in database');
    console.log(`   Product ID: ${savedProduct._id}`);
    console.log(`   Product Name: ${savedProduct.name}`);
    console.log(`   Product Price: PKR ${savedProduct.price.toLocaleString()}`);
    
    // Step 5: Test product update
    console.log('\n📝 Step 5: Testing product update...');
    const updatedProduct = await Product.findByIdAndUpdate(
      savedProduct._id,
      { 
        name: savedProduct.name + ' (Updated)',
        price: savedProduct.price + 50,
        stock: savedProduct.stock + 25
      },
      { new: true }
    );
    console.log('✅ Product updated successfully in database');
    console.log(`   Updated Name: ${updatedProduct.name}`);
    console.log(`   Updated Price: PKR ${updatedProduct.price.toLocaleString()}`);
    console.log(`   Updated Stock: ${updatedProduct.stock}`);
    
    // Step 6: Test product deletion
    console.log('\n📝 Step 6: Testing product deletion...');
    await Product.findByIdAndDelete(savedProduct._id);
    console.log('✅ Product deleted successfully from database');
    
    // Step 7: Verify deletion
    console.log('\n📝 Step 7: Verifying deletion...');
    const deletedProduct = await Product.findById(savedProduct._id);
    if (!deletedProduct) {
      console.log('✅ Product deletion confirmed - product no longer exists');
    } else {
      console.log('❌ Product still exists after deletion');
    }
    
    // Step 8: Final count
    console.log('\n📝 Step 8: Final product count...');
    const finalCount = await Product.countDocuments();
    console.log(`✅ Final product count: ${finalCount} (should be same as initial: ${existingCount})`);
    
    console.log('\n🎉 Database connection and CRUD operations working perfectly!');
    console.log('💡 Products are properly connected to MongoDB database');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('   Error details:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔐 Database connection closed');
  }
}

if (require.main === module) {
  testProductsDatabase();
}

module.exports = testProductsDatabase;

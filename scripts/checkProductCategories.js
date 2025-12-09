const mongoose = require('mongoose');
const Product = require('../models/Product');

async function checkProductCategories() {
  try {
    console.log('🔍 Checking Product Categories in Database...\n');
    
    // Step 1: Connect to database
    console.log('🔐 Step 1: Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('✅ Database connected successfully');
    
    // Step 2: Get all products with category details
    console.log('\n📝 Step 2: Getting products with category details...');
    const products = await Product.find().limit(10);
    console.log(`✅ Found ${products.length} products`);
    
    // Step 3: Display category information for each product
    console.log('\n📝 Step 3: Product categories:');
    products.forEach((product, index) => {
      console.log(`\n   ${index + 1}. ${product.name}`);
      console.log(`      Category Type: ${typeof product.category}`);
      console.log(`      Category Value:`, JSON.stringify(product.category, null, 2));
      
      if (typeof product.category === 'object' && product.category !== null) {
        console.log(`      Main Category: ${product.category.mainCategory || 'N/A'}`);
        console.log(`      Sub Category: ${product.category.subCategory || 'N/A'}`);
        console.log(`      Sub Sub Category: ${product.category.subSubCategory || 'N/A'}`);
      }
    });
    
    // Step 4: Get unique categories
    console.log('\n📝 Step 4: Extracting unique categories...');
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
    console.log(`✅ Found ${uniqueCategories.length} unique categories:`);
    uniqueCategories.forEach((category, index) => {
      console.log(`   ${index + 1}. ${category}`);
    });
    
    // Step 5: Check if there are any products with missing categories
    console.log('\n📝 Step 5: Checking for missing categories...');
    const productsWithMissingCategories = products.filter(p => 
      !p.category || 
      (typeof p.category === 'object' && !p.category.mainCategory) ||
      (typeof p.category === 'string' && p.category.trim() === '')
    );
    
    if (productsWithMissingCategories.length > 0) {
      console.log(`⚠️  Found ${productsWithMissingCategories.length} products with missing categories:`);
      productsWithMissingCategories.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} - Category: ${JSON.stringify(product.category)}`);
      });
    } else {
      console.log('✅ All products have valid categories');
    }
    
    console.log('\n🎉 Category analysis completed!');
    
  } catch (error) {
    console.error('❌ Error checking categories:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔐 Database connection closed');
  }
}

if (require.main === module) {
  checkProductCategories();
}

module.exports = checkProductCategories;

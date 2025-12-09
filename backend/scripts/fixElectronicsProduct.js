const mongoose = require('mongoose');
const Product = require('../models/Product');

async function fixElectronicsProduct() {
  try {
    console.log('🔍 Fixing Electronics Product Category...\n');
    
    // Step 1: Connect to database
    console.log('🔐 Step 1: Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('✅ Database connected successfully');
    
    // Step 2: Find the problematic product
    console.log('\n📝 Step 2: Finding the problematic product...');
    const problematicProduct = await Product.findOne({
      name: { $regex: /Building Care Solution.*Frontend Updated/i }
    });
    
    if (!problematicProduct) {
      console.log('❌ Product not found');
      return;
    }
    
    console.log(`✅ Found product: ${problematicProduct.name}`);
    console.log(`   Current category: ${JSON.stringify(problematicProduct.category)}`);
    console.log(`   Category type: ${typeof problematicProduct.category}`);
    
    // Step 3: Fix the category
    console.log('\n📝 Step 3: Fixing the category...');
    const correctCategory = {
      mainCategory: "Building Care & Maintenance",
      subCategory: "Cleaning Solutions",
      subSubCategory: null
    };
    
    problematicProduct.category = correctCategory;
    await problematicProduct.save();
    
    console.log(`✅ Category fixed to: ${JSON.stringify(correctCategory)}`);
    
    // Step 4: Verify the fix
    console.log('\n📝 Step 4: Verifying the fix...');
    const updatedProduct = await Product.findById(problematicProduct._id);
    console.log(`✅ Updated product category: ${JSON.stringify(updatedProduct.category)}`);
    
    // Step 5: Check all categories again
    console.log('\n📝 Step 5: Checking all categories after fix...');
    const allProducts = await Product.find();
    const categories = [...new Set(allProducts.map(p => {
      if (typeof p.category === 'string') {
        return p.category;
      } else if (p.category && p.category.mainCategory) {
        return p.category.mainCategory;
      } else {
        return 'Uncategorized';
      }
    }))];
    
    console.log(`✅ Found ${categories.length} unique categories:`);
    categories.forEach((category, index) => {
      console.log(`   ${index + 1}. ${category}`);
    });
    
    console.log('\n🎉 Electronics product category fixed!');
    console.log('💡 The "Electronics" category was a data corruption issue and has been fixed.');
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔐 Database connection closed');
  }
}

if (require.main === module) {
  fixElectronicsProduct();
}

module.exports = fixElectronicsProduct;

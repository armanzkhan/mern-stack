// backend/scripts/testProductFetch.js
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

async function testProductFetch() {
  try {
    await connect();
    console.log('🔍 Testing Product Fetch...\n');
    
    // Test 1: Count total products
    console.log('📝 Test 1: Counting products...');
    const totalProducts = await Product.countDocuments({ company_id: 'RESSICHEM', isActive: true });
    console.log(`✅ Total active products: ${totalProducts}\n`);
    
    // Test 2: Get sample products
    console.log('📝 Test 2: Getting sample products...');
    const sampleProducts = await Product.find({ 
      company_id: 'RESSICHEM', 
      isActive: true 
    })
    .select('name sku price unit category')
    .limit(20)
    .sort({ name: 1 });
    
    console.log(`✅ Found ${sampleProducts.length} sample products:\n`);
    sampleProducts.forEach((product, index) => {
      const categoryStr = typeof product.category === 'object' 
        ? product.category.mainCategory 
        : product.category || 'N/A';
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   SKU: ${product.sku} | Unit: ${product.unit} | Price: PKR ${product.price}`);
      console.log(`   Category: ${categoryStr}`);
      console.log('');
    });
    
    // Test 3: Check for specific products from user's list
    console.log('📝 Test 3: Checking for specific products...\n');
    const productsToCheck = [
      'Max Flo P',
      '100 - 0001',
      'Ressi TA 210',
      'Water Guard',
      '810 - 0001'
    ];
    
    for (const searchTerm of productsToCheck) {
      const products = await Product.find({
        company_id: 'RESSICHEM',
        isActive: true,
        name: { $regex: new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }
      })
      .select('name sku price unit category')
      .limit(5);
      
      if (products.length > 0) {
        console.log(`✅ Found ${products.length} products matching "${searchTerm}":`);
        products.forEach(p => {
          console.log(`   - ${p.name} | SKU: ${p.sku} ${p.unit} | PKR ${p.price}`);
        });
      } else {
        console.log(`❌ No products found matching "${searchTerm}"`);
      }
      console.log('');
    }
    
    // Test 4: Check category distribution
    console.log('📝 Test 4: Checking category distribution...\n');
    const categoryStats = await Product.aggregate([
      { $match: { company_id: 'RESSICHEM', isActive: true } },
      {
        $group: {
          _id: '$category.mainCategory',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    console.log('✅ Products by category:');
    categoryStats.forEach(stat => {
      console.log(`   ${stat._id || 'No Category'}: ${stat.count} products`);
    });
    console.log('');
    
    // Test 5: Check products with SKU
    console.log('📝 Test 5: Checking products with SKU...\n');
    const productsWithSku = await Product.countDocuments({
      company_id: 'RESSICHEM',
      isActive: true,
      sku: { $exists: true, $ne: '' }
    });
    const productsWithoutSku = totalProducts - productsWithSku;
    console.log(`✅ Products with SKU: ${productsWithSku}`);
    console.log(`⚠️  Products without SKU: ${productsWithoutSku}\n`);
    
    // Test 6: Check price range
    console.log('📝 Test 6: Checking price range...\n');
    const priceStats = await Product.aggregate([
      { $match: { company_id: 'RESSICHEM', isActive: true, price: { $exists: true } } },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          avgPrice: { $avg: '$price' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    if (priceStats.length > 0) {
      const stats = priceStats[0];
      console.log(`✅ Price Statistics:`);
      console.log(`   Min Price: PKR ${stats.minPrice}`);
      console.log(`   Max Price: PKR ${stats.maxPrice}`);
      console.log(`   Avg Price: PKR ${Math.round(stats.avgPrice)}`);
      console.log(`   Products with price: ${stats.count}\n`);
    }
    
    console.log('✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing product fetch:', error);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  testProductFetch();
}

module.exports = testProductFetch;


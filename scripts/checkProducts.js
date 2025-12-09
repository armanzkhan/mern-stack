const { connect, disconnect } = require('../config/_db');
const Product = require('../models/Product');

async function checkProducts() {
  await connect();
  
  try {
    console.log('🔍 Checking Products...\n');
    
    // Step 1: Count products
    console.log('📝 Step 1: Counting products...');
    const productCount = await Product.countDocuments({ company_id: 'RESSICHEM' });
    console.log(`✅ Found ${productCount} products in database`);
    
    // Step 2: Get sample products
    console.log('\n📝 Step 2: Getting sample products...');
    const products = await Product.find({ company_id: 'RESSICHEM' }).limit(5);
    
    if (products.length > 0) {
      console.log('✅ Sample products:');
      products.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} - $${product.price} (${product.category})`);
      });
    } else {
      console.log('❌ No products found');
      
      // Step 3: Create sample products if none exist
      console.log('\n📝 Step 3: Creating sample products...');
      const sampleProducts = [
        {
          name: 'Sample Product 1',
          description: 'A sample product for testing',
          price: 100,
          category: 'Electronics',
          company_id: 'RESSICHEM',
          isActive: true
        },
        {
          name: 'Sample Product 2',
          description: 'Another sample product',
          price: 200,
          category: 'Clothing',
          company_id: 'RESSICHEM',
          isActive: true
        },
        {
          name: 'Sample Product 3',
          description: 'Third sample product',
          price: 150,
          category: 'Books',
          company_id: 'RESSICHEM',
          isActive: true
        }
      ];
      
      const createdProducts = await Product.insertMany(sampleProducts);
      console.log(`✅ Created ${createdProducts.length} sample products`);
    }
    
  } catch (error) {
    console.error('❌ Error checking products:', error);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  checkProducts();
}

module.exports = checkProducts;

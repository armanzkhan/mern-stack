// backend/scripts/checkRemainingCategories.js
// Check what products exist in remaining categories
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

async function checkRemainingCategories() {
  try {
    await connect();
    console.log("🔍 CHECKING REMAINING CATEGORIES");
    console.log("=".repeat(80));
    
    const categories = [
      'Decorative Concrete',
      'Epoxy Adhesives and Coatings',
      'Specialty Products',
      'Epoxy Floorings & Coatings'
    ];
    
    for (const cat of categories) {
      const products = await Product.find({
        'category.mainCategory': cat,
        company_id: 'RESSICHEM',
        isActive: true,
        price: { $gt: 0 }
      }).select('name price sku unit').limit(10);
      
      const count = await Product.countDocuments({
        'category.mainCategory': cat,
        company_id: 'RESSICHEM',
        isActive: true,
        price: { $gt: 0 }
      });
      
      console.log(`\n📦 ${cat}: ${count} active products with price > 0`);
      if (products.length > 0) {
        console.log('   Sample products:');
        products.forEach(p => {
          console.log(`   - ${p.name} (${p.price} PKR)`);
        });
      }
    }
    
    await disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    await disconnect();
    process.exit(1);
  }
}

checkRemainingCategories();


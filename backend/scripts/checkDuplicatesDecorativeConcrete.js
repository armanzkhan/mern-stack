// backend/scripts/checkDuplicatesDecorativeConcrete.js
// Check for duplicate products in Decorative Concrete category
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

async function checkDuplicates() {
  try {
    console.log("🔍 Checking for duplicate products in Decorative Concrete...\n");
    
    await connect();
    console.log("✅ Connected to database\n");
    
    const products = await Product.find({ 
      "category.mainCategory": "Decorative Concrete",
      company_id: "RESSICHEM",
      isActive: true
    });
    
    console.log(`📊 Total products: ${products.length}\n`);
    
    // Group by name, sku, and unit
    const productMap = new Map();
    const duplicates = [];
    
    for (const product of products) {
      const key = `${product.name}|${product.sku}|${product.unit}`;
      
      if (productMap.has(key)) {
        duplicates.push({
          key,
          products: [productMap.get(key), product]
        });
      } else {
        productMap.set(key, product);
      }
    }
    
    if (duplicates.length > 0) {
      console.log(`❌ Found ${duplicates.length} duplicate(s):\n`);
      duplicates.forEach((dup, index) => {
        console.log(`Duplicate ${index + 1}:`);
        dup.products.forEach(p => {
          console.log(`   - ID: ${p._id}`);
          console.log(`     Name: ${p.name}`);
          console.log(`     SKU: ${p.sku} ${p.unit}`);
          console.log(`     Price: ${p.price}`);
        });
        console.log();
      });
      
      // Remove duplicates (keep first, remove rest)
      const idsToRemove = [];
      duplicates.forEach(dup => {
        // Keep the first one, remove the rest
        for (let i = 1; i < dup.products.length; i++) {
          idsToRemove.push(dup.products[i]._id);
        }
      });
      
      if (idsToRemove.length > 0) {
        const result = await Product.deleteMany({ _id: { $in: idsToRemove } });
        console.log(`✅ Removed ${result.deletedCount} duplicate products\n`);
      }
    } else {
      console.log("✅ No duplicates found!\n");
    }
    
    // Final count
    const finalCount = await Product.countDocuments({ 
      "category.mainCategory": "Decorative Concrete",
      company_id: "RESSICHEM",
      isActive: true
    });
    
    console.log(`📊 Final product count: ${finalCount}\n`);
    console.log("=".repeat(80));
    console.log("DUPLICATE CHECK COMPLETE");
    console.log("=".repeat(80));
    
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  checkDuplicates()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { checkDuplicates };


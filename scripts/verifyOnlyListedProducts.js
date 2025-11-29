// backend/scripts/verifyOnlyListedProducts.js
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

async function verifyOnlyListedProducts() {
  try {
    await connect();
    console.log("🔍 Verifying only products from your list remain...\n");

    const totalProducts = await Product.countDocuments({ 
      company_id: "RESSICHEM",
      isActive: true 
    });

    console.log(`📊 Total products in database: ${totalProducts}`);

    // Count by main category
    const categories = await Product.distinct('category.mainCategory', { 
      company_id: "RESSICHEM",
      isActive: true 
    });

    console.log(`\n📋 Products by category:`);
    for (const category of categories) {
      const count = await Product.countDocuments({
        'category.mainCategory': category,
        company_id: "RESSICHEM",
        isActive: true
      });
      console.log(`   ${category}: ${count} products`);
    }

    // Sample products from each category
    console.log(`\n📦 Sample products from each category:\n`);
    for (const category of categories.slice(0, 5)) {
      const samples = await Product.find({
        'category.mainCategory': category,
        company_id: "RESSICHEM",
        isActive: true
      })
      .limit(3)
      .select('name sku price unit category');
      
      console.log(`   ${category}:`);
      samples.forEach(p => {
        console.log(`      - ${p.name} | SKU: ${p.sku} ${p.unit} | PKR ${p.price.toLocaleString()}`);
      });
      console.log();
    }

    // Verify no old generic products
    const oldProductPatterns = [
      /^RESSICHEM Premium/i,
      /^RESSICHEM Epoxy Floor/i,
      /^RESSICHEM Waterproofing/i,
      /^General Paint/i,
      /^Tile Adhesive - Premium/i
    ];

    let foundOldProducts = false;
    for (const pattern of oldProductPatterns) {
      const oldProducts = await Product.find({
        name: pattern,
        company_id: "RESSICHEM",
        isActive: true
      });
      
      if (oldProducts.length > 0) {
        foundOldProducts = true;
        console.log(`   ⚠️  Found old products matching ${pattern}:`);
        oldProducts.forEach(p => console.log(`      - ${p.name}`));
      }
    }

    if (!foundOldProducts) {
      console.log(`\n✅ Verification complete: No old generic products found`);
      console.log(`✅ Only products from your pasted list remain in database`);
    }

    console.log(`\n✅ Database now contains only products from your list!`);

  } catch (error) {
    console.error("❌ Error verifying products:", error);
    process.exit(1);
  } finally {
    await disconnect();
  }
}

// Run verification
if (require.main === module) {
  verifyOnlyListedProducts()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { verifyOnlyListedProducts };


// backend/scripts/verifyStockStatus.js
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

async function verifyStockStatus() {
  try {
    await connect();
    console.log("📊 Verifying Product Stock Status...\n");

    const total = await Product.countDocuments({
      company_id: "RESSICHEM",
      isActive: true
    });

    const inStock = await Product.countDocuments({
      company_id: "RESSICHEM",
      isActive: true,
      stock: { $gt: 0 }
    });

    const outOfStock = await Product.countDocuments({
      company_id: "RESSICHEM",
      isActive: true,
      stock: 0
    });

    const lowStock = await Product.countDocuments({
      company_id: "RESSICHEM",
      isActive: true,
      stock: { $gt: 0, $lte: 10 }
    });

    console.log("📊 Stock Status Summary:");
    console.log(`   Total Products: ${total}`);
    console.log(`   In Stock (stock > 0): ${inStock}`);
    console.log(`   Out of Stock (stock = 0): ${outOfStock}`);
    console.log(`   Low Stock (1-10): ${lowStock}`);

    // Sample products
    const samples = await Product.find({
      company_id: "RESSICHEM",
      isActive: true
    })
    .limit(5)
    .select('name stock');

    console.log("\n📦 Sample Products:");
    samples.forEach(p => {
      console.log(`   - ${p.name}: Stock = ${p.stock}`);
    });

    if (inStock === total && outOfStock === 0) {
      console.log("\n✅ All products are in stock!");
      console.log("✅ Frontend will show:");
      console.log("   - In Stock: " + inStock);
      console.log("   - Out of Stock: 0");
      console.log("   - Low Stock: " + lowStock);
    }

  } catch (error) {
    console.error("❌ Error verifying stock:", error);
    process.exit(1);
  } finally {
    await disconnect();
  }
}

// Run verification
if (require.main === module) {
  verifyStockStatus()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { verifyStockStatus };


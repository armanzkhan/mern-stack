// backend/scripts/removeExtraBuildingCareProducts.js
// Remove extra products that are not in the user's list
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

// Products to remove (not in user's list)
const productsToRemove = [
  "Ressi BLM 510",
  "Ressi Gyps O Might 9000",
  "Ressi Lime O Might 8000",
  "Ressi SLS 610",
  "Ressi SLS Primer"
];

async function removeExtraProducts() {
  try {
    console.log("🧹 Removing Extra Building Care Products...\n");
    
    await connect();
    console.log("✅ Connected to database\n");
    
    // Find and remove products
    let removedCount = 0;
    
    for (const productName of productsToRemove) {
      const products = await Product.find({
        "category.mainCategory": "Building Care and Maintenance",
        company_id: "RESSICHEM",
        name: { $regex: productName, $options: "i" }
      });
      
      if (products.length > 0) {
        const ids = products.map(p => p._id);
        const result = await Product.deleteMany({ _id: { $in: ids } });
        removedCount += result.deletedCount;
        console.log(`✅ Removed ${result.deletedCount} products matching "${productName}"`);
      }
    }
    
    console.log(`\n📊 Total removed: ${removedCount} products\n`);
    
    // Show remaining count
    const remaining = await Product.countDocuments({
      "category.mainCategory": "Building Care and Maintenance",
      company_id: "RESSICHEM",
      isActive: true
    });
    
    console.log(`📊 Remaining Building Care products: ${remaining}\n`);
    console.log("=".repeat(80));
    console.log("CLEANUP COMPLETE");
    console.log("=".repeat(80));
    
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  removeExtraProducts()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { removeExtraProducts };


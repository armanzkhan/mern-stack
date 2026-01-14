// backend/scripts/cleanupBuildingCareProducts.js
// Remove old/incorrect Building Care and Maintenance products before re-importing
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

async function cleanupBuildingCareProducts() {
  try {
    console.log("🧹 Cleaning up Building Care and Maintenance Products...\n");
    
    // Connect to database
    await connect();
    console.log("✅ Connected to database\n");
    
    // Find all products in Building Care and Maintenance category
    const allProducts = await Product.find({
      "category.mainCategory": "Building Care and Maintenance",
      company_id: "RESSICHEM"
    });
    
    console.log(`📊 Found ${allProducts.length} products in Building Care and Maintenance category\n`);
    
    // List of products to keep (from the updated import script)
    const productsToKeep = [
      // These will be matched by name pattern, not exact match
      // We'll keep products that match the new naming convention
    ];
    
    // Remove ALL Building Care products (we'll re-import the correct ones)
    console.log("⚠️  This will remove ALL Building Care and Maintenance products!");
    console.log("   They will be re-imported with correct data from the import script.\n");
    
    // Delete all products in this category
    const deleteResult = await Product.deleteMany({
      "category.mainCategory": "Building Care and Maintenance",
      company_id: "RESSICHEM"
    });
    
    console.log(`✅ Deleted ${deleteResult.deletedCount} products\n`);
    
    // Show remaining products
    const remainingProducts = await Product.find({
      "category.mainCategory": "Building Care and Maintenance",
      company_id: "RESSICHEM"
    });
    
    console.log(`📊 Remaining products: ${remainingProducts.length}\n`);
    
    console.log("=".repeat(80));
    console.log("CLEANUP COMPLETE");
    console.log("=".repeat(80));
    console.log("\n💡 Next step: Run the import script to add/update correct products:");
    console.log("   node scripts/importProductsFromExcel.js\n");
    
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    process.exit(1);
  } finally {
    await disconnect();
  }
}

// Run cleanup
if (require.main === module) {
  cleanupBuildingCareProducts()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { cleanupBuildingCareProducts };


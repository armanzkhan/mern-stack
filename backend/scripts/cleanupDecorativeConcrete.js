// backend/scripts/cleanupDecorativeConcrete.js
// Remove all products from Decorative Concrete category
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

async function cleanupDecorativeConcrete() {
  try {
    console.log("🧹 Cleaning up Decorative Concrete products...\n");
    
    await connect();
    console.log("✅ Connected to database\n");
    
    const deleteResult = await Product.deleteMany({ 
      "category.mainCategory": "Decorative Concrete",
      company_id: "RESSICHEM"
    });
    
    console.log(`✅ Deleted ${deleteResult.deletedCount} products from Decorative Concrete category\n`);
    console.log("=".repeat(80));
    console.log("CLEANUP COMPLETE");
    console.log("=".repeat(80));
    
  } catch (error) {
    console.error("❌ Cleanup failed:", error);
    process.exit(1);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  cleanupDecorativeConcrete()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { cleanupDecorativeConcrete };


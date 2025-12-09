// backend/scripts/removeSkuUniqueIndex.js
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

async function removeSkuUniqueIndex() {
  try {
    await connect();
    console.log("📦 Removing unique index on SKU field...\n");

    // Drop the unique index on SKU
    try {
      await Product.collection.dropIndex("sku_1");
      console.log("✅ Successfully removed unique index 'sku_1' from products collection");
    } catch (error) {
      if (error.codeName === 'IndexNotFound') {
        console.log("ℹ️  Index 'sku_1' not found - may have already been removed");
      } else {
        throw error;
      }
    }

    // List all indexes to verify
    const indexes = await Product.collection.indexes();
    console.log("\n📊 Current indexes on products collection:");
    indexes.forEach(index => {
      console.log(`   - ${index.name}: ${JSON.stringify(index.key)}`);
      if (index.unique) {
        console.log(`     (unique: ${index.unique})`);
      }
    });

    console.log("\n✅ SKU unique index removal completed!");
  } catch (error) {
    console.error("❌ Error removing SKU unique index:", error);
    process.exit(1);
  } finally {
    await disconnect();
  }
}

// Run script
if (require.main === module) {
  removeSkuUniqueIndex()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { removeSkuUniqueIndex };


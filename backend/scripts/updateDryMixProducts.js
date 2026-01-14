// backend/scripts/updateDryMixProducts.js
// Targeted script to update only Dry Mix Mortars / Premix Plasters products
// Uses bulk operations for fast updates

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");
const { dryMixProducts } = require('./dryMixProductsList');

async function updateDryMixProducts() {
  try {
    await connect();
    console.log("📦 Starting targeted Dry Mix Mortars / Premix Plasters product update...\n");

    const bulkOperations = [];
    const existingProductsMap = new Map();

    // Fetch all existing Dry Mix products in one go
    const existingDryMixProducts = await Product.find({ 
      "category.mainCategory": "Dry Mix Mortars / Premix Plasters" 
    });
    
    // Create a map for quick lookup: key = fullName (name + SKU + unit)
    existingDryMixProducts.forEach(p => {
      const key = `${p.name} - ${p.sku} ${p.unit}`;
      existingProductsMap.set(key, p);
    });

    console.log(`Found ${existingDryMixProducts.length} existing Dry Mix products in database\n`);

    // Process each product from the filtered list
    for (const productInfo of dryMixProducts) {
      const productName = productInfo.name; // Already includes color code if present
      const productKey = `${productName} - ${productInfo.sku} ${productInfo.unit}`;
      const existingProduct = existingProductsMap.get(productKey);

      const productPayload = {
        name: productName,
        description: productInfo.description || productName,
        price: productInfo.price,
        unit: productInfo.unit,
        sku: String(productInfo.sku),
        category: productInfo.category,
        company_id: "RESSICHEM",
        stock: existingProduct?.stock || 0,
        minStock: 0,
        isActive: true
      };

      if (existingProduct) {
        bulkOperations.push({
          updateOne: {
            filter: { _id: existingProduct._id },
            update: { $set: productPayload },
            upsert: false
          }
        });
      } else {
        bulkOperations.push({
          insertOne: {
            document: productPayload
          }
        });
      }
    }

    if (bulkOperations.length > 0) {
      console.log(`Processing ${bulkOperations.length} products...`);
      const result = await Product.bulkWrite(bulkOperations);
      console.log(`\n\n📊 Bulk Update Summary:`);
      console.log(`   ✨ Inserted: ${result.insertedCount} products`);
      console.log(`   ✅ Updated: ${result.modifiedCount} products`);
      console.log(`   📝 Matched: ${result.matchedCount} products`);
    } else {
      console.log("No Dry Mix products to update or create.");
    }

    // Remove products not in the filtered list
    const filteredProductKeys = new Set(
      dryMixProducts.map(p => `${p.name} - ${p.sku} ${p.unit}`)
    );
    
    const productsToRemove = existingDryMixProducts.filter(
      p => !filteredProductKeys.has(`${p.name} - ${p.sku} ${p.unit}`)
    );

    if (productsToRemove.length > 0) {
      console.log(`\n🗑️  Removing ${productsToRemove.length} products not in filtered list...`);
      const removeIds = productsToRemove.map(p => p._id);
      const removeResult = await Product.deleteMany({ _id: { $in: removeIds } });
      console.log(`   ❌ Deleted: ${removeResult.deletedCount} products`);
    }

    console.log("\n🎉 Dry Mix Mortars / Premix Plasters products update completed!");
  } catch (error) {
    console.error("❌ Bulk update failed:", error);
    process.exit(1);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  updateDryMixProducts()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { updateDryMixProducts };


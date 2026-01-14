// backend/scripts/updateBuildingCareProducts.js
// Targeted script to update only Building Care and Maintenance products (Zepoxy series)
// Uses bulk operations for fast updates

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");
const { buildingCareProducts } = require('./buildingCareProductsList');

async function updateBuildingCareProducts() {
  try {
    await connect();
    console.log("📦 Starting targeted Building Care and Maintenance (Zepoxy) product update...\n");

    const bulkOperations = [];
    const existingProductsMap = new Map();

    // Fetch all existing Zepoxy products in one go
    const existingZepoxyProducts = await Product.find({ 
      "category.mainCategory": "Building Care and Maintenance",
      name: /^Zepoxy/
    });
    
    // Create a map for quick lookup: key = fullName (name + SKU + unit)
    existingZepoxyProducts.forEach(p => {
      const key = `${p.name} - ${p.sku} ${p.unit}`;
      existingProductsMap.set(key, p);
    });

    console.log(`Found ${existingZepoxyProducts.length} existing Zepoxy products in database\n`);

    // Process each product from the filtered list
    for (const productInfo of buildingCareProducts) {
      const productName = productInfo.name;
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
      console.log("No Zepoxy products to update or create.");
    }

    console.log("\n🎉 Building Care and Maintenance (Zepoxy) products update completed!");
  } catch (error) {
    console.error("❌ Bulk update failed:", error);
    process.exit(1);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  updateBuildingCareProducts()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { updateBuildingCareProducts };


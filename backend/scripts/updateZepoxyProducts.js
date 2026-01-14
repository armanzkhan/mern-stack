// backend/scripts/updateZepoxyProducts.js
// Update Zepoxy products in Epoxy Adhesives and Coatings category

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");
const { zepoxyProducts } = require("./zepoxyProductsList");

async function updateZepoxyProducts() {
  try {
    await connect();
    console.log("🔄 Updating Zepoxy products in Epoxy Adhesives and Coatings category...\n");

    const bulkOps = [];
    let processed = 0;
    let created = 0;
    let updated = 0;

    for (const productData of zepoxyProducts) {
      const fullName = `${productData.name} - ${productData.sku} ${productData.unit}`;
      
      // Find existing product by name, SKU, and category
      const existingProduct = await Product.findOne({
        name: productData.name,
        sku: productData.sku,
        "category.mainCategory": "Epoxy Adhesives and Coatings"
      });

      if (existingProduct) {
        // Update existing product
        bulkOps.push({
          updateOne: {
            filter: { _id: existingProduct._id },
            update: {
              $set: {
                name: productData.name,
                description: productData.description || productData.name,
                fullName: fullName,
                sku: productData.sku,
                unit: productData.unit,
                price: productData.price,
                category: {
                  mainCategory: "Epoxy Adhesives and Coatings",
                  subCategory: productData.category?.subCategory || null
                },
                company_id: productData.company_id || "RESSICHEM",
                stock: existingProduct.stock !== undefined ? existingProduct.stock : 0,
                updatedAt: new Date()
              }
            }
          }
        });
        updated++;
      } else {
        // Create new product
        bulkOps.push({
          insertOne: {
            document: {
              name: productData.name,
              description: productData.description || productData.name,
              fullName: fullName,
              sku: productData.sku,
              unit: productData.unit,
              price: productData.price,
              category: {
                mainCategory: "Epoxy Adhesives and Coatings",
                subCategory: productData.category?.subCategory || null
              },
              company_id: productData.company_id || "RESSICHEM",
              stock: 0,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          }
        });
        created++;
      }
      processed++;

      // Execute in batches of 100
      if (bulkOps.length >= 100) {
        await Product.bulkWrite(bulkOps, { ordered: false });
        console.log(`   Processed ${processed}/${zepoxyProducts.length} products...`);
        bulkOps.length = 0;
      }
    }

    // Execute remaining operations
    if (bulkOps.length > 0) {
      await Product.bulkWrite(bulkOps, { ordered: false });
    }

    console.log(`\n✅ Zepoxy products update completed!`);
    console.log(`   Total processed: ${processed}`);
    console.log(`   Created: ${created}`);
    console.log(`   Updated: ${updated}`);

    // Remove Zepoxy products from Building Care and Maintenance
    console.log("\n🗑️  Removing Zepoxy products from Building Care and Maintenance...");
    const deleteResult = await Product.deleteMany({
      "category.mainCategory": "Building Care and Maintenance",
      name: { $regex: /^Zepoxy/i }
    });
    console.log(`   Removed ${deleteResult.deletedCount} Zepoxy products from Building Care and Maintenance`);

    console.log("\n🎉 All Zepoxy products moved to Epoxy Adhesives and Coatings!");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  updateZepoxyProducts()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { updateZepoxyProducts };


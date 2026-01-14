// backend/scripts/updateBuildingCareProductsNew.js
// Update Building Care and Maintenance products (new list without Zepoxy)

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");
const { buildingCareProducts } = require("./buildingCareProductsList");

async function updateBuildingCareProducts() {
  try {
    await connect();
    console.log("🔄 Adding/Updating Building Care and Maintenance products...\n");
    console.log("   (Preserving existing products, adding new ones)\n");

    const bulkOps = [];
    let processed = 0;
    let created = 0;
    let updated = 0;

    for (const productData of buildingCareProducts) {
      // Check if product already exists by name, SKU, and category
      const existingProduct = await Product.findOne({
        name: productData.name,
        sku: productData.sku,
        "category.mainCategory": "Building Care and Maintenance"
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
                fullName: productData.fullName,
                sku: productData.sku,
                unit: productData.unit,
                price: productData.price,
                category: {
                  mainCategory: "Building Care and Maintenance",
                  subCategory: productData.category?.subCategory || null
                },
                company_id: productData.company_id || "RESSICHEM",
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
              fullName: productData.fullName,
              sku: productData.sku,
              unit: productData.unit,
              price: productData.price,
              category: {
                mainCategory: "Building Care and Maintenance",
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
        console.log(`   Processed ${processed}/${buildingCareProducts.length} products... (Created: ${created}, Updated: ${updated})`);
        bulkOps.length = 0;
      }
    }

    // Execute remaining operations
    if (bulkOps.length > 0) {
      await Product.bulkWrite(bulkOps, { ordered: false });
    }

    console.log(`\n✅ Building Care and Maintenance products update completed!`);
    console.log(`   Total processed: ${processed}`);
    console.log(`   Created: ${created}`);
    console.log(`   Updated: ${updated}`);
    
    // List the products
    console.log("\n📋 Products in Building Care and Maintenance:");
    for (const product of buildingCareProducts) {
      console.log(`   - ${product.name} (${product.sku} ${product.unit}) - ₹${product.price}`);
    }

    console.log("\n🎉 All done!");
  } catch (error) {
    console.error("❌ Error:", error);
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


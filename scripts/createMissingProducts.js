// backend/scripts/createMissingProducts.js
// Create missing products from CSV that don't exist in database
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

const { 
  dryMixProducts, 
  buildingCareProducts, 
  concreteAdmixturesProducts, 
  tilingProducts,
  decorativeConcreteProducts,
  specialtyProducts,
  epoxyFlooringsProducts,
  epoxyAdhesivesProducts
} = require('./fullCSVProductList');

const allCSVProducts = [
  ...dryMixProducts,
  ...buildingCareProducts,
  ...concreteAdmixturesProducts,
  ...tilingProducts,
  ...decorativeConcreteProducts,
  ...specialtyProducts,
  ...epoxyFlooringsProducts,
  ...epoxyAdhesivesProducts,
];

async function createMissingProducts() {
  try {
    await connect();
    console.log("🔍 CREATING MISSING PRODUCTS FROM CSV");
    console.log("=".repeat(80));
    console.log(`📋 CSV contains ${allCSVProducts.length} products\n`);

    let created = 0;
    let alreadyExists = 0;
    let errors = [];

    console.log("🔍 Checking and creating products...\n");

    for (const csvProduct of allCSVProducts) {
      try {
        // Check if product exists
        const existingProduct = await Product.findOne({
          name: csvProduct.dbName,
          company_id: "RESSICHEM"
        });

        if (existingProduct) {
          // Update isActive if it was deactivated
          if (!existingProduct.isActive) {
            await Product.findByIdAndUpdate(existingProduct._id, { $set: { isActive: true } });
            console.log(`✅ Reactivated: ${csvProduct.dbName}`);
          }
          alreadyExists++;
        } else {
          // Create new product
          const productData = {
            name: csvProduct.dbName,
            description: csvProduct.csvName,
            price: csvProduct.price,
            unit: csvProduct.unit,
            sku: String(csvProduct.sku),
            category: {
              mainCategory: csvProduct.category
            },
            company_id: "RESSICHEM",
            isActive: true,
            stock: 0,
            minStock: 0
          };

          await Product.create(productData);
          console.log(`✨ Created: ${csvProduct.dbName} (${csvProduct.price} PKR)`);
          created++;
        }
      } catch (error) {
        errors.push({ product: csvProduct.dbName, error: error.message });
        console.error(`❌ Error processing ${csvProduct.dbName}:`, error.message);
      }
    }

    console.log("\n" + "=".repeat(80));
    console.log("📊 CREATION SUMMARY");
    console.log("=".repeat(80));
    console.log(`✨ Created: ${created} products`);
    console.log(`✅ Already Exists: ${alreadyExists} products`);
    console.log(`❌ Errors: ${errors.length} products`);

    if (errors.length > 0) {
      console.log("\n⚠️  Errors:");
      errors.forEach(err => {
        console.log(`   - ${err.product}: ${err.error}`);
      });
    }

    await disconnect();
  } catch (error) {
    console.error("❌ Error:", error);
    await disconnect();
    process.exit(1);
  }
}

createMissingProducts();


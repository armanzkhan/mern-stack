// backend/scripts/deactivateProductsNotInCSV.js
// Deactivates all products that are not in the CSV list
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

async function deactivateProductsNotInCSV() {
  try {
    await connect();
    console.log("🔍 DEACTIVATING PRODUCTS NOT IN CSV");
    console.log("=".repeat(80));
    
    // Get all CSV product names
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
    
    const csvProductNames = new Set(allCSVProducts.map(p => p.dbName));
    console.log(`📋 CSV contains ${csvProductNames.size} products\n`);
    
    // Get all active products from database
    const allProducts = await Product.find({
      company_id: "RESSICHEM",
      isActive: true
    });
    
    console.log(`📦 Database contains ${allProducts.length} active products\n`);
    
    let deactivated = 0;
    let keptActive = 0;
    
    console.log("🔍 Checking products...\n");
    
    for (const product of allProducts) {
      if (csvProductNames.has(product.name)) {
        keptActive++;
      } else {
        await Product.findByIdAndUpdate(product._id, { $set: { isActive: false } });
        console.log(`❌ Deactivated: ${product.name}`);
        deactivated++;
      }
    }
    
    console.log("\n" + "=".repeat(80));
    console.log("📊 DEACTIVATION SUMMARY");
    console.log("=".repeat(80));
    console.log(`✅ Kept Active: ${keptActive} products`);
    console.log(`❌ Deactivated: ${deactivated} products`);
    console.log(`📋 Total in CSV: ${csvProductNames.size} products`);
    
    await disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    await disconnect();
    process.exit(1);
  }
}

deactivateProductsNotInCSV();


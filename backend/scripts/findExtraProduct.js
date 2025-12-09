// backend/scripts/findExtraProduct.js
// Find the product that's in database but not in CSV
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

async function findExtraProduct() {
  try {
    await connect();
    console.log("🔍 FINDING EXTRA PRODUCT IN DATABASE");
    console.log("=".repeat(80));
    
    const csvProductNames = new Set(allCSVProducts.map(p => p.dbName));
    console.log(`📋 CSV contains ${csvProductNames.size} products\n`);
    
    const allActiveProducts = await Product.find({
      company_id: "RESSICHEM",
      isActive: true
    });
    
    console.log(`📦 Database contains ${allActiveProducts.length} active products\n`);
    console.log("🔍 Products not in CSV:\n");
    
    let found = 0;
    for (const product of allActiveProducts) {
      if (!csvProductNames.has(product.name)) {
        console.log(`❌ Not in CSV: ${product.name} (Price: ${product.price}, Category: ${product.category?.mainCategory || 'N/A'})`);
        found++;
      }
    }
    
    if (found === 0) {
      console.log("✅ All active products are in CSV!");
    }
    
    await disconnect();
  } catch (error) {
    console.error("❌ Error:", error);
    await disconnect();
    process.exit(1);
  }
}

findExtraProduct();


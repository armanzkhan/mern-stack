// backend/scripts/completeCSVVerification.js
// Complete CSV verification - parses and verifies ALL products from CSV
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

// Comprehensive product list from CSV
// Import from full product list file
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

// Combine all products
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

async function completeVerification() {
  try {
    await connect();
    console.log("🔍 COMPLETE CSV VERIFICATION");
    console.log("=".repeat(80));
    console.log(`📋 Verifying ${allCSVProducts.length} products from CSV\n`);
    
    const results = {
      exactMatch: 0,
      priceMismatch: [],
      skuMismatch: [],
      unitMismatch: [],
      categoryMismatch: [],
      missing: [],
      needsUpdate: []
    };
    
    for (const csvProduct of allCSVProducts) {
      const dbProduct = await Product.findOne({
        name: csvProduct.dbName,
        company_id: "RESSICHEM"
      });
      
      if (!dbProduct) {
        results.missing.push(csvProduct);
      } else {
        let hasMismatch = false;
        const mismatches = [];
        
        if (Math.abs(dbProduct.price - csvProduct.price) > 0.01) {
          mismatches.push({ field: "price", db: dbProduct.price, csv: csvProduct.price });
          hasMismatch = true;
        }
        if (String(dbProduct.sku) !== String(csvProduct.sku)) {
          mismatches.push({ field: "sku", db: dbProduct.sku, csv: csvProduct.sku });
          hasMismatch = true;
        }
        if (dbProduct.unit !== csvProduct.unit) {
          mismatches.push({ field: "unit", db: dbProduct.unit, csv: csvProduct.unit });
          hasMismatch = true;
        }
        if (dbProduct.category?.mainCategory !== csvProduct.category) {
          mismatches.push({ field: "category", db: dbProduct.category?.mainCategory, csv: csvProduct.category });
          hasMismatch = true;
        }
        
        if (hasMismatch) {
          results.needsUpdate.push({
            name: csvProduct.dbName,
            mismatches
          });
        } else {
          results.exactMatch++;
        }
      }
    }
    
    console.log("=".repeat(80));
    console.log("📊 VERIFICATION RESULTS");
    console.log("=".repeat(80));
    console.log(`✅ Exact Matches: ${results.exactMatch}`);
    console.log(`⚠️  Needs Update: ${results.needsUpdate.length}`);
    console.log(`❌ Missing: ${results.missing.length}`);
    
    if (results.needsUpdate.length > 0) {
      console.log("\n⚠️  PRODUCTS NEEDING UPDATE (first 20):");
      results.needsUpdate.slice(0, 20).forEach((p, i) => {
        console.log(`\n${i + 1}. ${p.name}`);
        p.mismatches.forEach(m => {
          console.log(`   ${m.field}: ${m.db} → ${m.csv}`);
        });
      });
      if (results.needsUpdate.length > 20) {
        console.log(`\n... and ${results.needsUpdate.length - 20} more products needing update`);
      }
    }
    
    if (results.missing.length > 0) {
      console.log("\n❌ MISSING PRODUCTS (first 20):");
      results.missing.slice(0, 20).forEach((p, i) => {
        console.log(`${i + 1}. ${p.dbName} | ${p.price} PKR | ${p.category}`);
      });
      if (results.missing.length > 20) {
        console.log(`\n... and ${results.missing.length - 20} more missing products`);
      }
    }
    
    await disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    await disconnect();
    process.exit(1);
  }
}

completeVerification();

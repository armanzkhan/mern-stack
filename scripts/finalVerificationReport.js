// backend/scripts/finalVerificationReport.js
// Final comprehensive verification report
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

async function generateFinalReport() {
  try {
    await connect();
    console.log("=".repeat(80));
    console.log("📊 FINAL VERIFICATION REPORT");
    console.log("=".repeat(80));
    console.log(`Date: ${new Date().toLocaleString()}\n`);

    // Get database stats
    const allActiveProducts = await Product.find({
      company_id: "RESSICHEM",
      isActive: true
    });

    const allInactiveProducts = await Product.find({
      company_id: "RESSICHEM",
      isActive: false
    });

    // Category breakdown
    const categoryCounts = {};
    allActiveProducts.forEach(p => {
      const cat = p.category?.mainCategory || 'Uncategorized';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    // CSV category breakdown
    const csvCategoryCounts = {};
    allCSVProducts.forEach(p => {
      csvCategoryCounts[p.category] = (csvCategoryCounts[p.category] || 0) + 1;
    });

    console.log("📋 CSV PRODUCT SUMMARY");
    console.log("-".repeat(80));
    console.log(`Total Products in CSV: ${allCSVProducts.length}`);
    console.log("\nCategory Breakdown:");
    Object.entries(csvCategoryCounts).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
      console.log(`  • ${cat}: ${count} products`);
    });

    console.log("\n📦 DATABASE SUMMARY");
    console.log("-".repeat(80));
    console.log(`Active Products: ${allActiveProducts.length}`);
    console.log(`Inactive Products: ${allInactiveProducts.length}`);
    console.log(`Total Products: ${allActiveProducts.length + allInactiveProducts.length}`);

    console.log("\nCategory Breakdown (Active Products):");
    Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
      console.log(`  • ${cat}: ${count} products`);
    });

    // Verification
    console.log("\n✅ VERIFICATION STATUS");
    console.log("-".repeat(80));
    
    const csvProductNames = new Set(allCSVProducts.map(p => p.dbName));
    const dbProductNames = new Set(allActiveProducts.map(p => p.name));
    
    let exactMatches = 0;
    let priceMismatches = 0;
    let skuMismatches = 0;
    let unitMismatches = 0;
    let categoryMismatches = 0;

    for (const csvProduct of allCSVProducts) {
      const dbProduct = allActiveProducts.find(p => p.name === csvProduct.dbName);
      if (dbProduct) {
        let isExactMatch = true;
        
        if (Math.abs(dbProduct.price - csvProduct.price) > 0.01) {
          priceMismatches++;
          isExactMatch = false;
        }
        if (String(dbProduct.sku) !== String(csvProduct.sku)) {
          skuMismatches++;
          isExactMatch = false;
        }
        if (dbProduct.unit !== csvProduct.unit) {
          unitMismatches++;
          isExactMatch = false;
        }
        if (dbProduct.category?.mainCategory !== csvProduct.category) {
          categoryMismatches++;
          isExactMatch = false;
        }
        
        if (isExactMatch) {
          exactMatches++;
        }
      }
    }

    const missingInDB = allCSVProducts.filter(p => !dbProductNames.has(p.dbName)).length;
    const extraInDB = allActiveProducts.filter(p => !csvProductNames.has(p.name)).length;

    console.log(`✅ Exact Matches: ${exactMatches}/${allCSVProducts.length} (${((exactMatches/allCSVProducts.length)*100).toFixed(2)}%)`);
    console.log(`⚠️  Price Mismatches: ${priceMismatches}`);
    console.log(`⚠️  SKU Mismatches: ${skuMismatches}`);
    console.log(`⚠️  Unit Mismatches: ${unitMismatches}`);
    console.log(`⚠️  Category Mismatches: ${categoryMismatches}`);
    console.log(`❌ Missing in DB: ${missingInDB}`);
    console.log(`❌ Extra in DB: ${extraInDB}`);

    // Final status
    console.log("\n" + "=".repeat(80));
    const totalIssues = priceMismatches + skuMismatches + unitMismatches + categoryMismatches + missingInDB + extraInDB;
    
    if (totalIssues === 0 && exactMatches === allCSVProducts.length) {
      console.log("🎉 PERFECT! All products match exactly between CSV and Database.");
      console.log("✅ Database is fully synchronized with CSV.");
      console.log("✅ All 888 products are active and verified.");
    } else {
      console.log(`⚠️  ${totalIssues} issue(s) found. Please review and fix.`);
    }
    console.log("=".repeat(80));

    // Price statistics
    const prices = allActiveProducts.map(p => p.price).filter(p => p > 0);
    if (prices.length > 0) {
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      
      console.log("\n💰 PRICE STATISTICS");
      console.log("-".repeat(80));
      console.log(`Minimum Price: ${minPrice.toLocaleString()} PKR`);
      console.log(`Maximum Price: ${maxPrice.toLocaleString()} PKR`);
      console.log(`Average Price: ${Math.round(avgPrice).toLocaleString()} PKR`);
    }

    await disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    await disconnect();
    process.exit(1);
  }
}

generateFinalReport();


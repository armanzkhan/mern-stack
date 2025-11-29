// backend/scripts/finalCategoryBreakdown.js
// Final category breakdown verification
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

async function finalCategoryBreakdown() {
  try {
    await connect();
    console.log("=".repeat(80));
    console.log("📊 FINAL CATEGORY BREAKDOWN VERIFICATION");
    console.log("=".repeat(80));

    // CSV breakdown
    const csvByCategory = {};
    allCSVProducts.forEach(p => {
      csvByCategory[p.category] = (csvByCategory[p.category] || 0) + 1;
    });

    console.log("\n📋 CSV PRODUCTS BY CATEGORY:");
    console.log("-".repeat(80));
    Object.entries(csvByCategory).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count} products`);
    });
    console.log(`\n  Total CSV Products: ${allCSVProducts.length}`);

    // Database breakdown
    const activeProducts = await Product.find({
      company_id: "RESSICHEM",
      isActive: true
    });

    const dbByCategory = {};
    activeProducts.forEach(p => {
      const cat = p.category?.mainCategory || 'Uncategorized';
      dbByCategory[cat] = (dbByCategory[cat] || 0) + 1;
    });

    console.log("\n📦 DATABASE ACTIVE PRODUCTS BY CATEGORY:");
    console.log("-".repeat(80));
    Object.entries(dbByCategory).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count} products`);
    });
    console.log(`\n  Total Active Products: ${activeProducts.length}`);

    // Compare
    console.log("\n✅ COMPARISON:");
    console.log("-".repeat(80));
    let allMatch = true;
    for (const [csvCat, csvCount] of Object.entries(csvByCategory)) {
      const dbCount = dbByCategory[csvCat] || 0;
      const match = csvCount === dbCount ? "✅" : "❌";
      if (csvCount !== dbCount) allMatch = false;
      console.log(`  ${match} ${csvCat}: CSV=${csvCount}, DB=${dbCount}`);
    }

    // Check for any extra categories in DB
    const extraCategories = Object.keys(dbByCategory).filter(cat => !csvByCategory[cat]);
    if (extraCategories.length > 0) {
      console.log("\n⚠️  Extra Categories in Database (not in CSV):");
      extraCategories.forEach(cat => {
        console.log(`  - ${cat}: ${dbByCategory[cat]} products`);
      });
    }

    console.log("\n" + "=".repeat(80));
    if (allMatch && activeProducts.length === allCSVProducts.length) {
      console.log("🎉 PERFECT MATCH! All categories and products match exactly.");
    } else {
      console.log("⚠️  Some discrepancies found. Please review above.");
    }
    console.log("=".repeat(80));

    await disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    await disconnect();
    process.exit(1);
  }
}

finalCategoryBreakdown();


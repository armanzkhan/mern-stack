// backend/scripts/compareImportScriptWithCSV.js
// Compare import script with CSV to ensure they match
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

// Import productData from import script
const importScript = require('./importProductsFromExcel.js');
// Note: We need to extract productData differently since it's not exported
// Let's read the file directly
const fs = require('fs');
const path = require('path');
const importScriptContent = fs.readFileSync(path.join(__dirname, 'importProductsFromExcel.js'), 'utf8');

// Extract productData array (simplified - we'll compare via database instead)
async function compareImportWithCSV() {
  try {
    await connect();
    console.log("🔍 COMPARING IMPORT SCRIPT WITH CSV");
    console.log("=".repeat(80));
    console.log(`📋 CSV contains ${allCSVProducts.length} products\n`);

    // Get all active products from database (which should match import script after running it)
    const dbProducts = await Product.find({
      company_id: "RESSICHEM",
      isActive: true
    });

    console.log(`📦 Database contains ${dbProducts.length} active products\n`);

    // Create lookup maps
    const csvMap = new Map();
    allCSVProducts.forEach(p => {
      csvMap.set(p.dbName, p);
    });

    const dbMap = new Map();
    dbProducts.forEach(p => {
      dbMap.set(p.name, p);
    });

    // Compare
    const results = {
      inCSVNotInDB: [],
      inDBNotInCSV: [],
      priceMismatch: [],
      skuMismatch: [],
      unitMismatch: [],
      categoryMismatch: [],
      exactMatch: 0
    };

    // Check CSV products against DB
    for (const csvProduct of allCSVProducts) {
      const dbProduct = dbMap.get(csvProduct.dbName);
      
      if (!dbProduct) {
        results.inCSVNotInDB.push(csvProduct);
      } else {
        let isExactMatch = true;
        
        if (Math.abs(dbProduct.price - csvProduct.price) > 0.01) {
          results.priceMismatch.push({
            name: csvProduct.dbName,
            csv: csvProduct.price,
            db: dbProduct.price
          });
          isExactMatch = false;
        }
        
        if (String(dbProduct.sku) !== String(csvProduct.sku)) {
          results.skuMismatch.push({
            name: csvProduct.dbName,
            csv: csvProduct.sku,
            db: dbProduct.sku
          });
          isExactMatch = false;
        }
        
        if (dbProduct.unit !== csvProduct.unit) {
          results.unitMismatch.push({
            name: csvProduct.dbName,
            csv: csvProduct.unit,
            db: dbProduct.unit
          });
          isExactMatch = false;
        }
        
        if (dbProduct.category?.mainCategory !== csvProduct.category) {
          results.categoryMismatch.push({
            name: csvProduct.dbName,
            csv: csvProduct.category,
            db: dbProduct.category?.mainCategory
          });
          isExactMatch = false;
        }
        
        if (isExactMatch) {
          results.exactMatch++;
        }
      }
    }

    // Check DB products not in CSV
    for (const dbProduct of dbProducts) {
      if (!csvMap.has(dbProduct.name)) {
        results.inDBNotInCSV.push({
          name: dbProduct.name,
          price: dbProduct.price,
          category: dbProduct.category?.mainCategory
        });
      }
    }

    // Print results
    console.log("=".repeat(80));
    console.log("📊 COMPARISON RESULTS");
    console.log("=".repeat(80));
    console.log(`✅ Exact Matches: ${results.exactMatch}`);
    console.log(`⚠️  Price Mismatches: ${results.priceMismatch.length}`);
    console.log(`⚠️  SKU Mismatches: ${results.skuMismatch.length}`);
    console.log(`⚠️  Unit Mismatches: ${results.unitMismatch.length}`);
    console.log(`⚠️  Category Mismatches: ${results.categoryMismatch.length}`);
    console.log(`❌ In CSV but not in DB: ${results.inCSVNotInDB.length}`);
    console.log(`❌ In DB but not in CSV: ${results.inDBNotInCSV.length}`);

    if (results.priceMismatch.length > 0) {
      console.log("\n⚠️  PRICE MISMATCHES (first 10):");
      results.priceMismatch.slice(0, 10).forEach((p, i) => {
        console.log(`${i + 1}. ${p.name}: CSV=${p.csv}, DB=${p.db}`);
      });
    }

    if (results.skuMismatch.length > 0) {
      console.log("\n⚠️  SKU MISMATCHES (first 10):");
      results.skuMismatch.slice(0, 10).forEach((p, i) => {
        console.log(`${i + 1}. ${p.name}: CSV=${p.csv}, DB=${p.db}`);
      });
    }

    if (results.categoryMismatch.length > 0) {
      console.log("\n⚠️  CATEGORY MISMATCHES (first 10):");
      results.categoryMismatch.slice(0, 10).forEach((p, i) => {
        console.log(`${i + 1}. ${p.name}: CSV=${p.csv}, DB=${p.db}`);
      });
    }

    if (results.inCSVNotInDB.length > 0) {
      console.log("\n❌ IN CSV BUT NOT IN DB (first 10):");
      results.inCSVNotInDB.slice(0, 10).forEach((p, i) => {
        console.log(`${i + 1}. ${p.dbName} (${p.price} PKR, ${p.category})`);
      });
    }

    if (results.inDBNotInCSV.length > 0) {
      console.log("\n❌ IN DB BUT NOT IN CSV (first 10):");
      results.inDBNotInCSV.slice(0, 10).forEach((p, i) => {
        console.log(`${i + 1}. ${p.name} (${p.price} PKR, ${p.category})`);
      });
    }

    // Summary
    const totalIssues = results.priceMismatch.length + 
                       results.skuMismatch.length + 
                       results.unitMismatch.length + 
                       results.categoryMismatch.length + 
                       results.inCSVNotInDB.length + 
                       results.inDBNotInCSV.length;

    console.log("\n" + "=".repeat(80));
    if (totalIssues === 0) {
      console.log("✅ PERFECT MATCH! All products match between CSV and Database.");
    } else {
      console.log(`⚠️  Total Issues Found: ${totalIssues}`);
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

compareImportWithCSV();


// backend/scripts/verifyExactMatchWithImportScript.js
// Verifies that ALL products from import script match exactly with database
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");
const fs = require('fs');
const path = require('path');

async function verifyExactMatch() {
  try {
    await connect();
    console.log("🔍 EXACT MATCH VERIFICATION");
    console.log("=".repeat(80));
    console.log("Comparing import script products with database\n");
    
    // Read import script
    const importScriptPath = path.join(__dirname, 'importProductsFromExcel.js');
    const importScriptContent = fs.readFileSync(importScriptPath, 'utf8');
    
    // Extract product data - look for the productData array
    // Find the productData array content
    const productDataStart = importScriptContent.indexOf('const productData = [');
    const productDataEnd = importScriptContent.indexOf('];', productDataStart);
    
    if (productDataStart === -1 || productDataEnd === -1) {
      console.error("❌ Could not find productData array in import script");
      await disconnect();
      process.exit(1);
    }
    
    // Extract product entries using regex
    const productPattern = /\{\s*name:\s*["']([^"']+)["'],\s*unit:\s*["']([^"']+)["'],\s*sku:\s*([\d.]+),\s*price:\s*([\d.]+),\s*category:\s*\{\s*mainCategory:\s*["']([^"']+)["']/g;
    const products = [];
    let match;
    
    while ((match = productPattern.exec(importScriptContent)) !== null) {
      products.push({
        name: match[1],
        unit: match[2],
        sku: parseFloat(match[3]),
        price: parseFloat(match[4]),
        category: match[5]
      });
    }
    
    console.log(`📋 Found ${products.length} products in import script\n`);
    
    const results = {
      exactMatch: 0,
      missing: [],
      skuMismatch: [],
      priceMismatch: [],
      unitMismatch: [],
      categoryMismatch: []
    };
    
    // Verify each product
    for (const importProduct of products) {
      const fullName = `${importProduct.name} - ${importProduct.sku} ${importProduct.unit}`;
      
      const dbProduct = await Product.findOne({
        name: fullName,
        company_id: "RESSICHEM"
      });
      
      if (!dbProduct) {
        results.missing.push({
          name: fullName,
          expectedSKU: importProduct.sku,
          expectedPrice: importProduct.price,
          expectedUnit: importProduct.unit,
          expectedCategory: importProduct.category
        });
        continue;
      }
      
      // Check all fields
      let hasMismatch = false;
      
      // Check SKU
      const dbSKU = parseFloat(dbProduct.sku);
      if (Math.abs(dbSKU - importProduct.sku) > 0.001) {
        results.skuMismatch.push({
          name: fullName,
          expectedSKU: importProduct.sku,
          foundSKU: dbSKU
        });
        hasMismatch = true;
      }
      
      // Check Price
      const priceDiff = Math.abs(dbProduct.price - importProduct.price);
      if (priceDiff > 0.01) {
        results.priceMismatch.push({
          name: fullName,
          expectedPrice: importProduct.price,
          foundPrice: dbProduct.price,
          difference: priceDiff
        });
        hasMismatch = true;
      }
      
      // Check Unit
      if (dbProduct.unit !== importProduct.unit) {
        results.unitMismatch.push({
          name: fullName,
          expectedUnit: importProduct.unit,
          foundUnit: dbProduct.unit
        });
        hasMismatch = true;
      }
      
      // Check Category
      const dbCategory = dbProduct.category?.mainCategory || '';
      if (dbCategory !== importProduct.category) {
        results.categoryMismatch.push({
          name: fullName,
          expectedCategory: importProduct.category,
          foundCategory: dbCategory
        });
        hasMismatch = true;
      }
      
      if (!hasMismatch) {
        results.exactMatch++;
      }
    }
    
    // Generate report
    console.log("=".repeat(80));
    console.log("📊 VERIFICATION RESULTS");
    console.log("=".repeat(80));
    console.log(`Total products in import script: ${products.length}`);
    console.log(`✅ Exact Matches: ${results.exactMatch} (${((results.exactMatch / products.length) * 100).toFixed(2)}%)`);
    console.log(`❌ Missing from database: ${results.missing.length}`);
    console.log(`⚠️  SKU Mismatches: ${results.skuMismatch.length}`);
    console.log(`⚠️  Price Mismatches: ${results.priceMismatch.length}`);
    console.log(`⚠️  Unit Mismatches: ${results.unitMismatch.length}`);
    console.log(`⚠️  Category Mismatches: ${results.categoryMismatch.length}`);
    
    // Show issues
    if (results.missing.length > 0) {
      console.log("\n" + "=".repeat(80));
      console.log("❌ MISSING PRODUCTS (first 10)");
      console.log("=".repeat(80));
      results.missing.slice(0, 10).forEach((p, i) => {
        console.log(`${i + 1}. ${p.name}`);
      });
      if (results.missing.length > 10) {
        console.log(`... and ${results.missing.length - 10} more`);
      }
    }
    
    if (results.priceMismatch.length > 0) {
      console.log("\n" + "=".repeat(80));
      console.log("⚠️  PRICE MISMATCHES (first 10)");
      console.log("=".repeat(80));
      results.priceMismatch.slice(0, 10).forEach((p, i) => {
        console.log(`${i + 1}. ${p.name}`);
        console.log(`   Expected: ${p.expectedPrice}, Found: ${p.foundPrice}, Diff: ${p.difference.toFixed(2)}`);
      });
      if (results.priceMismatch.length > 10) {
        console.log(`... and ${results.priceMismatch.length - 10} more`);
      }
    }
    
    if (results.skuMismatch.length > 0) {
      console.log("\n" + "=".repeat(80));
      console.log("⚠️  SKU MISMATCHES (first 10)");
      console.log("=".repeat(80));
      results.skuMismatch.slice(0, 10).forEach((p, i) => {
        console.log(`${i + 1}. ${p.name}`);
        console.log(`   Expected: ${p.expectedSKU}, Found: ${p.foundSKU}`);
      });
      if (results.skuMismatch.length > 10) {
        console.log(`... and ${results.skuMismatch.length - 10} more`);
      }
    }
    
    if (results.unitMismatch.length > 0) {
      console.log("\n" + "=".repeat(80));
      console.log("⚠️  UNIT MISMATCHES (first 10)");
      console.log("=".repeat(80));
      results.unitMismatch.slice(0, 10).forEach((p, i) => {
        console.log(`${i + 1}. ${p.name}`);
        console.log(`   Expected: ${p.expectedUnit}, Found: ${p.foundUnit}`);
      });
      if (results.unitMismatch.length > 10) {
        console.log(`... and ${results.unitMismatch.length - 10} more`);
      }
    }
    
    if (results.categoryMismatch.length > 0) {
      console.log("\n" + "=".repeat(80));
      console.log("⚠️  CATEGORY MISMATCHES (first 10)");
      console.log("=".repeat(80));
      results.categoryMismatch.slice(0, 10).forEach((p, i) => {
        console.log(`${i + 1}. ${p.name}`);
        console.log(`   Expected: ${p.expectedCategory}, Found: ${p.foundCategory}`);
      });
      if (results.categoryMismatch.length > 10) {
        console.log(`... and ${results.categoryMismatch.length - 10} more`);
      }
    }
    
    // Final summary
    console.log("\n" + "=".repeat(80));
    console.log("📋 FINAL SUMMARY");
    console.log("=".repeat(80));
    
    const totalIssues = results.missing.length + 
                        results.skuMismatch.length + 
                        results.priceMismatch.length + 
                        results.unitMismatch.length + 
                        results.categoryMismatch.length;
    
    if (totalIssues === 0) {
      console.log("✅ PERFECT MATCH!");
      console.log("   All products from import script match exactly with database:");
      console.log("   ✅ All SKUs match");
      console.log("   ✅ All prices match");
      console.log("   ✅ All units match");
      console.log("   ✅ All categories match");
      console.log(`\n🎉 ${results.exactMatch} products verified successfully!`);
    } else {
      console.log(`⚠️  Found ${totalIssues} mismatches that need attention.`);
    }
    
    await disconnect();
    process.exit(totalIssues === 0 ? 0 : 1);
  } catch (error) {
    console.error("❌ Error during verification:", error);
    await disconnect();
    process.exit(1);
  }
}

verifyExactMatch();


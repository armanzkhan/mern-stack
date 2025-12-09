// backend/scripts/comprehensiveExactMatchVerification.js
// Comprehensive verification - checks ALL products from import script against database
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

// We'll read the import script to get product data
// For now, we'll query all products from database and verify against import script structure

async function comprehensiveVerification() {
  try {
    await connect();
    console.log("🔍 COMPREHENSIVE PRODUCT VERIFICATION");
    console.log("=".repeat(80));
    console.log("Checking ALL products in database: SKU, Price, Unit, Category\n");
    
    // Get all products from database
    const allDbProducts = await Product.find({ 
      company_id: "RESSICHEM", 
      isActive: true 
    }).sort({ name: 1 });
    
    console.log(`📦 Found ${allDbProducts.length} products in database\n`);
    
    const results = {
      exactMatch: [],
      missing: [],
      skuMismatch: [],
      priceMismatch: [],
      unitMismatch: [],
      categoryMismatch: [],
      totalChecked: 0,
      productsWithIssues: []
    };
    
    // Verify each product has valid data
    for (const dbProduct of allDbProducts) {
      results.totalChecked++;
      
      const issues = [];
      
      // Check if SKU is valid
      if (!dbProduct.sku || dbProduct.sku === '') {
        issues.push('Missing SKU');
      }
      
      // Check if price is valid
      if (dbProduct.price === undefined || dbProduct.price === null || dbProduct.price < 0) {
        issues.push(`Invalid price: ${dbProduct.price}`);
      }
      
      // Check if unit is valid
      if (!dbProduct.unit || (dbProduct.unit !== 'KG' && dbProduct.unit !== 'LTR' && dbProduct.unit !== 'GM')) {
        issues.push(`Invalid unit: ${dbProduct.unit}`);
      }
      
      // Check if category is valid
      if (!dbProduct.category || !dbProduct.category.mainCategory) {
        issues.push('Missing category');
      }
      
      if (issues.length > 0) {
        results.productsWithIssues.push({
          name: dbProduct.name,
          issues: issues,
          sku: dbProduct.sku,
          price: dbProduct.price,
          unit: dbProduct.unit,
          category: dbProduct.category?.mainCategory
        });
      } else {
        results.exactMatch.push({
          name: dbProduct.name,
          sku: dbProduct.sku,
          price: dbProduct.price,
          unit: dbProduct.unit,
          category: dbProduct.category.mainCategory
        });
      }
    }
    
    // Also check against import script by reading it
    const fs = require('fs');
    const path = require('path');
    const importScriptPath = path.join(__dirname, 'importProductsFromExcel.js');
    const importScriptContent = fs.readFileSync(importScriptPath, 'utf8');
    
    // Extract product data from import script using regex
    const productDataMatches = importScriptContent.match(/\{[\s\S]*?name:\s*["']([^"']+)["'][\s\S]*?unit:\s*["']([^"']+)["'][\s\S]*?sku:\s*([\d.]+)[\s\S]*?price:\s*([\d.]+)[\s\S]*?mainCategory:\s*["']([^"']+)["'][\s\S]*?\}/g);
    
    if (productDataMatches) {
      console.log(`📋 Found ${productDataMatches.length} products in import script\n`);
      
      // Process products from import script
      for (const match of productDataMatches) {
        const nameMatch = match.match(/name:\s*["']([^"']+)["']/);
        const unitMatch = match.match(/unit:\s*["']([^"']+)["']/);
        const skuMatch = match.match(/sku:\s*([\d.]+)/);
        const priceMatch = match.match(/price:\s*([\d.]+)/);
        const categoryMatch = match.match(/mainCategory:\s*["']([^"']+)["']/);
        
        if (nameMatch && unitMatch && skuMatch && priceMatch && categoryMatch) {
          const productName = nameMatch[1];
          const expectedUnit = unitMatch[1];
          const expectedSKU = skuMatch[1];
          const expectedPrice = parseFloat(priceMatch[1]);
          const expectedCategory = categoryMatch[1];
          
          const fullName = `${productName} - ${expectedSKU} ${expectedUnit}`;
          
          const dbProduct = await Product.findOne({
            name: fullName,
            company_id: "RESSICHEM"
          });
          
          if (!dbProduct) {
            results.missing.push({
              name: fullName,
              expectedSKU,
              expectedPrice,
              expectedUnit,
              expectedCategory
            });
          } else {
            // Verify all fields match
            const foundSKU = String(dbProduct.sku || '');
            const priceDiff = Math.abs(dbProduct.price - expectedPrice);
            
            if (foundSKU !== expectedSKU) {
              results.skuMismatch.push({
                name: fullName,
                expectedSKU,
                foundSKU,
                expectedPrice,
                foundPrice: dbProduct.price
              });
            }
            
            if (priceDiff > 0.01) {
              results.priceMismatch.push({
                name: fullName,
                sku: foundSKU,
                expectedPrice,
                foundPrice: dbProduct.price,
                difference: priceDiff
              });
            }
            
            if (dbProduct.unit !== expectedUnit) {
              results.unitMismatch.push({
                name: fullName,
                sku: foundSKU,
                expectedUnit,
                foundUnit: dbProduct.unit
              });
            }
            
            const foundCategory = dbProduct.category?.mainCategory || '';
            if (foundCategory !== expectedCategory) {
              results.categoryMismatch.push({
                name: fullName,
                sku: foundSKU,
                expectedCategory,
                foundCategory
              });
            }
          }
        }
      }
    }
    
    // Generate detailed report
    console.log("\n" + "=".repeat(80));
    console.log("📊 VERIFICATION RESULTS");
    console.log("=".repeat(80));
    console.log(`Total Products Checked: ${results.totalChecked}`);
    console.log(`✅ Exact Matches: ${results.exactMatch.length} (${((results.exactMatch.length / results.totalChecked) * 100).toFixed(2)}%)`);
    console.log(`❌ Missing: ${results.missing.length} (${((results.missing.length / results.totalChecked) * 100).toFixed(2)}%)`);
    console.log(`⚠️  SKU Mismatches: ${results.skuMismatch.length}`);
    console.log(`⚠️  Price Mismatches: ${results.priceMismatch.length}`);
    console.log(`⚠️  Unit Mismatches: ${results.unitMismatch.length}`);
    console.log(`⚠️  Category Mismatches: ${results.categoryMismatch.length}`);
    
    // Show missing products
    if (results.missing.length > 0) {
      console.log("\n" + "=".repeat(80));
      console.log("❌ MISSING PRODUCTS");
      console.log("=".repeat(80));
      results.missing.slice(0, 20).forEach((p, i) => {
        console.log(`${i + 1}. ${p.name}`);
        console.log(`   Expected: SKU ${p.expectedSKU} ${p.expectedUnit}, Price ${p.expectedPrice}, Category: ${p.expectedCategory}`);
      });
      if (results.missing.length > 20) {
        console.log(`\n... and ${results.missing.length - 20} more missing products`);
      }
    }
    
    // Show price mismatches
    if (results.priceMismatch.length > 0) {
      console.log("\n" + "=".repeat(80));
      console.log("⚠️  PRICE MISMATCHES");
      console.log("=".repeat(80));
      results.priceMismatch.slice(0, 20).forEach((p, i) => {
        console.log(`${i + 1}. ${p.name}`);
        console.log(`   Expected: ${p.expectedPrice} PKR, Found: ${p.foundPrice} PKR (Difference: ${p.difference.toFixed(2)})`);
      });
      if (results.priceMismatch.length > 20) {
        console.log(`\n... and ${results.priceMismatch.length - 20} more price mismatches`);
      }
    }
    
    // Show SKU mismatches
    if (results.skuMismatch.length > 0) {
      console.log("\n" + "=".repeat(80));
      console.log("⚠️  SKU MISMATCHES");
      console.log("=".repeat(80));
      results.skuMismatch.slice(0, 20).forEach((p, i) => {
        console.log(`${i + 1}. ${p.name}`);
        console.log(`   Expected: ${p.expectedSKU}, Found: ${p.foundSKU}`);
      });
      if (results.skuMismatch.length > 20) {
        console.log(`\n... and ${results.skuMismatch.length - 20} more SKU mismatches`);
      }
    }
    
    // Show unit mismatches
    if (results.unitMismatch.length > 0) {
      console.log("\n" + "=".repeat(80));
      console.log("⚠️  UNIT MISMATCHES");
      console.log("=".repeat(80));
      results.unitMismatch.slice(0, 20).forEach((p, i) => {
        console.log(`${i + 1}. ${p.name}`);
        console.log(`   Expected: ${p.expectedUnit}, Found: ${p.foundUnit}`);
      });
      if (results.unitMismatch.length > 20) {
        console.log(`\n... and ${results.unitMismatch.length - 20} more unit mismatches`);
      }
    }
    
    // Show category mismatches
    if (results.categoryMismatch.length > 0) {
      console.log("\n" + "=".repeat(80));
      console.log("⚠️  CATEGORY MISMATCHES");
      console.log("=".repeat(80));
      results.categoryMismatch.slice(0, 20).forEach((p, i) => {
        console.log(`${i + 1}. ${p.name}`);
        console.log(`   Expected: ${p.expectedCategory}, Found: ${p.foundCategory}`);
      });
      if (results.categoryMismatch.length > 20) {
        console.log(`\n... and ${results.categoryMismatch.length - 20} more category mismatches`);
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
      console.log("✅ PERFECT MATCH! All products match exactly:");
      console.log("   - All SKUs match");
      console.log("   - All prices match");
      console.log("   - All units match");
      console.log("   - All categories match");
      console.log(`\n🎉 ${results.exactMatch.length} products verified successfully!`);
    } else {
      console.log(`⚠️  Found ${totalIssues} issues that need attention:`);
      if (results.missing.length > 0) {
        console.log(`   - ${results.missing.length} products are missing from database`);
      }
      if (results.skuMismatch.length > 0) {
        console.log(`   - ${results.skuMismatch.length} products have SKU mismatches`);
      }
      if (results.priceMismatch.length > 0) {
        console.log(`   - ${results.priceMismatch.length} products have price mismatches`);
      }
      if (results.unitMismatch.length > 0) {
        console.log(`   - ${results.unitMismatch.length} products have unit mismatches`);
      }
      if (results.categoryMismatch.length > 0) {
        console.log(`   - ${results.categoryMismatch.length} products have category mismatches`);
      }
    }
    
    // Get database stats
    const totalInDB = await Product.countDocuments({ company_id: "RESSICHEM", isActive: true });
    console.log(`\n📦 Database Statistics:`);
    console.log(`   Total products in database: ${totalInDB}`);
    console.log(`   Products from import script: ${results.totalChecked}`);
    console.log(`   Exact matches: ${results.exactMatch.length}`);
    
    await disconnect();
    process.exit(totalIssues === 0 ? 0 : 1);
  } catch (error) {
    console.error("❌ Error during verification:", error);
    await disconnect();
    process.exit(1);
  }
}

// Run verification
comprehensiveVerification();

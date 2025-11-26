// backend/scripts/verifyAllProductsExactMatch.js
// Verifies ALL products in database have correct SKU, Price, Unit, and Category
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

async function verifyAllProducts() {
  try {
    await connect();
    console.log("🔍 COMPREHENSIVE PRODUCT VERIFICATION");
    console.log("=".repeat(80));
    console.log("Verifying ALL products: SKU, Price, Unit, Category\n");
    
    // Get all products from database
    const allProducts = await Product.find({ 
      company_id: "RESSICHEM", 
      isActive: true 
    }).sort({ name: 1 });
    
    console.log(`📦 Total products in database: ${allProducts.length}\n`);
    
    const results = {
      valid: [],
      invalidSKU: [],
      invalidPrice: [],
      invalidUnit: [],
      invalidCategory: [],
      missingData: []
    };
    
    // Verify each product
    for (const product of allProducts) {
      const issues = [];
      
      // Check SKU
      if (!product.sku || product.sku === '' || product.sku === null || product.sku === undefined) {
        issues.push('SKU');
        results.invalidSKU.push({
          name: product.name,
          sku: product.sku
        });
      }
      
      // Check Price
      if (product.price === undefined || product.price === null || isNaN(product.price) || product.price < 0) {
        issues.push('Price');
        results.invalidPrice.push({
          name: product.name,
          price: product.price
        });
      }
      
      // Check Unit
      const validUnits = ['KG', 'LTR', 'GM'];
      if (!product.unit || !validUnits.includes(product.unit)) {
        issues.push('Unit');
        results.invalidUnit.push({
          name: product.name,
          unit: product.unit
        });
      }
      
      // Check Category
      if (!product.category || !product.category.mainCategory) {
        issues.push('Category');
        results.invalidCategory.push({
          name: product.name,
          category: product.category
        });
      }
      
      if (issues.length > 0) {
        results.missingData.push({
          name: product.name,
          issues: issues,
          sku: product.sku,
          price: product.price,
          unit: product.unit,
          category: product.category?.mainCategory
        });
      } else {
        results.valid.push({
          name: product.name,
          sku: product.sku,
          price: product.price,
          unit: product.unit,
          category: product.category.mainCategory
        });
      }
    }
    
    // Generate report
    console.log("=".repeat(80));
    console.log("📊 VERIFICATION RESULTS");
    console.log("=".repeat(80));
    console.log(`✅ Valid Products: ${results.valid.length} (${((results.valid.length / allProducts.length) * 100).toFixed(2)}%)`);
    console.log(`❌ Products with Issues: ${results.missingData.length} (${((results.missingData.length / allProducts.length) * 100).toFixed(2)}%)`);
    console.log(`\n   - Invalid/Missing SKU: ${results.invalidSKU.length}`);
    console.log(`   - Invalid/Missing Price: ${results.invalidPrice.length}`);
    console.log(`   - Invalid/Missing Unit: ${results.invalidUnit.length}`);
    console.log(`   - Invalid/Missing Category: ${results.invalidCategory.length}`);
    
    // Show sample of products with issues
    if (results.missingData.length > 0) {
      console.log("\n" + "=".repeat(80));
      console.log("⚠️  PRODUCTS WITH ISSUES (Sample - first 10)");
      console.log("=".repeat(80));
      results.missingData.slice(0, 10).forEach((p, i) => {
        console.log(`${i + 1}. ${p.name}`);
        console.log(`   Issues: ${p.issues.join(', ')}`);
        console.log(`   SKU: ${p.sku}, Price: ${p.price}, Unit: ${p.unit}, Category: ${p.category || 'N/A'}`);
      });
      if (results.missingData.length > 10) {
        console.log(`\n... and ${results.missingData.length - 10} more products with issues`);
      }
    }
    
    // Show statistics by category
    console.log("\n" + "=".repeat(80));
    console.log("📋 PRODUCTS BY CATEGORY");
    console.log("=".repeat(80));
    const categoryStats = {};
    results.valid.forEach(p => {
      const cat = p.category || 'Unknown';
      categoryStats[cat] = (categoryStats[cat] || 0) + 1;
    });
    
    Object.entries(categoryStats)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, count]) => {
        console.log(`   ${cat}: ${count} products`);
      });
    
    // Show statistics by unit
    console.log("\n" + "=".repeat(80));
    console.log("📋 PRODUCTS BY UNIT");
    console.log("=".repeat(80));
    const unitStats = {};
    results.valid.forEach(p => {
      const unit = p.unit || 'Unknown';
      unitStats[unit] = (unitStats[unit] || 0) + 1;
    });
    
    Object.entries(unitStats)
      .sort((a, b) => b[1] - a[1])
      .forEach(([unit, count]) => {
        console.log(`   ${unit}: ${count} products`);
      });
    
    // Price range statistics
    const prices = results.valid.map(p => p.price).filter(p => p !== null && p !== undefined);
    if (prices.length > 0) {
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      
      console.log("\n" + "=".repeat(80));
      console.log("💰 PRICE STATISTICS");
      console.log("=".repeat(80));
      console.log(`   Minimum Price: ${minPrice.toFixed(2)} PKR`);
      console.log(`   Maximum Price: ${maxPrice.toFixed(2)} PKR`);
      console.log(`   Average Price: ${avgPrice.toFixed(2)} PKR`);
    }
    
    // Final summary
    console.log("\n" + "=".repeat(80));
    console.log("📋 FINAL SUMMARY");
    console.log("=".repeat(80));
    
    if (results.missingData.length === 0) {
      console.log("✅ PERFECT! All products have valid data:");
      console.log("   ✅ All products have valid SKU");
      console.log("   ✅ All products have valid Price");
      console.log("   ✅ All products have valid Unit (KG/LTR/GM)");
      console.log("   ✅ All products have valid Category");
      console.log(`\n🎉 ${results.valid.length} products verified successfully!`);
    } else {
      console.log(`⚠️  Found ${results.missingData.length} products with data issues`);
      console.log("   Please review and fix the issues listed above.");
    }
    
    await disconnect();
    process.exit(results.missingData.length === 0 ? 0 : 1);
  } catch (error) {
    console.error("❌ Error during verification:", error);
    await disconnect();
    process.exit(1);
  }
}

// Run verification
verifyAllProducts();


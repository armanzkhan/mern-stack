// backend/scripts/verifyCategoriesAndPrices.js
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");
const fs = require('fs');
const path = require('path');

async function verifyCategoriesAndPrices() {
  try {
    await connect();
    console.log("🔍 Verifying categories, subcategories, and prices match your list...\n");

    // Read import script to extract expected categories
    const scriptPath = path.join(__dirname, 'importProductsFromExcel.js');
    const scriptContent = fs.readFileSync(scriptPath, 'utf8');

    // Extract all category.mainCategory values from script
    const mainCatRegex = /mainCategory:\s*['"]([^'"]+)['"]/g;
    const expectedMainCategories = new Set();
    let match;
    while ((match = mainCatRegex.exec(scriptContent)) !== null) {
      expectedMainCategories.add(match[1]);
    }

    // Extract all category.subCategory values from script
    const subCatRegex = /subCategory:\s*['"]([^'"]+)['"]/g;
    const expectedSubCategories = new Set();
    while ((match = subCatRegex.exec(scriptContent)) !== null) {
      expectedSubCategories.add(match[1]);
    }

    console.log("📋 Expected Categories from Your List:");
    console.log(`   Main Categories: ${expectedMainCategories.size}`);
    Array.from(expectedMainCategories).sort().forEach(cat => {
      console.log(`   - ${cat}`);
    });

    console.log(`\n   Sub-Categories: ${expectedSubCategories.size}`);
    Array.from(expectedSubCategories).sort().forEach(cat => {
      console.log(`   - ${cat}`);
    });

    // Get actual categories from database
    console.log("\n📊 Actual Categories in Database:");
    const dbMainCategories = await Product.distinct('category.mainCategory', { 
      company_id: "RESSICHEM",
      isActive: true 
    });

    console.log(`   Main Categories: ${dbMainCategories.length}`);
    for (const cat of dbMainCategories.sort()) {
      const dbCount = await Product.countDocuments({
        'category.mainCategory': cat,
        company_id: "RESSICHEM",
        isActive: true
      });
      console.log(`   - ${cat} (${dbCount} products)`);
    }

    const dbSubCategories = await Product.distinct('category.subCategory', { 
      company_id: "RESSICHEM",
      isActive: true,
      'category.subCategory': { $exists: true, $ne: null }
    });

    console.log(`\n   Sub-Categories: ${dbSubCategories.length}`);
    for (const cat of dbSubCategories.sort()) {
      const dbCount = await Product.countDocuments({
        'category.subCategory': cat,
        company_id: "RESSICHEM",
        isActive: true
      });
      console.log(`   - ${cat} (${dbCount} products)`);
    }

    // Check for categories NOT in expected list
    console.log("\n🔍 Checking for Unauthorized Categories:");
    const unauthorizedMain = dbMainCategories.filter(cat => !expectedMainCategories.has(cat));
    if (unauthorizedMain.length > 0) {
      console.log(`   ⚠️  Found ${unauthorizedMain.length} unauthorized main categories:`);
      for (const cat of unauthorizedMain) {
        const count = await Product.countDocuments({
          'category.mainCategory': cat,
          company_id: "RESSICHEM",
          isActive: true
        });
        console.log(`      - ${cat} (${count} products) - SHOULD BE REMOVED`);
      }
    } else {
      console.log(`   ✅ All main categories match your list`);
    }

    // Check for missing categories
    const missingMain = Array.from(expectedMainCategories).filter(cat => !dbMainCategories.includes(cat));
    if (missingMain.length > 0) {
      console.log(`\n⚠️  Missing main categories from your list:`);
      missingMain.forEach(cat => console.log(`      - ${cat}`));
    }

    // Verify prices for specific products
    console.log("\n💰 Verifying Prices for Sample Products:");
    const testProducts = [
      { name: "Ressi PlastoRend 100 - 0001 B - 1 KG", expectedPrice: 299 },
      { name: "Ressi PlastoRend 100 - 0001 B - 12 KG", expectedPrice: 2990 },
      { name: "Ressi PlastoRend 100 - 0001 B - 50 KG", expectedPrice: 6325 },
      { name: "Ressi TG 810 - 0001 - 1 KG", expectedPrice: 161 },
      { name: "Max Flo P - 1 LTR", expectedPrice: 489 }
    ];

    for (const test of testProducts) {
      const product = await Product.findOne({
        name: test.name,
        company_id: "RESSICHEM"
      });

      if (product) {
        const priceMatch = product.price === test.expectedPrice;
        console.log(`   ${priceMatch ? '✅' : '❌'} ${test.name}`);
        if (!priceMatch) {
          console.log(`      Expected: ${test.expectedPrice}, Found: ${product.price}`);
        }
      } else {
        console.log(`   ❌ ${test.name} - NOT FOUND`);
      }
    }

    // Summary
    console.log("\n📊 Summary:");
    console.log(`   Expected Main Categories: ${expectedMainCategories.size}`);
    console.log(`   Database Main Categories: ${dbMainCategories.length}`);
    console.log(`   Unauthorized Categories: ${unauthorizedMain.length}`);
    
    if (unauthorizedMain.length === 0 && missingMain.length === 0) {
      console.log("\n✅ All categories match your pasted list!");
    } else {
      console.log("\n⚠️  Some categories need cleanup");
    }

  } catch (error) {
    console.error("❌ Error verifying categories:", error);
    process.exit(1);
  } finally {
    await disconnect();
  }
}

// Run verification
if (require.main === module) {
  verifyCategoriesAndPrices()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { verifyCategoriesAndPrices };


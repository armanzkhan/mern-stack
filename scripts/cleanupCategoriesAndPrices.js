// backend/scripts/cleanupCategoriesAndPrices.js
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");
const fs = require('fs');
const path = require('path');

async function cleanupCategoriesAndPrices() {
  try {
    await connect();
    console.log("🧹 Cleaning up categories and prices - keeping only from your pasted list...\n");

    // Read import script to extract expected categories
    const scriptPath = path.join(__dirname, 'importProductsFromExcel.js');
    const scriptContent = fs.readFileSync(scriptPath, 'utf8');

    // Extract all unique category.mainCategory values from script
    const mainCatRegex = /mainCategory:\s*['"]([^'"]+)['"]/g;
    const expectedMainCategories = new Set();
    let match;
    while ((match = mainCatRegex.exec(scriptContent)) !== null) {
      expectedMainCategories.add(match[1]);
    }

    // Extract all unique category.subCategory values from script
    const subCatRegex = /subCategory:\s*['"]([^'"]+)['"]/g;
    const expectedSubCategories = new Set();
    while ((match = subCatRegex.exec(scriptContent)) !== null) {
      expectedSubCategories.add(match[1]);
    }

    console.log(`📋 Expected Categories from Your List:`);
    console.log(`   Main Categories: ${Array.from(expectedMainCategories).sort().join(', ')}`);
    console.log(`   Sub-Categories: ${Array.from(expectedSubCategories).sort().join(', ')}`);

    // Get all products from database
    const allProducts = await Product.find({ 
      company_id: "RESSICHEM",
      isActive: true 
    }).select('name category price');

    console.log(`\n📦 Found ${allProducts.length} products in database`);

    // Find products with unauthorized categories
    let productsToUpdate = [];
    let productsToDelete = [];

    for (const product of allProducts) {
      const mainCat = product.category?.mainCategory;
      const subCat = product.category?.subCategory;

      // Check if main category is authorized
      if (!mainCat || !expectedMainCategories.has(mainCat)) {
        productsToDelete.push(product);
        continue;
      }

      // Check if sub category is authorized (if it exists)
      if (subCat && subCat !== null && !expectedSubCategories.has(subCat)) {
        // Update the product to remove unauthorized sub-category
        productsToUpdate.push({
          productId: product._id,
          productName: product.name,
          issue: `Unauthorized sub-category: ${subCat}`,
          fix: { mainCategory: mainCat, subCategory: null }
        });
      }
    }

    console.log(`\n📊 Cleanup Analysis:`);
    console.log(`   Products with unauthorized main categories to DELETE: ${productsToDelete.length}`);
    console.log(`   Products with unauthorized sub-categories to UPDATE: ${productsToUpdate.length}`);

    // Show sample products to delete
    if (productsToDelete.length > 0) {
      console.log(`\n🗑️  Sample products to be deleted:`);
      productsToDelete.slice(0, 10).forEach(p => {
        console.log(`   - ${p.name} (Category: ${p.category?.mainCategory || 'N/A'})`);
      });
      if (productsToDelete.length > 10) {
        console.log(`   ... and ${productsToDelete.length - 10} more`);
      }

      // Delete products with unauthorized categories
      const productIds = productsToDelete.map(p => p._id);
      const deleteResult = await Product.deleteMany({
        _id: { $in: productIds }
      });
      console.log(`\n✅ Deleted ${deleteResult.deletedCount} products with unauthorized categories`);
    }

    // Update products with unauthorized sub-categories
    if (productsToUpdate.length > 0) {
      console.log(`\n📝 Sample products to be updated:`);
      productsToUpdate.slice(0, 10).forEach(p => {
        console.log(`   - ${p.productName} (${p.issue})`);
      });
      if (productsToUpdate.length > 10) {
        console.log(`   ... and ${productsToUpdate.length - 10} more`);
      }

      let updatedCount = 0;
      for (const updateInfo of productsToUpdate) {
        await Product.findByIdAndUpdate(updateInfo.productId, {
          $set: { category: updateInfo.fix }
        });
        updatedCount++;
      }
      console.log(`\n✅ Updated ${updatedCount} products (removed unauthorized sub-categories)`);
    }

    // Final verification
    console.log(`\n📊 Final Verification:`);
    const finalMainCategories = await Product.distinct('category.mainCategory', { 
      company_id: "RESSICHEM",
      isActive: true 
    });

    const unauthorizedFinal = finalMainCategories.filter(cat => !expectedMainCategories.has(cat));
    
    if (unauthorizedFinal.length === 0 && productsToUpdate.length === 0 && productsToDelete.length === 0) {
      console.log(`   ✅ All categories match your pasted list`);
      console.log(`   ✅ No cleanup needed`);
    } else {
      console.log(`   ⚠️  Unauthorized categories remaining: ${unauthorizedFinal.length}`);
      unauthorizedFinal.forEach(cat => {
        console.log(`      - ${cat}`);
      });
    }

    // Count final products
    const finalCount = await Product.countDocuments({ 
      company_id: "RESSICHEM",
      isActive: true 
    });
    console.log(`\n📊 Final product count: ${finalCount} products`);
    console.log(`   (Only products with categories from your pasted list remain)`);

    console.log("\n✅ Cleanup completed!");

  } catch (error) {
    console.error("❌ Error cleaning up categories:", error);
    process.exit(1);
  } finally {
    await disconnect();
  }
}

// Run cleanup
if (require.main === module) {
  cleanupCategoriesAndPrices()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { cleanupCategoriesAndPrices };


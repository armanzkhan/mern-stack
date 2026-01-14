require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

async function checkAndRemoveDuplicates(categoryName = "Building Care and Maintenance") {
  try {
    await connect();
    console.log(`🔍 Checking for duplicates in ${categoryName} category...\n`);
    
    // Fetch all products in the specified category
    const dbProducts = await Product.find({
      "category.mainCategory": categoryName,
      company_id: "RESSICHEM"
    }).sort({ name: 1, sku: 1 });
    
    console.log(`📊 Total products found: ${dbProducts.length}\n`);
    
    // Create a map to track duplicates
    const productMap = new Map();
    const duplicates = [];
    
    dbProducts.forEach(product => {
      // Create a unique key: name + sku + unit
      const key = `${product.name}|${product.sku}|${product.unit}`;
      
      if (productMap.has(key)) {
        // This is a duplicate
        duplicates.push({
          key,
          existing: productMap.get(key),
          duplicate: product
        });
      } else {
        productMap.set(key, product);
      }
    });
    
    if (duplicates.length === 0) {
      console.log("✅ No duplicates found! All products are unique.\n");
      console.log(`📊 Total unique products: ${productMap.size}\n`);
    } else {
      console.log(`⚠️  Found ${duplicates.length} duplicate(s):\n`);
      
      duplicates.forEach((dup, idx) => {
        console.log(`${idx + 1}. Duplicate found:`);
        console.log(`   Key: ${dup.key}`);
        console.log(`   Existing: ${dup.existing.name} (ID: ${dup.existing._id})`);
        console.log(`   Duplicate: ${dup.duplicate.name} (ID: ${dup.duplicate._id})`);
        console.log(`   Price - Existing: ${dup.existing.price}, Duplicate: ${dup.duplicate.price}`);
        console.log();
      });
      
      // Remove duplicates (keep the first one, delete the rest)
      console.log("🗑️  Removing duplicates...\n");
      let removedCount = 0;
      
      for (const dup of duplicates) {
        // Delete the duplicate (keep the existing one)
        const deleteResult = await Product.deleteOne({ _id: dup.duplicate._id });
        if (deleteResult.deletedCount > 0) {
          removedCount++;
          console.log(`✅ Removed duplicate: ${dup.duplicate.name} (ID: ${dup.duplicate._id})`);
        }
      }
      
      console.log(`\n✅ Removed ${removedCount} duplicate product(s)\n`);
      
      // Verify final count
      const finalProducts = await Product.find({
        "category.mainCategory": categoryName,
        company_id: "RESSICHEM"
      });
      
      console.log(`📊 Final product count: ${finalProducts.length}\n`);
      
      // Double-check for any remaining duplicates
      const finalMap = new Map();
      let remainingDuplicates = 0;
      
      finalProducts.forEach(product => {
        const key = `${product.name}|${product.sku}|${product.unit}`;
        if (finalMap.has(key)) {
          remainingDuplicates++;
        } else {
          finalMap.set(key, product);
        }
      });
      
      if (remainingDuplicates === 0) {
        console.log("✅ Verification: No duplicates remaining!\n");
      } else {
        console.log(`⚠️  Warning: ${remainingDuplicates} duplicate(s) still found!\n`);
      }
    }
    
    // Show summary by product name
    console.log("=".repeat(80));
    console.log("PRODUCT SUMMARY");
    console.log("=".repeat(80));
    
    const byName = new Map();
    dbProducts.forEach(product => {
      // Extract base name (remove SKU and unit from name)
      const baseName = product.name.split(' - ')[0];
      if (!byName.has(baseName)) {
        byName.set(baseName, []);
      }
      byName.get(baseName).push(product);
    });
    
    console.log(`\n📦 Products by name (${byName.size} unique product names):\n`);
    Array.from(byName.keys()).sort().forEach(name => {
      const variants = byName.get(name);
      console.log(`  ${name}: ${variants.length} variant(s)`);
      variants.forEach(v => {
        console.log(`    - ${v.sku} ${v.unit} - ${v.price}`);
      });
    });
    
    console.log("\n" + "=".repeat(80));
    console.log("CHECK COMPLETE");
    console.log("=".repeat(80));
    
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  checkAndRemoveDuplicates()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { checkAndRemoveDuplicates };


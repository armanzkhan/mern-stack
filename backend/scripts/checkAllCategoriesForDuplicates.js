require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

async function checkAllCategoriesForDuplicates() {
  try {
    await connect();
    console.log("🔍 Checking ALL categories for duplicates...\n");
    
    const categories = [
      "Building Care and Maintenance",
      "Epoxy Adhesives and Coatings"
    ];
    
    let totalDuplicates = 0;
    let totalProducts = 0;
    
    for (const categoryName of categories) {
      console.log("=".repeat(80));
      console.log(`Checking: ${categoryName}`);
      console.log("=".repeat(80));
      console.log();
      
      const dbProducts = await Product.find({
        "category.mainCategory": categoryName,
        company_id: "RESSICHEM"
      }).sort({ name: 1, sku: 1 });
      
      totalProducts += dbProducts.length;
      console.log(`📊 Total products: ${dbProducts.length}\n`);
      
      // Create a map to track duplicates
      const productMap = new Map();
      const duplicates = [];
      
      dbProducts.forEach(product => {
        // Create a unique key: name + sku + unit
        const key = `${product.name}|${product.sku}|${product.unit}`;
        
        if (productMap.has(key)) {
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
        totalDuplicates += duplicates.length;
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
          const deleteResult = await Product.deleteOne({ _id: dup.duplicate._id });
          if (deleteResult.deletedCount > 0) {
            removedCount++;
            console.log(`✅ Removed duplicate: ${dup.duplicate.name} (ID: ${dup.duplicate._id})`);
          }
        }
        
        console.log(`\n✅ Removed ${removedCount} duplicate product(s)\n`);
      }
      
      console.log();
    }
    
    console.log("=".repeat(80));
    console.log("SUMMARY");
    console.log("=".repeat(80));
    console.log(`📊 Total products checked: ${totalProducts}`);
    console.log(`⚠️  Total duplicates found: ${totalDuplicates}`);
    
    if (totalDuplicates === 0) {
      console.log("\n✅ SUCCESS! No duplicates found in any category!");
    } else {
      console.log(`\n⚠️  ${totalDuplicates} duplicate(s) were found and removed.`);
    }
    
    console.log("=".repeat(80));
    
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  checkAllCategoriesForDuplicates()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { checkAllCategoriesForDuplicates };


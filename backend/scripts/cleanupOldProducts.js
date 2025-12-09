// backend/scripts/cleanupOldProducts.js
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

// Import productData from import script
const { importProducts } = require("./importProductsFromExcel");
const fs = require('fs');
const path = require('path');

async function cleanupOldProducts() {
  try {
    await connect();
    console.log("🧹 Cleaning up old products - keeping only products from your list...\n");

    // Read the import script to get all product fullNames
    const scriptPath = path.join(__dirname, 'importProductsFromExcel.js');
    const scriptContent = fs.readFileSync(scriptPath, 'utf8');
    
    // Extract productData array from the script
    // We need to require it dynamically or extract the fullNames
    // Better approach: Run the import script logic to get all fullNames
    const productDataMatch = scriptContent.match(/const productData = \[([\s\S]*?)\];/);
    
    if (!productDataMatch) {
      console.error("❌ Could not find productData in import script");
      process.exit(1);
    }

    // Extract all fullName patterns from productData
    // Format: fullName: `${p.name} - ${p.sku} ${p.unit}`
    // Or we can look for name patterns and reconstruct
    
    // Better approach: Get all products from database and match against known patterns
    const allProducts = await Product.find({ 
      company_id: "RESSICHEM"
    }).select('name isActive');

    console.log(`📦 Found ${allProducts.length} total products in database`);

    // Products that should be kept (from your list)
    // These are the products that match patterns from your list:
    // - PlastoRend 100, 110, 120 series
    // - SC 310, DecoRend
    // - Building Care and Maintenance products
    // - Tiling and Grouting Materials
    // - Concrete Admixtures (Max Flo)
    // - EPOXY FLOORING & COATINGS
    // - Decorative Concrete
    // - Zepoxy products
    // - Specialty Products
    
    const keepPatterns = [
      /PlastoRend 100/i,
      /PlastoRend 110/i,
      /PlastoRend 120/i,
      /RPR 120/i,
      /SC 310/i,
      /DecoRend|RDR/i,
      /Water Guard/i,
      /Rain Sheild|Rain Sheild 1810/i,
      /Tough Guard/i,
      /Crack Heal/i,
      /Wall Guard/i,
      /Silprime/i,
      /Damp Seal/i,
      /Silmix/i,
      /SBR/i,
      /Guru/i,
      /Crysta Coat/i,
      /Silblock/i,
      /Patch/i,
      /Rapid Patch/i,
      /Heat Guard/i,
      /TG 810/i,
      /TG 820/i,
      /TG CR/i,
      /ETG DP/i,
      /Tile Latex/i,
      /Grout Latex/i,
      /TA 210|TA 220|TA 230|TA 240|TA 250|TA 260|TA 270|TA 280|TA 290|TA 300/i,
      /TA 2K|TA QS|TA 0001|TA HPA|TA Re Bond/i,
      /ETA SF/i,
      /TG 2K|Bath Seal/i,
      /Grout Seal|Grout Admix/i,
      /Max Flo/i,
      /Ressi EPO/i,
      /Zepoxy/i,
      /Pigmented Hardener/i,
      /Powder Release|P Release/i,
      /Acid Itch/i,
      /Reactive Stain/i,
      /Neutraliser|Neutraliser/i,
      /Polymer/i,
      /Microtopping|MT Base|MT Top/i,
      /Terrazzo Retarder/i,
      /NSG 710|Kerb Grout|KerbFix|Anchor Fix|LEEG 10/i,
      /PFS 620|Gyps O Might|Lime O Might|SLS/i,
      /BRC 7000|BLM 510/i,
      /Overlay/i
    ];

    const productsToDelete = [];
    const productsToKeep = [];

    for (const product of allProducts) {
      // Check if product matches any keep pattern
      let shouldKeep = false;
      for (const pattern of keepPatterns) {
        if (pattern.test(product.name)) {
          shouldKeep = true;
          break;
        }
      }

      if (shouldKeep) {
        productsToKeep.push(product);
      } else {
        productsToDelete.push(product);
      }
    }

    console.log(`\n✅ Products to keep (from your list): ${productsToKeep.length}`);
    console.log(`🗑️  Products to delete (old products): ${productsToDelete.length}`);

    if (productsToDelete.length > 0) {
      console.log("\n📋 Sample old products to be deleted:");
      productsToDelete.slice(0, 15).forEach(p => {
        console.log(`   - ${p.name}`);
      });
      if (productsToDelete.length > 15) {
        console.log(`   ... and ${productsToDelete.length - 15} more`);
      }

      // Delete old products
      const productIds = productsToDelete.map(p => p._id);
      const deleteResult = await Product.deleteMany({
        _id: { $in: productIds }
      });

      console.log(`\n✅ Deleted ${deleteResult.deletedCount} old products`);
    } else {
      console.log("\n✅ No old products to delete - all products are from your list");
    }

    // Final count
    const finalCount = await Product.countDocuments({ 
      company_id: "RESSICHEM",
      isActive: true 
    });
    console.log(`\n📊 Final product count: ${finalCount} products`);
    console.log(`   (Only products from your pasted list remain)`);

    console.log("\n✅ Cleanup completed!");

  } catch (error) {
    console.error("❌ Error cleaning up products:", error);
    process.exit(1);
  } finally {
    await disconnect();
  }
}

// Run cleanup
if (require.main === module) {
  cleanupOldProducts()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { cleanupOldProducts };

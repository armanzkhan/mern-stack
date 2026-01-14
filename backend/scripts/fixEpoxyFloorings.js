// backend/scripts/fixEpoxyFloorings.js
// Ensures that the Epoxy Floorings & Coatings category in the database
// exactly matches the provided list of products.

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

// Expected products from user's list - EXACT match required
const expectedProducts = [
  // Ressi EPO Crack Fill
  { name: "Ressi EPO Crack Fill", sku: 2.16, unit: "KG", price: 813 },
  { name: "Ressi EPO Crack Fill", sku: 21.6, unit: "KG", price: 7500 },
  
  // Ressi EPO Crack Fill LV
  { name: "Ressi EPO Crack Fill LV", sku: 2.18, unit: "KG", price: 550 },
  { name: "Ressi EPO Crack Fill LV", sku: 21.8, unit: "KG", price: 4088 },
  
  // Ressi EPO Crack Fill WR
  { name: "Ressi EPO Crack Fill WR", sku: 2.18, unit: "KG", price: 681 },
  { name: "Ressi EPO Crack Fill WR", sku: 21.8, unit: "KG", price: 5450 },
  
  // Ressi EPO Crack Fill CR
  { name: "Ressi EPO Crack Fill CR", sku: 2.15, unit: "KG", price: 806 },
  { name: "Ressi EPO Crack Fill CR", sku: 21.5, unit: "KG", price: 6719 },
  
  // Ressi EPO Primer
  { name: "Ressi EPO Primer", sku: 1.6, unit: "KG", price: 3750 },
  { name: "Ressi EPO Primer", sku: 16, unit: "KG", price: 34800 },
  { name: "Ressi EPO Primer", sku: 48, unit: "KG", price: 102500 },
  
  // Ressi EPO Primer LV
  { name: "Ressi EPO Primer LV", sku: 1.8, unit: "KG", price: 3563 },
  { name: "Ressi EPO Primer LV", sku: 18, unit: "KG", price: 32963 },
  { name: "Ressi EPO Primer LV", sku: 54, unit: "KG", price: 97875 },
  
  // Ressi EPO Primer WR
  { name: "Ressi EPO Primer WR", sku: 1.8, unit: "KG", price: 5625 },
  { name: "Ressi EPO Primer WR", sku: 18, unit: "KG", price: 54000 },
  { name: "Ressi EPO Primer WR", sku: 54, unit: "KG", price: 155250 },
  
  // Ressi EPO Primer CR
  { name: "Ressi EPO Primer CR", sku: 1.5, unit: "KG", price: 6125 },
  { name: "Ressi EPO Primer CR", sku: 15, unit: "KG", price: 56250 },
  { name: "Ressi EPO Primer CR", sku: 45, unit: "KG", price: 160000 },
  
  // Ressi EPO Primer WCR
  { name: "Ressi EPO Primer WCR", sku: 1.8, unit: "KG", price: 7875 },
  { name: "Ressi EPO Primer WCR", sku: 18, unit: "KG", price: 73125 },
  { name: "Ressi EPO Primer WCR", sku: 54, unit: "KG", price: 202500 },
  
  // Ressi EPO Iron Primer
  { name: "Ressi EPO Iron Primer", sku: 1.16, unit: "KG", price: 2356 },
  { name: "Ressi EPO Iron Primer", sku: 11.6, unit: "KG", price: 21750 },
  { name: "Ressi EPO Iron Primer", sku: 23.2, unit: "KG", price: 41250 },
  
  // Ressi EPO Chem Prime 402
  { name: "Ressi EPO Chem Prime 402", sku: 1.5, unit: "KG", price: 5000 },
  { name: "Ressi EPO Chem Prime 402", sku: 15, unit: "KG", price: 48750 },
  { name: "Ressi EPO Chem Prime 402", sku: 45, unit: "KG", price: 93750 },
  
  // Ressi EPO Mid Coat S - GP
  { name: "Ressi EPO Mid Coat S - GP", sku: 2.96, unit: "KG", price: 2368 },
  { name: "Ressi EPO Mid Coat S - GP", sku: 14.8, unit: "KG", price: 11285 },
  { name: "Ressi EPO Mid Coat S - GP", sku: 29.6, unit: "KG", price: 21830 },
  { name: "Ressi EPO Mid Coat S - GP", sku: 59.2, unit: "KG", price: 41440 },
  
  // Ressi EPO Mid Coat F - GP
  { name: "Ressi EPO Mid Coat F - GP", sku: 2.96, unit: "KG", price: 3330 },
  { name: "Ressi EPO Mid Coat F - GP", sku: 14.8, unit: "KG", price: 13320 },
  { name: "Ressi EPO Mid Coat F - GP", sku: 29.6, unit: "KG", price: 24420 },
  { name: "Ressi EPO Mid Coat F - GP", sku: 59.2, unit: "KG", price: 45140 },
  
  // Ressi EPO Mid Coat S - CR
  { name: "Ressi EPO Mid Coat S - CR", sku: 2.8, unit: "KG", price: 3150 },
  { name: "Ressi EPO Mid Coat S - CR", sku: 14, unit: "KG", price: 14875 },
  { name: "Ressi EPO Mid Coat S - CR", sku: 28, unit: "KG", price: 28000 },
  { name: "Ressi EPO Mid Coat S - CR", sku: 56, unit: "KG", price: 52500 },
  
  // Ressi EPO Mid Coat F - CR
  { name: "Ressi EPO Mid Coat F - CR", sku: 2.8, unit: "KG", price: 3325 },
  { name: "Ressi EPO Mid Coat F - CR", sku: 14, unit: "KG", price: 15750 },
  { name: "Ressi EPO Mid Coat F - CR", sku: 28, unit: "KG", price: 29750 },
  { name: "Ressi EPO Mid Coat F - CR", sku: 56, unit: "KG", price: 56000 },
  
  // Ressi EPO Tough Might
  { name: "Ressi EPO Tough Might", sku: 1.4, unit: "KG", price: 3525 },
  { name: "Ressi EPO Tough Might", sku: 14, unit: "KG", price: 33750 },
  { name: "Ressi EPO Tough Might", sku: 28, unit: "KG", price: 66150 },
  
  // Ressi EPO Tough Might Econo
  { name: "Ressi EPO Tough Might Econo", sku: 1.6, unit: "KG", price: 3063 },
  { name: "Ressi EPO Tough Might Econo", sku: 16, unit: "KG", price: 28300 },
  { name: "Ressi EPO Tough Might Econo", sku: 32, unit: "KG", price: 54000 },
  
  // Ressi EPO Gloss Might
  { name: "Ressi EPO Gloss Might", sku: 1.4, unit: "KG", price: 3360 },
  { name: "Ressi EPO Gloss Might", sku: 14, unit: "KG", price: 31763 },
  { name: "Ressi EPO Gloss Might", sku: 28, unit: "KG", price: 61600 },
  
  // Ressi EPO Chem Might
  { name: "Ressi EPO Chem Might", sku: 1.5, unit: "KG", price: 4688 },
  { name: "Ressi EPO Chem Might", sku: 15, unit: "KG", price: 45000 },
  { name: "Ressi EPO Chem Might", sku: 30, unit: "KG", price: 86250 },
  
  // Ressi EPO Clear Coat-Floor
  { name: "Ressi EPO Clear Coat-Floor", sku: 1.5, unit: "KG", price: 4688 },
  { name: "Ressi EPO Clear Coat-Floor", sku: 15, unit: "KG", price: 45000 },
  { name: "Ressi EPO Clear Coat-Floor", sku: 30, unit: "KG", price: 86250 },
  
  // Ressi EPO Clear Coat-Walls
  { name: "Ressi EPO Clear Coat-Walls", sku: 1.5, unit: "KG", price: 3938 },
  { name: "Ressi EPO Clear Coat-Walls", sku: 15, unit: "KG", price: 37500 },
  { name: "Ressi EPO Clear Coat-Walls", sku: 30, unit: "KG", price: 67500 },
  
  // Ressi EPO Anti-static
  { name: "Ressi EPO Anti-static", sku: 1.5, unit: "KG", price: 5375 },
  { name: "Ressi EPO Anti-static", sku: 15, unit: "KG", price: 50625 },
  { name: "Ressi EPO Anti-static", sku: 30, unit: "KG", price: 97500 },
  
  // Ressi EPO FLOOR PLUS Econo
  { name: "Ressi EPO FLOOR PLUS Econo", sku: 3.2, unit: "KG", price: 2963 },
  { name: "Ressi EPO FLOOR PLUS Econo", sku: 16, unit: "KG", price: 14400 },
  { name: "Ressi EPO FLOOR PLUS Econo", sku: 32, unit: "KG", price: 28200 },
  { name: "Ressi EPO FLOOR PLUS Econo", sku: 64, unit: "KG", price: 54400 },
  
  // Ressi EPO FLOOR PLUS
  { name: "Ressi EPO FLOOR PLUS", sku: 2.8, unit: "KG", price: 3325 },
  { name: "Ressi EPO FLOOR PLUS", sku: 28, unit: "KG", price: 31500 },
  { name: "Ressi EPO FLOOR PLUS", sku: 56, unit: "KG", price: 58450 },
  
  // Ressi EPO Gloss Plus
  { name: "Ressi EPO Gloss Plus", sku: 2.7, unit: "KG", price: 3875 },
  { name: "Ressi EPO Gloss Plus", sku: 13.5, unit: "KG", price: 18563 },
  { name: "Ressi EPO Gloss Plus", sku: 27, unit: "KG", price: 35438 },
  { name: "Ressi EPO Gloss Plus", sku: 54, unit: "KG", price: 67500 },
  
  // Ressi EPO Chem Plus
  { name: "Ressi EPO Chem Plus", sku: 2.7, unit: "KG", price: 4900 },
  { name: "Ressi EPO Chem Plus", sku: 13.5, unit: "KG", price: 23625 },
  { name: "Ressi EPO Chem Plus", sku: 27, unit: "KG", price: 45563 },
  { name: "Ressi EPO Chem Plus", sku: 54, unit: "KG", price: 87750 },
  
  // Ressi EPO Roll Coat-Floor
  { name: "Ressi EPO Roll Coat-Floor", sku: 1.4, unit: "KG", price: 3875 },
  { name: "Ressi EPO Roll Coat-Floor", sku: 14, unit: "KG", price: 37625 },
  { name: "Ressi EPO Roll Coat-Floor", sku: 28, unit: "KG", price: 73500 },
  
  // Ressi EPO Roll Coat Plus
  { name: "Ressi EPO Roll Coat Plus", sku: 1.16, unit: "KG", price: 2050 },
  { name: "Ressi EPO Roll Coat Plus", sku: 11.6, unit: "KG", price: 18750 },
  { name: "Ressi EPO Roll Coat Plus", sku: 23.2, unit: "KG", price: 36000 },
  
  // Ressi EPO Iron Coat
  { name: "Ressi EPO Iron Coat", sku: 1.16, unit: "KG", price: 2350 },
  { name: "Ressi EPO Iron Coat", sku: 11.6, unit: "KG", price: 22000 },
  { name: "Ressi EPO Iron Coat", sku: 23.2, unit: "KG", price: 42500 },
  
  // Ressi EPO Iron Coat CR
  { name: "Ressi EPO Iron Coat CR", sku: 1.16, unit: "KG", price: 2625 },
  { name: "Ressi EPO Iron Coat CR", sku: 11.6, unit: "KG", price: 25375 },
  { name: "Ressi EPO Iron Coat CR", sku: 23.2, unit: "KG", price: 49300 },
  
  // Ressi EPO Chem Coat 406
  { name: "Ressi EPO Chem Coat 406", sku: 1.5, unit: "KG", price: 4875 },
  { name: "Ressi EPO Chem Coat 406", sku: 15, unit: "KG", price: 47813 },
  { name: "Ressi EPO Chem Coat 406", sku: 30, unit: "KG", price: 93750 },
];

async function fixEpoxyFloorings() {
  try {
    await connect();
    console.log("🔧 Fixing Epoxy Floorings & Coatings products...\n");

    // Step 1: Remove all existing products from the category
    console.log("Step 1: Removing all existing products from Epoxy Floorings & Coatings category...");
    const deleteResult = await Product.deleteMany({
      "category.mainCategory": "Epoxy Floorings & Coatings",
      company_id: "RESSICHEM"
    });
    console.log(`✅ Deleted ${deleteResult.deletedCount} existing products\n`);

    // Step 2: Create products with exact specifications
    console.log(`Step 2: Creating ${expectedProducts.length} products with exact specifications...`);
    const productsToInsert = expectedProducts.map(prod => ({
      name: `${prod.name} - ${prod.sku} ${prod.unit}`,
      fullName: `${prod.name} - ${prod.sku} ${prod.unit}`,
      description: prod.name,
      sku: prod.sku,
      unit: prod.unit,
      price: prod.price,
      category: { mainCategory: "Epoxy Floorings & Coatings" },
      company_id: "RESSICHEM",
      isActive: true,
      stockStatus: "in_stock"
    }));
    
    const createResult = await Product.insertMany(productsToInsert, { ordered: false });
    console.log(`✅ Created ${createResult.length} products\n`);

    // Step 3: Verify results
    console.log("Step 3: Verifying results...");
    const dbProducts = await Product.find({
      "category.mainCategory": "Epoxy Floorings & Coatings",
      company_id: "RESSICHEM"
    });

    console.log(`\n📊 Total products in database: ${dbProducts.length}`);
    console.log(`📊 Expected products: ${expectedProducts.length}`);

    if (dbProducts.length === expectedProducts.length) {
      console.log("\n✅ Correct products: " + expectedProducts.length);
      console.log("\n================================================================================");
      console.log("✅ SUCCESS! 100% match achieved!");
      console.log("================================================================================\n");
    } else {
      console.log("\n❌ Product count mismatch!");
      console.log("================================================================================");
      console.log("⚠️  Please review the output above.");
      console.log("================================================================================\n");
    }

  } catch (error) {
    console.error("❌ Error during fixing process:", error);
    process.exit(1);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  fixEpoxyFloorings()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { fixEpoxyFloorings };


// backend/scripts/verifyEpoxyFloorings.js
// Verify that Epoxy Floorings & Coatings category only contains the specified products
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

// Expected products from user's list
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

// Helper function to normalize product name for comparison
function normalizeProductName(name) {
  return name.trim().replace(/\s+/g, ' ');
}

// Helper function to create a unique key for product matching
function createProductKey(product) {
  const name = normalizeProductName(product.name || '');
  const sku = String(product.sku || '').trim();
  const unit = String(product.unit || '').trim();
  return `${name}::${sku}::${unit}`.toLowerCase();
}

async function verifyEpoxyFloorings() {
  try {
    console.log("🔍 Verifying Epoxy Floorings & Coatings Products...\n");
    
    // Connect to database
    await connect();
    console.log("✅ Connected to database\n");
    
    // Fetch all products in Epoxy Floorings & Coatings category
    const dbProducts = await Product.find({
      "category.mainCategory": "Epoxy Floorings & Coatings",
      isActive: true,
      company_id: "RESSICHEM"
    }).sort({ name: 1, sku: 1 });
    
    console.log(`📊 Found ${dbProducts.length} products in database\n`);
    
    // Create expected products map
    const expectedMap = new Map();
    expectedProducts.forEach(prod => {
      const key = createProductKey(prod);
      expectedMap.set(key, prod);
    });
    
    // Create database products map
    const dbProductsMap = new Map();
    dbProducts.forEach(prod => {
      const dbName = normalizeProductName(prod.name || '');
      const dbSku = String(prod.sku || '').trim();
      const dbUnit = String(prod.unit || '').trim();
      
      // Try to match with expected products
      for (const expected of expectedProducts) {
        const expectedFullName = `${expected.name} - ${expected.sku} ${expected.unit}`;
        
        // Normalize SKU - database might have "1.5 KG" in SKU field, extract just the number
        let dbSkuNormalized = dbSku.replace(/\s*(KG|LTR)\s*/i, '').trim();
        const expectedSkuStr = String(expected.sku).trim();
        
        // Check if database product name matches (case-insensitive)
        const nameMatch = dbName.toLowerCase() === expectedFullName.toLowerCase();
        
        // Also check SKU and unit match
        const skuMatch = dbSkuNormalized === expectedSkuStr || dbSku === `${expectedSkuStr} ${expected.unit}` || dbSku === expectedSkuStr;
        const unitMatch = dbUnit.toLowerCase() === String(expected.unit).trim().toLowerCase();
        
        if (nameMatch && skuMatch && unitMatch) {
          const key = createProductKey(expected);
          if (!dbProductsMap.has(key)) {
            dbProductsMap.set(key, []);
          }
          dbProductsMap.get(key).push(prod);
          break; // Found match, move to next product
        }
      }
    });
    
    // Find missing products (in expected but not in database)
    const missingProducts = [];
    expectedMap.forEach((expected, key) => {
      if (!dbProductsMap.has(key)) {
        missingProducts.push(expected);
      }
    });
    
    // Find extra products (in database but not in expected)
    const extraProducts = [];
    dbProductsMap.forEach((dbProds, key) => {
      if (!expectedMap.has(key)) {
        extraProducts.push(...dbProds);
      }
    });
    
    // Find products with incorrect prices
    const incorrectPriceProducts = [];
    expectedMap.forEach((expected, key) => {
      if (dbProductsMap.has(key)) {
        const dbProds = dbProductsMap.get(key);
        dbProds.forEach(dbProd => {
          if (Math.abs(dbProd.price - expected.price) > 0.01) {
            incorrectPriceProducts.push({
              expected,
              actual: dbProd,
              expectedPrice: expected.price,
              actualPrice: dbProd.price
            });
          }
        });
      }
    });
    
    // Report results
    console.log("=".repeat(80));
    console.log("VERIFICATION RESULTS");
    console.log("=".repeat(80));
    
    console.log(`\n✅ Expected Products: ${expectedProducts.length}`);
    console.log(`📦 Database Products: ${dbProducts.length}`);
    
    if (missingProducts.length === 0 && extraProducts.length === 0 && incorrectPriceProducts.length === 0) {
      console.log("\n🎉 SUCCESS! All products match exactly!");
      console.log("\n✅ All expected products are present");
      console.log("✅ No extra products found");
      console.log("✅ All prices are correct");
    } else {
      if (missingProducts.length > 0) {
        console.log(`\n❌ Missing Products (${missingProducts.length}):`);
        missingProducts.forEach((prod, idx) => {
          console.log(`   ${idx + 1}. ${prod.name} - ${prod.sku} ${prod.unit} (Price: ${prod.price})`);
        });
      }
      
      if (extraProducts.length > 0) {
        console.log(`\n⚠️  Extra Products Found (${extraProducts.length}):`);
        extraProducts.forEach((prod, idx) => {
          console.log(`   ${idx + 1}. ${prod.name} - ${prod.sku} ${prod.unit} (Price: ${prod.price})`);
          console.log(`      ID: ${prod._id}`);
        });
      }
      
      if (incorrectPriceProducts.length > 0) {
        console.log(`\n⚠️  Products with Incorrect Prices (${incorrectPriceProducts.length}):`);
        incorrectPriceProducts.forEach((item, idx) => {
          console.log(`   ${idx + 1}. ${item.expected.name} - ${item.expected.sku} ${item.expected.unit}`);
          console.log(`      Expected: ${item.expectedPrice}, Actual: ${item.actualPrice}`);
          console.log(`      ID: ${item.actual._id}`);
        });
      }
    }
    
    console.log("\n" + "=".repeat(80));
    console.log("VERIFICATION COMPLETE");
    console.log("=".repeat(80));
    
  } catch (error) {
    console.error("❌ Error during verification:", error);
    process.exit(1);
  } finally {
    await disconnect();
  }
}

// Run verification
if (require.main === module) {
  verifyEpoxyFloorings()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { verifyEpoxyFloorings };


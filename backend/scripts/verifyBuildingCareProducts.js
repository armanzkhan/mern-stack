// backend/scripts/verifyBuildingCareProducts.js
// Verify that Building Care and Maintenance category only contains the specified products
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

// Expected products from user's list
const expectedProducts = [
  // Crack Heal Series
  { name: "Crack Heal 910", sku: "1", unit: "KG", price: 250 },
  { name: "Crack Heal 910", sku: "20", unit: "KG", price: 4000 },
  { name: "Crack Heal 910 2K", sku: "2.5", unit: "KG", price: 1025 },
  { name: "Crack Heal 910 2K", sku: "25", unit: "KG", price: 9688 },
  { name: "Crack Heal 920", sku: "1", unit: "KG", price: 344 },
  { name: "Crack Heal 920", sku: "20", unit: "KG", price: 4750 },
  { name: "Crack Heal 920 2K", sku: "2.5", unit: "KG", price: 1025 },
  { name: "Crack Heal 920 2K", sku: "25", unit: "KG", price: 9688 },
  { name: "Crack Heal 940", sku: "2.18", unit: "KG", price: 1438 },
  { name: "Crack Heal 940", sku: "21.8", unit: "KG", price: 12263 },
  { name: "Crack Heal Flexi 950", sku: "1", unit: "KG", price: 1563 },
  { name: "Crack Heal Flexi 950", sku: "20", unit: "KG", price: 26875 },
  
  // Tough Guard
  { name: "Tough Guard 12,000 E", sku: "2.17", unit: "KG", price: 1188 },
  { name: "Tough Guard 12,000 E", sku: "21.7", unit: "KG", price: 8875 },
  
  // Water Guard Series
  { name: "Water Guard 491", sku: "3.2", unit: "KG", price: 1875 },
  { name: "Water Guard 491", sku: "16", unit: "KG", price: 8125 },
  { name: "Water Guard 491", sku: "20", unit: "KG", price: 10156 },
  { name: "Water Guard 5010", sku: "3.2", unit: "KG", price: 1225 },
  { name: "Water Guard 5010", sku: "16", unit: "KG", price: 5438 },
  { name: "Water Guard 5010", sku: "20", unit: "KG", price: 6688 },
  { name: "Water Guard 5253", sku: "3.2", unit: "KG", price: 938 },
  { name: "Water Guard 5253", sku: "16", unit: "KG", price: 3063 },
  { name: "Water Guard 5253", sku: "20", unit: "KG", price: 4813 },
  
  // Water Guard 3020 N (with color codes)
  { name: "Water Guard 3020 N - 0001 (White)", sku: "20", unit: "KG", price: 25213 },
  { name: "Water Guard 3020 N - 9400 (Grey)", sku: "20", unit: "KG", price: 25213 },
  { name: "Water Guard 3020 N - 3900 X1 - 1 (Terracotta)", sku: "20", unit: "KG", price: 25213 },
  { name: "Water Guard 3020 N - 1200 (Dessert Sand)", sku: "20", unit: "KG", price: 25213 },
  { name: "Water Guard 3020 N - 5210 (Sky Blue)", sku: "20", unit: "KG", price: 25213 },
  { name: "Water Guard 3020 N - 2400 (Light Green)", sku: "20", unit: "KG", price: 25213 },
  
  // Water Guard 1530 Econo (with color codes)
  { name: "Water Guard 1530 Econo - 0001 (White)", sku: "20", unit: "KG", price: 15500 },
  { name: "Water Guard 1530 Econo - 9400 (Grey)", sku: "20", unit: "KG", price: 15500 },
  { name: "Water Guard 1530 Econo- 3900 X1 - 1 (Terracotta)", sku: "20", unit: "KG", price: 15500 },
  { name: "Water Guard 1530 Econo - 1200 (Dessert Sand)", sku: "20", unit: "KG", price: 15500 },
  { name: "Water Guard 1530 Econo - 5210 (Sky Blue)", sku: "20", unit: "KG", price: 15625 },
  { name: "Water Guard 1530 Econo - 2400 (Light Green)", sku: "20", unit: "KG", price: 15688 },
  
  // Rain Sheild 1810 (with color codes)
  { name: "Rain Sheild 1810 - 0001 (White)", sku: "20", unit: "KG", price: 22000 },
  { name: "Rain Sheild 1810 N - 9400 (Grey)", sku: "20", unit: "KG", price: 22000 },
  { name: "Rain Sheild 1810 - 3900 X1 - 1 (Terracotta)", sku: "20", unit: "KG", price: 22000 },
  { name: "Rain Sheild 1810 - 1200 (Dessert Sand)", sku: "20", unit: "KG", price: 22000 },
  { name: "Rain Sheild 1810 - 5210 (Sky Blue)", sku: "20", unit: "KG", price: 22000 },
  { name: "Rain Sheild 1810 - 2400 (Light Green)", sku: "20", unit: "KG", price: 22000 },
  
  // Silprime 3K
  { name: "Silprime 3K", sku: "1.25", unit: "KG", price: 5000 },
  
  // Damp Seal
  { name: "Damp Seal", sku: "1.25", unit: "KG", price: 4688 },
  
  // Silmix
  { name: "Silmix", sku: "1", unit: "LTR", price: 1088 },
  { name: "Silmix", sku: "5", unit: "LTR", price: 5375 },
  { name: "Silmix", sku: "10", unit: "LTR", price: 10625 },
  { name: "Silmix", sku: "15", unit: "LTR", price: 15750 },
  { name: "Silmix", sku: "25", unit: "LTR", price: 25938 },
  { name: "Silmix", sku: "200", unit: "LTR", price: 200000 },
  
  // Ressi SBR 5850
  { name: "Ressi SBR 5850", sku: "1", unit: "KG", price: 1125 },
  { name: "Ressi SBR 5850", sku: "5", unit: "KG", price: 5469 },
  { name: "Ressi SBR 5850", sku: "10", unit: "KG", price: 10688 },
  { name: "Ressi SBR 5850", sku: "15", unit: "KG", price: 15750 },
  { name: "Ressi SBR 5850", sku: "25", unit: "KG", price: 25781 },
  { name: "Ressi SBR 5850", sku: "200", unit: "KG", price: 198000 },
  
  // Ressi Guru
  { name: "Ressi Guru", sku: "1", unit: "KG", price: 606 },
  { name: "Ressi Guru", sku: "5", unit: "KG", price: 2969 },
  { name: "Ressi Guru", sku: "10", unit: "KG", price: 5813 },
  { name: "Ressi Guru", sku: "25", unit: "KG", price: 13906 },
  { name: "Ressi Guru", sku: "200", unit: "KG", price: 107500 },
  
  // Ressi SBR 5840
  { name: "Ressi SBR 5840", sku: "1", unit: "KG", price: 563 },
  { name: "Ressi SBR 5840", sku: "5", unit: "KG", price: 2750 },
  { name: "Ressi SBR 5840", sku: "10", unit: "KG", price: 5375 },
  { name: "Ressi SBR 5840", sku: "15", unit: "KG", price: 7781 },
  { name: "Ressi SBR 5840", sku: "25", unit: "KG", price: 12813 },
  { name: "Ressi SBR 5840", sku: "200", unit: "KG", price: 100000 },
  
  // Water Guard L 100
  { name: "Water Guard L 100", sku: "1", unit: "KG", price: 3125 },
  { name: "Water Guard L 100", sku: "5", unit: "KG", price: 15000 },
  { name: "Water Guard L 100", sku: "10", unit: "KG", price: 28750 },
  { name: "Water Guard L 100", sku: "15", unit: "KG", price: 42750 },
  { name: "Water Guard L 100", sku: "25", unit: "KG", price: 69375 },
  { name: "Water Guard L 100", sku: "200", unit: "KG", price: 550000 },
  
  // Water Guard P 200
  { name: "Water Guard P 200", sku: "1", unit: "KG", price: 175 },
  { name: "Water Guard P 200", sku: "20", unit: "KG", price: 3250 },
  
  // Silblock
  { name: "Silblock", sku: "1", unit: "LTR", price: 1513 },
  { name: "Silblock", sku: "5", unit: "LTR", price: 7500 },
  { name: "Silblock", sku: "10", unit: "LTR", price: 14750 },
  { name: "Silblock", sku: "15", unit: "LTR", price: 21750 },
  { name: "Silblock", sku: "25", unit: "LTR", price: 35625 },
  { name: "Silblock", sku: "200", unit: "LTR", price: 280000 },
  
  // Silblock PLUS
  { name: "Silblock PLUS", sku: "1", unit: "LTR", price: 2688 },
  { name: "Silblock PLUS", sku: "5", unit: "LTR", price: 13313 },
  { name: "Silblock PLUS", sku: "10", unit: "LTR", price: 26375 },
  { name: "Silblock PLUS", sku: "15", unit: "LTR", price: 39375 },
  { name: "Silblock PLUS", sku: "25", unit: "LTR", price: 64063 },
  { name: "Silblock PLUS", sku: "200", unit: "LTR", price: 500000 },
  
  // Patch Series
  { name: "Patch 365", sku: "1", unit: "KG", price: 88 },
  { name: "Patch 365", sku: "20", unit: "KG", price: 1075 },
  { name: "Patch 365 Plus", sku: "2.5", unit: "KG", price: 1875 },
  { name: "Patch 365 Plus", sku: "25", unit: "KG", price: 13750 },
  { name: "Patch Epoxy 111", sku: "2.5", unit: "KG", price: 2250 },
  { name: "Patch Epoxy 111", sku: "25", unit: "KG", price: 14063 },
  { name: "Patch Epoxy 222", sku: "16", unit: "KG", price: 19875 },
  { name: "Rapid Patch 999", sku: "1", unit: "KG", price: 250 },
  { name: "Rapid Patch 999", sku: "20", unit: "KG", price: 4375 },
  
  // Heat Guard
  { name: "Heat Guard 1000", sku: "20", unit: "KG", price: 23125 },
  
  // Water Guard Crysta Series
  { name: "Water Guard Crysta Coat 101", sku: "1", unit: "KG", price: 563 },
  { name: "Water Guard Crysta Coat 101", sku: "20", unit: "KG", price: 10000 },
  { name: "Water Guard Crysta Coat 102", sku: "1", unit: "KG", price: 500 },
  { name: "Water Guard Crysta Coat 102", sku: "20", unit: "KG", price: 8750 },
  { name: "Water Guard Crysta Admix 103", sku: "1", unit: "KG", price: 713 },
  { name: "Water Guard Crysta Admix 103", sku: "20", unit: "KG", price: 13000 },
  
  // Ressi Insufix Series
  { name: "Ressi Insufix 200", sku: "20", unit: "KG", price: 1783 },
  { name: "Ressi Insufix 201", sku: "20", unit: "KG", price: 2070 },
  { name: "Ressi Insufix 202", sku: "20", unit: "KG", price: 1898 },
  
  // Insulaster
  { name: "Insulaster", sku: "50.802", unit: "KG", price: 4945 },
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

async function verifyBuildingCareProducts() {
  try {
    console.log("🔍 Verifying Building Care and Maintenance Products...\n");
    
    // Connect to database
    await connect();
    console.log("✅ Connected to database\n");
    
    // Fetch all products in Building Care and Maintenance category
    const dbProducts = await Product.find({
      "category.mainCategory": "Building Care and Maintenance",
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
      // Database products have format: "Product Name - SKU UNIT" or "Product Name - Color Code - SKU UNIT"
      const dbName = normalizeProductName(prod.name || '');
      const dbSku = String(prod.sku || '').trim();
      const dbUnit = String(prod.unit || '').trim();
      
      // Try to match with expected products
      for (const expected of expectedProducts) {
        const expectedFullName = `${expected.name} - ${expected.sku} ${expected.unit}`;
        
        // Normalize SKU - database might have "20 KG" in SKU field, extract just the number
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
    
    // Show summary of products by subcategory
    console.log("\n" + "=".repeat(80));
    console.log("PRODUCTS BY SUBCATEGORY");
    console.log("=".repeat(80));
    
    const bySubcategory = {};
    dbProducts.forEach(prod => {
      const subCat = prod.category?.subCategory || "No Subcategory";
      if (!bySubcategory[subCat]) {
        bySubcategory[subCat] = [];
      }
      bySubcategory[subCat].push(prod);
    });
    
    Object.keys(bySubcategory).sort().forEach(subCat => {
      console.log(`\n📁 ${subCat}: ${bySubcategory[subCat].length} products`);
    });
    
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
  verifyBuildingCareProducts()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { verifyBuildingCareProducts };


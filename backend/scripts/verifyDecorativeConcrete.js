// backend/scripts/verifyDecorativeConcrete.js
// Verify that Decorative Concrete category only contains the specified products
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

// Expected products from user's list
const expectedProducts = [
  // Ressi Overlay
  { name: "Ressi Overlay", sku: 50, unit: "KG", price: 3220 },
  
  // Ressi Pigmented Hardener (with color codes)
  { name: "Ressi Pigmented Hardener", colorCode: "Pigmented H - 0001 (White)", sku: 20, unit: "KG", price: 4600 },
  { name: "Ressi Pigmented Hardener", colorCode: "Pigmented H- 3700 (Terracotta)", sku: 20, unit: "KG", price: 4600 },
  { name: "Ressi Pigmented Hardener", colorCode: "Pigmented H - 1600 (Yellow)", sku: 20, unit: "KG", price: 4600 },
  { name: "Ressi Pigmented Hardener", colorCode: "Pigmented H - 9000 (Grey)", sku: 20, unit: "KG", price: 4600 },
  { name: "Ressi Pigmented Hardener", colorCode: "Pigmented H - 5210 - 1 (Sky Blue)", sku: 20, unit: "KG", price: 4600 },
  { name: "Ressi Pigmented Hardener", colorCode: "Pigmented H - 9321 (Brown)", sku: 20, unit: "KG", price: 4600 },
  
  // Ressi Powder Release (with color codes)
  { name: "Ressi Powder Release", colorCode: "P Release - 0001 (White)", sku: 10, unit: "KG", price: 7906 },
  { name: "Ressi Powder Release", colorCode: "P Release - 3700 (Terracotta)", sku: 10, unit: "KG", price: 7906 },
  { name: "Ressi Powder Release", colorCode: "P Release - 1600 (Yellow)", sku: 10, unit: "KG", price: 7906 },
  { name: "Ressi Powder Release", colorCode: "P Release - 9000 (Grey)", sku: 10, unit: "KG", price: 7906 },
  { name: "Ressi Powder Release", colorCode: "P Release - 5210 - 1 (Sky Blue)", sku: 10, unit: "KG", price: 7906 },
  { name: "Ressi Powder Release", colorCode: "P Release - 9321 (Brown)", sku: 10, unit: "KG", price: 7906 },
  
  // Ressi Acid Itch
  { name: "Ressi Acid Itch", sku: 1, unit: "LTR", price: 592 },
  { name: "Ressi Acid Itch", sku: 5, unit: "LTR", price: 2243 },
  { name: "Ressi Acid Itch", sku: 10, unit: "LTR", price: 4370 },
  { name: "Ressi Acid Itch", sku: 15, unit: "LTR", price: 6383 },
  { name: "Ressi Acid Itch", sku: 25, unit: "LTR", price: 12420 },
  
  // Ressi Reactive Stain (with color codes)
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Honey White", sku: 1, unit: "LTR", price: 1898 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Honey White", sku: 5, unit: "LTR", price: 5750 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Honey White", sku: 10, unit: "LTR", price: 10925 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Honey White", sku: 15, unit: "LTR", price: 15525 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Honey White", sku: 25, unit: "LTR", price: 24438 },
  
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Nectarine", sku: 1, unit: "LTR", price: 1898 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Nectarine", sku: 5, unit: "LTR", price: 5750 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Nectarine", sku: 10, unit: "LTR", price: 10925 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Nectarine", sku: 15, unit: "LTR", price: 15525 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Nectarine", sku: 25, unit: "LTR", price: 24438 },
  
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Persimmon", sku: 1, unit: "LTR", price: 1898 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Persimmon", sku: 5, unit: "LTR", price: 5750 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Persimmon", sku: 10, unit: "LTR", price: 10925 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Persimmon", sku: 15, unit: "LTR", price: 15525 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Persimmon", sku: 25, unit: "LTR", price: 24438 },
  
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Rust Brown", sku: 1, unit: "LTR", price: 1898 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Rust Brown", sku: 5, unit: "LTR", price: 5750 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Rust Brown", sku: 10, unit: "LTR", price: 10925 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Rust Brown", sku: 15, unit: "LTR", price: 15525 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Rust Brown", sku: 25, unit: "LTR", price: 24438 },
  
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Storm Green", sku: 1, unit: "LTR", price: 1898 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Storm Green", sku: 5, unit: "LTR", price: 5750 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Storm Green", sku: 10, unit: "LTR", price: 10925 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Storm Green", sku: 15, unit: "LTR", price: 15525 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Storm Green", sku: 25, unit: "LTR", price: 24438 },
  
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Kahlua", sku: 1, unit: "LTR", price: 1898 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Kahlua", sku: 5, unit: "LTR", price: 5750 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Kahlua", sku: 10, unit: "LTR", price: 10925 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Kahlua", sku: 15, unit: "LTR", price: 15525 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Kahlua", sku: 25, unit: "LTR", price: 24438 },
  
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Citrus Green", sku: 1, unit: "LTR", price: 1898 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Citrus Green", sku: 5, unit: "LTR", price: 5750 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Citrus Green", sku: 10, unit: "LTR", price: 10925 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Citrus Green", sku: 15, unit: "LTR", price: 15525 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Citrus Green", sku: 25, unit: "LTR", price: 24438 },
  
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Cool Blue", sku: 1, unit: "LTR", price: 1898 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Cool Blue", sku: 5, unit: "LTR", price: 5750 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Cool Blue", sku: 10, unit: "LTR", price: 10925 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Cool Blue", sku: 15, unit: "LTR", price: 15525 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Cool Blue", sku: 25, unit: "LTR", price: 24438 },
  
  // Ressi Neutraliser
  { name: "Ressi Neutraliser", sku: 1, unit: "LTR", price: 920 },
  { name: "Ressi Neutraliser", sku: 5, unit: "LTR", price: 4543 },
  { name: "Ressi Neutraliser", sku: 10, unit: "LTR", price: 8855 },
  { name: "Ressi Neutraliser", sku: 15, unit: "LTR", price: 13110 },
  { name: "Ressi Neutraliser", sku: 25, unit: "LTR", price: 26220 },
  
  // Ressi Polymer
  { name: "Ressi Polymer", sku: 1, unit: "LTR", price: 3335 },
  { name: "Ressi Polymer", sku: 5, unit: "LTR", price: 16100 },
  { name: "Ressi Polymer", sku: 10, unit: "LTR", price: 31050 },
  { name: "Ressi Polymer", sku: 15, unit: "LTR", price: 44850 },
  { name: "Ressi Polymer", sku: 30, unit: "LTR", price: 86250 },
  
  // Microtopping System
  { name: "Microtopping System", colorCode: "MT Base Coat", sku: 20, unit: "KG", price: 1610 },
  { name: "Microtopping System", colorCode: "MT Top Coat", sku: 20, unit: "KG", price: 2300 },
  { name: "Microtopping System", colorCode: "MT - Polymer Liquid", sku: 1, unit: "KG", price: 3335 },
  { name: "Microtopping System", colorCode: "MT - Polymer Liquid", sku: 5, unit: "KG", price: 16100 },
  { name: "Microtopping System", colorCode: "MT - Polymer Liquid", sku: 10, unit: "KG", price: 31050 },
  { name: "Microtopping System", colorCode: "MT - Polymer Liquid", sku: 15, unit: "KG", price: 44850 },
  { name: "Microtopping System", colorCode: "MT - Polymer Liquid", sku: 25, unit: "KG", price: 86250 },
  
  // Terrazzo Retarder
  { name: "Terrazzo Retarder", sku: 1, unit: "LTR", price: 1254 },
  { name: "Terrazzo Retarder", sku: 5, unit: "LTR", price: 6153 },
  { name: "Terrazzo Retarder", sku: 10, unit: "LTR", price: 12075 },
  { name: "Terrazzo Retarder", sku: 15, unit: "LTR", price: 17768 },
  { name: "Terrazzo Retarder", sku: 25, unit: "LTR", price: 29038 },
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

async function verifyDecorativeConcrete() {
  try {
    console.log("🔍 Verifying Decorative Concrete Products...\n");
    
    // Connect to database
    await connect();
    console.log("✅ Connected to database\n");
    
    // Fetch all products in Decorative Concrete category
    const dbProducts = await Product.find({
      "category.mainCategory": "Decorative Concrete",
      isActive: true,
      company_id: "RESSICHEM"
    }).sort({ name: 1, sku: 1 });
    
    console.log(`📊 Found ${dbProducts.length} products in database\n`);
    
    // Create expected products map
    const expectedMap = new Map();
    expectedProducts.forEach(prod => {
      let expectedName = prod.name;
      if (prod.colorCode) {
        expectedName = `${prod.name} - ${prod.colorCode}`;
      }
      const key = `${expectedName}::${prod.sku}::${prod.unit}`.toLowerCase();
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
        let expectedName = expected.name;
        if (expected.colorCode) {
          expectedName = `${expected.name} - ${expected.colorCode}`;
        }
        const expectedFullName = `${expectedName} - ${expected.sku} ${expected.unit}`;
        
        // Normalize SKU - database might have "1 LTR" in SKU field, extract just the number
        let dbSkuNormalized = dbSku.replace(/\s*(KG|LTR)\s*/i, '').trim();
        const expectedSkuStr = String(expected.sku).trim();
        
        // Check if database product name matches (case-insensitive)
        const nameMatch = dbName.toLowerCase() === expectedFullName.toLowerCase();
        
        // Also check SKU and unit match
        const skuMatch = dbSkuNormalized === expectedSkuStr || dbSku === `${expectedSkuStr} ${expected.unit}` || dbSku === expectedSkuStr;
        const unitMatch = dbUnit.toLowerCase() === String(expected.unit).trim().toLowerCase();
        
        if (nameMatch && skuMatch && unitMatch) {
          const key = `${expectedName}::${expected.sku}::${expected.unit}`.toLowerCase();
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
          const name = prod.colorCode ? `${prod.name} - ${prod.colorCode}` : prod.name;
          console.log(`   ${idx + 1}. ${name} - ${prod.sku} ${prod.unit} (Price: ${prod.price})`);
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
          const name = item.expected.colorCode ? `${item.expected.name} - ${item.expected.colorCode}` : item.expected.name;
          console.log(`   ${idx + 1}. ${name} - ${item.expected.sku} ${item.expected.unit}`);
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
  verifyDecorativeConcrete()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { verifyDecorativeConcrete };

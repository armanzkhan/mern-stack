// backend/scripts/verifyFrontendProducts.js
// Verify frontend products against expected list
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

// Expected products from user's original list
const expectedProducts = {
  // Crack Heal 910
  "Crack Heal 910 - 1 KG": { sku: "1", unit: "KG", price: 250 },
  "Crack Heal 910 - 20 KG": { sku: "20", unit: "KG", price: 4000 },
  
  // Crack Heal 910 2K
  "Crack Heal 910 2K - 2.5 KG": { sku: "2.5", unit: "KG", price: 1025 },
  "Crack Heal 910 2K - 25 KG": { sku: "25", unit: "KG", price: 9688 },
  
  // Crack Heal 920
  "Crack Heal 920 - 1 KG": { sku: "1", unit: "KG", price: 344 },
  "Crack Heal 920 - 20 KG": { sku: "20", unit: "KG", price: 4750 },
  
  // Crack Heal 920 2K
  "Crack Heal 920 2K - 2.5 KG": { sku: "2.5", unit: "KG", price: 1025 },
  "Crack Heal 920 2K - 25 KG": { sku: "25", unit: "KG", price: 9688 },
  
  // Crack Heal 940
  "Crack Heal 940 - 2.18 KG": { sku: "2.18", unit: "KG", price: 1438 },
  "Crack Heal 940 - 21.8 KG": { sku: "21.8", unit: "KG", price: 12263 },
  
  // Crack Heal Flexi 950
  "Crack Heal Flexi 950 - 1 KG": { sku: "1", unit: "KG", price: 1563 },
  "Crack Heal Flexi 950 - 20 KG": { sku: "20", unit: "KG", price: 26875 },
  
  // Tough Guard 12,000 E
  "Tough Guard 12,000 E - 2.17 KG": { sku: "2.17", unit: "KG", price: 1188 },
  "Tough Guard 12,000 E - 21.7 KG": { sku: "21.7", unit: "KG", price: 8875 },
  
  // Water Guard 491
  "Water Guard 491 - 3.2 KG": { sku: "3.2", unit: "KG", price: 1875 },
  "Water Guard 491 - 16 KG": { sku: "16", unit: "KG", price: 8125 },
  "Water Guard 491 - 20 KG": { sku: "20", unit: "KG", price: 10156 },
  
  // Water Guard 5010
  "Water Guard 5010 - 3.2 KG": { sku: "3.2", unit: "KG", price: 1225 },
  "Water Guard 5010 - 16 KG": { sku: "16", unit: "KG", price: 5438 },
  "Water Guard 5010 - 20 KG": { sku: "20", unit: "KG", price: 6688 },
  
  // Water Guard 5253
  "Water Guard 5253 - 3.2 KG": { sku: "3.2", unit: "KG", price: 938 },
  "Water Guard 5253 - 16 KG": { sku: "16", unit: "KG", price: 3063 },
  "Water Guard 5253 - 20 KG": { sku: "20", unit: "KG", price: 4813 },
  
  // Water Guard 3020 N
  "Water Guard 3020 N - 0001 - 20 KG": { sku: "20", unit: "KG", price: 25213 },
  "Water Guard 3020 N - 9400 - 20 KG": { sku: "20", unit: "KG", price: 25213 },
  "Water Guard 3020 N - 3900 X1 - 1 - 20 KG": { sku: "20", unit: "KG", price: 25213 },
  "Water Guard 3020 N - 1200 - 20 KG": { sku: "20", unit: "KG", price: 25213 },
  "Water Guard 3020 N - 5210 - 20 KG": { sku: "20", unit: "KG", price: 25213 },
  "Water Guard 3020 N - 2400 - 20 KG": { sku: "20", unit: "KG", price: 25213 },
  
  // Water Guard 1530 Econo
  "Water Guard 1530 Econo - 0001 - 20 KG": { sku: "20", unit: "KG", price: 15500 },
  "Water Guard 1530 Econo - 9400 - 20 KG": { sku: "20", unit: "KG", price: 15500 },
  "Water Guard 1530 Econo - 3900 X1 - 1 - 20 KG": { sku: "20", unit: "KG", price: 15500 },
  "Water Guard 1530 Econo - 1200 - 20 KG": { sku: "20", unit: "KG", price: 15500 },
  "Water Guard 1530 Econo - 5210 - 20 KG": { sku: "20", unit: "KG", price: 15625 },
  "Water Guard 1530 Econo - 2400 - 20 KG": { sku: "20", unit: "KG", price: 15688 },
  
  // Rain Sheild 1810
  "Rain Sheild 1810 - 0001 - 20 KG": { sku: "20", unit: "KG", price: 22000 },
  "Rain Sheild 1810 - 9400 - 20 KG": { sku: "20", unit: "KG", price: 22000 },
  "Rain Sheild 1810 - 3900 X1 - 1 - 20 KG": { sku: "20", unit: "KG", price: 22000 },
  "Rain Sheild 1810 - 1200 - 20 KG": { sku: "20", unit: "KG", price: 22000 },
  "Rain Sheild 1810 - 5210 - 20 KG": { sku: "20", unit: "KG", price: 22000 },
  "Rain Sheild 1810 - 2400 - 20 KG": { sku: "20", unit: "KG", price: 22000 },
  
  // Silprime 3K
  "Silprime 3K - 1.25 KG": { sku: "1.25", unit: "KG", price: 5000 },
  
  // Damp Seal
  "Damp Seal - 1.25 KG": { sku: "1.25", unit: "KG", price: 4688 },
  
  // Silmix
  "Silmix - 1 LTR": { sku: "1", unit: "LTR", price: 1088 },
  "Silmix - 5 LTR": { sku: "5", unit: "LTR", price: 5375 },
  "Silmix - 10 LTR": { sku: "10", unit: "LTR", price: 10625 },
  "Silmix - 15 LTR": { sku: "15", unit: "LTR", price: 15750 },
  "Silmix - 25 LTR": { sku: "25", unit: "LTR", price: 25938 },
  "Silmix - 200 LTR": { sku: "200", unit: "LTR", price: 200000 },
  
  // Ressi SBR 5850
  "Ressi SBR 5850 - 1 KG": { sku: "1", unit: "KG", price: 1125 },
  "Ressi SBR 5850 - 5 KG": { sku: "5", unit: "KG", price: 5469 },
  "Ressi SBR 5850 - 10 KG": { sku: "10", unit: "KG", price: 10688 },
  "Ressi SBR 5850 - 15 KG": { sku: "15", unit: "KG", price: 15750 },
  "Ressi SBR 5850 - 25 KG": { sku: "25", unit: "KG", price: 25781 },
  "Ressi SBR 5850 - 200 KG": { sku: "200", unit: "KG", price: 198000 },
  
  // Ressi Guru
  "Ressi Guru - 1 KG": { sku: "1", unit: "KG", price: 606 },
  "Ressi Guru - 5 KG": { sku: "5", unit: "KG", price: 2969 },
  "Ressi Guru - 10 KG": { sku: "10", unit: "KG", price: 5813 },
  "Ressi Guru - 25 KG": { sku: "25", unit: "KG", price: 13906 },
  "Ressi Guru - 200 KG": { sku: "200", unit: "KG", price: 107500 },
  
  // Ressi SBR 5840
  "Ressi SBR 5840 - 1 KG": { sku: "1", unit: "KG", price: 563 },
  "Ressi SBR 5840 - 5 KG": { sku: "5", unit: "KG", price: 2750 },
  "Ressi SBR 5840 - 10 KG": { sku: "10", unit: "KG", price: 5375 },
  "Ressi SBR 5840 - 15 KG": { sku: "15", unit: "KG", price: 7781 },
  "Ressi SBR 5840 - 25 KG": { sku: "25", unit: "KG", price: 12813 },
  "Ressi SBR 5840 - 200 KG": { sku: "200", unit: "KG", price: 100000 },
  
  // Water Guard L 100
  "Water Guard L 100 - 1 KG": { sku: "1", unit: "KG", price: 3125 },
  "Water Guard L 100 - 5 KG": { sku: "5", unit: "KG", price: 15000 },
  "Water Guard L 100 - 10 KG": { sku: "10", unit: "KG", price: 28750 },
  "Water Guard L 100 - 15 KG": { sku: "15", unit: "KG", price: 42750 },
  "Water Guard L 100 - 25 KG": { sku: "25", unit: "KG", price: 69375 },
  "Water Guard L 100 - 200 KG": { sku: "200", unit: "KG", price: 550000 },
  
  // Water Guard P 200
  "Water Guard P 200 - 1 KG": { sku: "1", unit: "KG", price: 175 },
  "Water Guard P 200 - 20 KG": { sku: "20", unit: "KG", price: 3250 },
  
  // Silblock (first set - lower prices)
  "Silblock - 1 LTR": { sku: "1", unit: "LTR", price: 1513 },
  "Silblock - 5 LTR": { sku: "5", unit: "LTR", price: 7500 },
  "Silblock - 10 LTR": { sku: "10", unit: "LTR", price: 14750 },
  "Silblock - 15 LTR": { sku: "15", unit: "LTR", price: 21750 },
  "Silblock - 25 LTR": { sku: "25", unit: "LTR", price: 35625 },
  "Silblock - 200 LTR": { sku: "200", unit: "LTR", price: 280000 },
  
  // Silblock (second set - higher prices, named as Silblock PLUS to differentiate)
  "Silblock PLUS - 1 LTR": { sku: "1", unit: "LTR", price: 2688 },
  "Silblock PLUS - 5 LTR": { sku: "5", unit: "LTR", price: 13313 },
  "Silblock PLUS - 10 LTR": { sku: "10", unit: "LTR", price: 26375 },
  "Silblock PLUS - 15 LTR": { sku: "15", unit: "LTR", price: 39375 },
  "Silblock PLUS - 25 LTR": { sku: "25", unit: "LTR", price: 64063 },
  "Silblock PLUS - 200 LTR": { sku: "200", unit: "LTR", price: 500000 },
  
  // Patch 365
  "Patch 365 - 1 KG": { sku: "1", unit: "KG", price: 88 },
  "Patch 365 - 20 KG": { sku: "20", unit: "KG", price: 1075 },
  
  // Patch 365 Plus
  "Patch 365 Plus - 2.5 KG": { sku: "2.5", unit: "KG", price: 1875 },
  "Patch 365 Plus - 25 KG": { sku: "25", unit: "KG", price: 13750 },
  
  // Patch Epoxy 111
  "Patch Epoxy 111 - 2.5 KG": { sku: "2.5", unit: "KG", price: 2250 },
  "Patch Epoxy 111 - 25 KG": { sku: "25", unit: "KG", price: 14063 },
  
  // Patch Epoxy 222
  "Patch Epoxy 222 - 16 KG": { sku: "16", unit: "KG", price: 19875 },
  
  // Rapid Patch 999
  "Rapid Patch 999 - 1 KG": { sku: "1", unit: "KG", price: 250 },
  "Rapid Patch 999 - 20 KG": { sku: "20", unit: "KG", price: 4375 },
  
  // Heat Guard 1000
  "Heat Guard 1000 - 20 KG": { sku: "20", unit: "KG", price: 23125 },
  
  // Water Guard Crysta Series
  "Water Guard Crysta Coat 101 - 1 KG": { sku: "1", unit: "KG", price: 563 },
  "Water Guard Crysta Coat 101 - 20 KG": { sku: "20", unit: "KG", price: 10000 },
  "Water Guard Crysta Coat 102 - 1 KG": { sku: "1", unit: "KG", price: 500 },
  "Water Guard Crysta Coat 102 - 20 KG": { sku: "20", unit: "KG", price: 8750 },
  "Water Guard Crysta Admix 103 - 1 KG": { sku: "1", unit: "KG", price: 713 },
  "Water Guard Crysta Admix 103 - 20 KG": { sku: "20", unit: "KG", price: 13000 },
};

// Products that should NOT be in the list
const productsToRemove = [
  "Crack Heal 910 - 2.5 KG", // Should only be 1 KG and 20 KG
  "Crack Heal 910 2K - 1 KG", // Should only be 2.5 KG and 25 KG
  "Crack Heal 910 2K - 20 KG", // Should only be 2.5 KG and 25 KG
  "Crack Heal 920 2K - 2.18 KG", // Should be 2.5 KG, not 2.18 KG
  "Crack Heal 920 2K - 21.8 KG", // Should be 25 KG, not 21.8 KG
  "Crack Heal 930 - 1 KG", // Not in the list
  "Crack Heal 930 - 20 KG", // Not in the list
  "Crack Heal 940 - 2 KG", // Should be 2.18 KG
  "Crack Heal Flexi 950 - 12 KG", // Should only be 1 KG and 20 KG
  "Crack Heal Flexi 950 - 15 KG", // Should only be 1 KG and 20 KG
  "Tough Guard 12,000 E - 3.2 KG", // Should only be 2.17 KG and 21.7 KG
  "Tough Guard 12,000 E - 16 KG", // Should only be 2.17 KG and 21.7 KG
  "Tough Guard 12,000 E - 20 KG", // Should only be 2.17 KG and 21.7 KG
  "Wall Guard 11,000 G - 2.17 KG", // Not in the list
  "Wall Guard 11,000 G - 21.7 KG", // Not in the list
  "Water Guard 247 - 12 KG", // Not in the list
  "Water Guard 247 - 20 KG", // Not in the list
  "Water Guard 247 - 200 KG", // Not in the list
  "Water Guard 247 Plus - 200 KG", // Not in the list
  "Water Guard 491 - 3.2 KG", // Price mismatch: should be 1875, but shows 1225
  "Water Guard 5010 - 3.2 KG", // Price mismatch: should be 1225, but shows 938
  "Water Guard 5253 - 3.2 KG", // Price mismatch: should be 938, matches
  "Patch 365 - 2.5 KG", // Not in the list (only 1 KG and 20 KG)
  "Patch 365 Plus - 2.5 KG", // Price mismatch: should be 1875, but shows 2250
];

async function verifyFrontendProducts() {
  try {
    console.log("🔍 Verifying Frontend Products Against Expected List...\n");
    
    await connect();
    console.log("✅ Connected to database\n");
    
    const dbProducts = await Product.find({
      "category.mainCategory": "Building Care and Maintenance",
      isActive: true,
      company_id: "RESSICHEM"
    }).sort({ name: 1 });
    
    console.log(`📊 Found ${dbProducts.length} products in database\n`);
    console.log("=".repeat(100));
    console.log("VERIFICATION REPORT");
    console.log("=".repeat(100));
    
    const issues = [];
    const correctProducts = [];
    const extraProducts = [];
    const missingProducts = [];
    const priceMismatches = [];
    
    // Check each database product
    for (const dbProduct of dbProducts) {
      const name = dbProduct.name || '';
      const sku = String(dbProduct.sku || '').trim();
      const unit = String(dbProduct.unit || '').trim();
      const price = dbProduct.price || 0;
      
      // Create key for matching
      const key = `${name}`;
      
      // Check if it's in the expected list
      const expected = expectedProducts[key];
      
      if (expected) {
        // Check if SKU, unit, and price match
        const skuMatch = String(expected.sku) === sku;
        const unitMatch = expected.unit === unit;
        const priceMatch = Math.abs(expected.price - price) < 0.01;
        
        if (skuMatch && unitMatch && priceMatch) {
          correctProducts.push({ name, sku, unit, price });
        } else {
          priceMismatches.push({
            name,
            expected: expected,
            actual: { sku, unit, price },
            issues: []
          });
          if (!skuMatch) priceMismatches[priceMismatches.length - 1].issues.push(`SKU: expected ${expected.sku}, got ${sku}`);
          if (!unitMatch) priceMismatches[priceMismatches.length - 1].issues.push(`Unit: expected ${expected.unit}, got ${unit}`);
          if (!priceMatch) priceMismatches[priceMismatches.length - 1].issues.push(`Price: expected ${expected.price}, got ${price}`);
        }
      } else {
        // Check if it's in the remove list
        const shouldRemove = productsToRemove.some(removeName => name.includes(removeName.split(" - ")[0]));
        if (shouldRemove || price === 0) {
          extraProducts.push({ name, sku, unit, price, reason: shouldRemove ? "Not in expected list" : "Price is 0" });
        } else {
          // Might be a valid product with different naming
          extraProducts.push({ name, sku, unit, price, reason: "Not in expected list" });
        }
      }
    }
    
    // Check for missing products
    for (const [key, expected] of Object.entries(expectedProducts)) {
      const found = dbProducts.find(p => {
        const name = p.name || '';
        return name === key || name.includes(key.split(" - ")[0]);
      });
      if (!found) {
        missingProducts.push({ name: key, expected });
      }
    }
    
    // Print report
    console.log(`\n✅ CORRECT PRODUCTS: ${correctProducts.length}`);
    if (correctProducts.length > 0 && correctProducts.length <= 20) {
      correctProducts.forEach(p => {
        console.log(`   ✓ ${p.name} - ${p.sku} ${p.unit} (PKR ${p.price})`);
      });
    } else if (correctProducts.length > 20) {
      console.log(`   (Showing first 20 of ${correctProducts.length} correct products)`);
      correctProducts.slice(0, 20).forEach(p => {
        console.log(`   ✓ ${p.name} - ${p.sku} ${p.unit} (PKR ${p.price})`);
      });
    }
    
    if (priceMismatches.length > 0) {
      console.log(`\n⚠️  PRICE/SKU MISMATCHES: ${priceMismatches.length}`);
      priceMismatches.forEach(item => {
        console.log(`   ✗ ${item.name}`);
        item.issues.forEach(issue => console.log(`     - ${issue}`));
      });
    }
    
    if (extraProducts.length > 0) {
      console.log(`\n❌ EXTRA PRODUCTS (Should be removed): ${extraProducts.length}`);
      extraProducts.forEach(p => {
        console.log(`   ✗ ${p.name} - ${p.sku} ${p.unit} (PKR ${p.price}) - ${p.reason}`);
      });
    }
    
    if (missingProducts.length > 0) {
      console.log(`\n❌ MISSING PRODUCTS: ${missingProducts.length}`);
      missingProducts.forEach(p => {
        console.log(`   ✗ ${p.name} - Expected: ${p.expected.sku} ${p.expected.unit} (PKR ${p.expected.price})`);
      });
    }
    
    console.log("\n" + "=".repeat(100));
    console.log("SUMMARY");
    console.log("=".repeat(100));
    console.log(`Total Products in DB: ${dbProducts.length}`);
    console.log(`Expected Products: ${Object.keys(expectedProducts).length}`);
    console.log(`✅ Correct: ${correctProducts.length}`);
    console.log(`⚠️  Mismatches: ${priceMismatches.length}`);
    console.log(`❌ Extra: ${extraProducts.length}`);
    console.log(`❌ Missing: ${missingProducts.length}`);
    
    const accuracy = ((correctProducts.length / Object.keys(expectedProducts).length) * 100).toFixed(1);
    console.log(`\n📊 Accuracy: ${accuracy}%`);
    
    if (correctProducts.length === Object.keys(expectedProducts).length && 
        priceMismatches.length === 0 && 
        extraProducts.length === 0 && 
        missingProducts.length === 0) {
      console.log("\n🎉 PERFECT MATCH! All products are correct!");
    } else {
      console.log("\n⚠️  Action Required: Run cleanup and import scripts to fix issues.");
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  verifyFrontendProducts()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { verifyFrontendProducts };


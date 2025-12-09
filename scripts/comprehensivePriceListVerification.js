// backend/scripts/comprehensivePriceListVerification.js
// Comprehensive verification of all products from price list
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

/**
 * Comprehensive product list from price list
 * Format: { name, colorCode, unit, sku, price, category }
 */
const priceListProducts = [
  // PlastoRend 100 - SKU 1 and 12 (appears multiple times at top)
  { name: "Ressi PlastoRend 100", colorCode: "0001 B", unit: "KG", sku: 1, price: 299, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100", colorCode: "0001 B", unit: "KG", sku: 12, price: 2990, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100", colorCode: "0001", unit: "KG", sku: 1, price: 299, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100", colorCode: "0001", unit: "KG", sku: 12, price: 2990, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100", colorCode: "0003", unit: "KG", sku: 1, price: 299, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100", colorCode: "0003", unit: "KG", sku: 12, price: 2990, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100", colorCode: "8400 - 1 HD", unit: "KG", sku: 1, price: 299, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100", colorCode: "8400 - 1 HD", unit: "KG", sku: 12, price: 2990, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100", colorCode: "1100", unit: "KG", sku: 1, price: 299, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100", colorCode: "1100", unit: "KG", sku: 12, price: 2990, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100", colorCode: "1320", unit: "KG", sku: 1, price: 299, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100", colorCode: "1320", unit: "KG", sku: 12, price: 2875, category: "Dry Mix Mortars / Premix Plasters" },
  
  // PlastoRend 100 - SKU 50 variants
  { name: "100", colorCode: "0001 B", description: "Brilliant White", unit: "KG", sku: 50, price: 6325, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "0001", description: "White", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "0003", description: "Med White", unit: "KG", sku: 50, price: 4600, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "8400 - 1 HD", description: "Adobe Buff", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "1100", description: "Dessert Sand 3", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "1101", description: "Dessert Sand 4", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "9111 TG", description: "Ash White 1", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "6110 TG", description: "Ash White 2", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "1111", description: "Dessert Sand 5", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "1211-2", description: "Dirty White", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "1200", description: "Dessert sand 1", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "1210", description: "Dessert Sand 2", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "7000 W", description: "F/F Cement Medium", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "7000 WL", description: "F/F Cement Light", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "9000 W", description: "F/F cement", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "GRG", description: "Grey 2", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "9210", description: "Grey 3", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "9110 W", description: "Medium Grey", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "TG", description: "Light Grey", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "9311 HD", description: "Grey 1", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "GOG", description: "Light Grey 2", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "NW", description: "Ultra Light Pink", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "1211", description: "Biege", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "CHG", description: "Light Walnut Brown", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "3990 X 9", description: "Red", unit: "KG", sku: 50, price: 9200, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "6800", description: "Dark Orange", unit: "KG", sku: 50, price: 9200, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "6400", description: "Light Orange", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "3400", description: "Pink", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "8820 X 2 HD", description: "Wheatish 1", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "1320", description: "Wheatish 2", unit: "KG", sku: 50, price: 5405, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "1220", description: "Wheatish 3", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "CHW", description: "Wheatish 4", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "8810 X 1", description: "Wheatish 5", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "8500 HD", description: "Dessert Sand 3", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "5211", description: "Light Sky Blue", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "5210", description: "Sky Blue", unit: "KG", sku: 50, price: 5520, category: "Dry Mix Mortars / Premix Plasters" },
  
  // Ressi TA 210
  { name: "Ressi TA 210", unit: "KG", sku: 1, price: 161, category: "Tiling and Grouting Materials" },
  { name: "Ressi TA 210", unit: "KG", sku: 15, price: 2243, category: "Tiling and Grouting Materials" },
];

async function comprehensiveVerification() {
  try {
    await connect();
    console.log('🔍 Comprehensive Price List Verification...\n');
    
    let correct = 0;
    let incorrect = 0;
    let missing = 0;
    const incorrectProducts = [];
    const missingProducts = [];
    
    for (const priceListProduct of priceListProducts) {
      // Build product name based on format
      let productName;
      if (priceListProduct.colorCode) {
        if (priceListProduct.name === "100" || priceListProduct.name === "110" || priceListProduct.name === "120") {
          // Format: "100 - 0001 B" or "Ressi PlastoRend 100 - 0001 B"
          productName = `Ressi PlastoRend ${priceListProduct.name} - ${priceListProduct.colorCode}`;
        } else {
          productName = `${priceListProduct.name} - ${priceListProduct.colorCode}`;
        }
      } else {
        productName = priceListProduct.name;
      }
      
      // Search for product in database
      const dbProduct = await Product.findOne({
        name: { $regex: new RegExp(productName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
        company_id: "RESSICHEM",
        sku: String(priceListProduct.sku),
        unit: priceListProduct.unit
      });
      
      if (!dbProduct) {
        missingProducts.push({
          name: productName,
          sku: priceListProduct.sku,
          unit: priceListProduct.unit,
          price: priceListProduct.price
        });
        missing++;
      } else if (dbProduct.price !== priceListProduct.price) {
        incorrectProducts.push({
          name: productName,
          sku: priceListProduct.sku,
          unit: priceListProduct.unit,
          expectedPrice: priceListProduct.price,
          foundPrice: dbProduct.price,
          dbName: dbProduct.name
        });
        incorrect++;
      } else {
        correct++;
      }
    }
    
    console.log(`\n📊 Verification Summary:`);
    console.log(`   ✅ Correct: ${correct}`);
    console.log(`   ⚠️  Incorrect: ${incorrect}`);
    console.log(`   ❌ Missing: ${missing}`);
    console.log(`   Total Checked: ${priceListProducts.length}`);
    
    if (incorrectProducts.length > 0) {
      console.log(`\n⚠️  Price Mismatches (${incorrectProducts.length}):`);
      incorrectProducts.slice(0, 10).forEach(p => {
        console.log(`   - ${p.name} (SKU: ${p.sku} ${p.unit})`);
        console.log(`     Expected: ${p.expectedPrice}, Found: ${p.foundPrice}`);
      });
      if (incorrectProducts.length > 10) {
        console.log(`   ... and ${incorrectProducts.length - 10} more`);
      }
    }
    
    if (missingProducts.length > 0) {
      console.log(`\n❌ Missing Products (${missingProducts.length}):`);
      missingProducts.slice(0, 10).forEach(p => {
        console.log(`   - ${p.name} (SKU: ${p.sku} ${p.unit}) - Price: ${p.price}`);
      });
      if (missingProducts.length > 10) {
        console.log(`   ... and ${missingProducts.length - 10} more`);
      }
    }
    
    if (correct === priceListProducts.length) {
      console.log(`\n✅ All products match the price list!`);
    } else {
      console.log(`\n⚠️  Some products need to be updated. Run the import script to fix them.`);
    }
    
    await disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    await disconnect();
    process.exit(1);
  }
}

// Run verification
comprehensiveVerification();


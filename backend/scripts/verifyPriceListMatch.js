// backend/scripts/verifyPriceListMatch.js
// Script to verify and update import script to match price list exactly
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

/**
 * Critical products from price list that need verification
 * Format: { name, colorCode, unit, sku, price, category }
 */
const priceListProducts = [
  // PlastoRend 100 - 50 KG variants
  { name: "100", colorCode: "0001 B", description: "Brilliant White", unit: "KG", sku: 50, price: 6325 },
  { name: "100", colorCode: "0001", description: "White", unit: "KG", sku: 50, price: 5175 },
  { name: "100", colorCode: "0003", description: "Med White", unit: "KG", sku: 50, price: 4600 },
  { name: "100", colorCode: "8400 - 1 HD", description: "Adobe Buff", unit: "KG", sku: 50, price: 5175 },
  { name: "100", colorCode: "1100", description: "Dessert Sand 3", unit: "KG", sku: 50, price: 5175 },
  { name: "100", colorCode: "1101", description: "Dessert Sand 4", unit: "KG", sku: 50, price: 5175 },
  { name: "100", colorCode: "9111 TG", description: "Ash White 1", unit: "KG", sku: 50, price: 5175 },
  { name: "100", colorCode: "6110 TG", description: "Ash White 2", unit: "KG", sku: 50, price: 5175 },
  { name: "100", colorCode: "1111", description: "Dessert Sand 5", unit: "KG", sku: 50, price: 5175 },
  { name: "100", colorCode: "1211-2", description: "Dirty White", unit: "KG", sku: 50, price: 5175 },
  { name: "100", colorCode: "1200", description: "Dessert sand 1", unit: "KG", sku: 50, price: 5175 },
  { name: "100", colorCode: "1210", description: "Dessert Sand 2", unit: "KG", sku: 50, price: 5175 },
  { name: "100", colorCode: "7000 W", description: "F/F Cement Medium", unit: "KG", sku: 50, price: 5175 },
  { name: "100", colorCode: "7000 WL", description: "F/F Cement Light", unit: "KG", sku: 50, price: 5175 },
  { name: "100", colorCode: "9000 W", description: "F/F cement", unit: "KG", sku: 50, price: 5175 },
  { name: "100", colorCode: "GRG", description: "Grey 2", unit: "KG", sku: 50, price: 5175 },
  { name: "100", colorCode: "9210", description: "Grey 3", unit: "KG", sku: 50, price: 5175 },
  { name: "100", colorCode: "9110 W", description: "Medium Grey", unit: "KG", sku: 50, price: 5175 },
  { name: "100", colorCode: "TG", description: "Light Grey", unit: "KG", sku: 50, price: 5175 },
  { name: "100", colorCode: "9311 HD", description: "Grey 1", unit: "KG", sku: 50, price: 5175 },
  { name: "100", colorCode: "GOG", description: "Light Grey 2", unit: "KG", sku: 50, price: 5175 },
  { name: "100", colorCode: "NW", description: "Ultra Light Pink", unit: "KG", sku: 50, price: 5175 },
  { name: "100", colorCode: "1211", description: "Biege", unit: "KG", sku: 50, price: 5175 },
  { name: "100", colorCode: "CHG", description: "Light Walnut Brown", unit: "KG", sku: 50, price: 5175 },
  { name: "100", colorCode: "3990 X 9", description: "Red", unit: "KG", sku: 50, price: 9200 },
  { name: "100", colorCode: "6800", description: "Dark Orange", unit: "KG", sku: 50, price: 9200 },
  { name: "100", colorCode: "6400", description: "Light Orange", unit: "KG", sku: 50, price: 5175 },
  { name: "100", colorCode: "3400", description: "Pink", unit: "KG", sku: 50, price: 5175 },
  { name: "100", colorCode: "8820 X 2 HD", description: "Wheatish 1", unit: "KG", sku: 50, price: 5175 },
  { name: "100", colorCode: "1320", description: "Wheatish 2", unit: "KG", sku: 50, price: 5405 },
  { name: "100", colorCode: "1220", description: "Wheatish 3", unit: "KG", sku: 50, price: 5175 },
  { name: "100", colorCode: "CHW", description: "Wheatish 4", unit: "KG", sku: 50, price: 5175 },
  { name: "100", colorCode: "8810 X 1", description: "Wheatish 5", unit: "KG", sku: 50, price: 5175 },
  { name: "100", colorCode: "8500 HD", description: "Dessert Sand 3", unit: "KG", sku: 50, price: 5175 },
  { name: "100", colorCode: "5211", description: "Light Sky Blue", unit: "KG", sku: 50, price: 5175 },
  { name: "100", colorCode: "5210", description: "Sky Blue", unit: "KG", sku: 50, price: 5520 },
  
  // Ressi TA 210 - verified from price list
  { name: "Ressi TA 210", unit: "KG", sku: 1, price: 161 },
  { name: "Ressi TA 210", unit: "KG", sku: 15, price: 2243 },
];

async function verifyPriceListMatch() {
  try {
    await connect();
    console.log('🔍 Verifying Price List Match...\n');
    
    let correct = 0;
    let incorrect = 0;
    let missing = 0;
    
    for (const priceListProduct of priceListProducts) {
      // Build product name based on format
      let productName;
      if (priceListProduct.colorCode) {
        productName = `Ressi PlastoRend ${priceListProduct.name} - ${priceListProduct.colorCode}`;
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
        console.log(`❌ MISSING: ${productName} - SKU: ${priceListProduct.sku} ${priceListProduct.unit} - Price: ${priceListProduct.price}`);
        missing++;
      } else if (dbProduct.price !== priceListProduct.price) {
        console.log(`⚠️  PRICE MISMATCH: ${productName} - SKU: ${priceListProduct.sku}`);
        console.log(`   Expected: ${priceListProduct.price}, Found: ${dbProduct.price}`);
        incorrect++;
      } else {
        console.log(`✅ CORRECT: ${productName} - SKU: ${priceListProduct.sku} ${priceListProduct.unit} - Price: ${priceListProduct.price}`);
        correct++;
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Correct: ${correct}`);
    console.log(`   ⚠️  Incorrect: ${incorrect}`);
    console.log(`   ❌ Missing: ${missing}`);
    console.log(`   Total: ${priceListProducts.length}`);
    
    await disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    await disconnect();
    process.exit(1);
  }
}

// Run verification
verifyPriceListMatch();


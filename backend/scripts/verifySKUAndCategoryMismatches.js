// backend/scripts/verifySKUAndCategoryMismatches.js
// Verify SKU formats and category assignments match price list
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

/**
 * Sample products from price list with expected SKU and category
 * Format: { name, colorCode, unit, sku, price, category }
 */
const priceListProducts = [
  // PlastoRend 100 - SKU 1 and 12
  { name: "Ressi PlastoRend 100", colorCode: "0001 B", unit: "KG", sku: 1, price: 299, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100", colorCode: "0001 B", unit: "KG", sku: 12, price: 2990, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100", colorCode: "0001", unit: "KG", sku: 1, price: 299, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100", colorCode: "0001", unit: "KG", sku: 12, price: 2990, category: "Dry Mix Mortars / Premix Plasters" },
  
  // PlastoRend 100 - SKU 50
  { name: "100", colorCode: "0001 B", unit: "KG", sku: 50, price: 6325, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100", colorCode: "0001", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  
  // Ressi SLS 610 - decimal SKU
  { name: "Ressi SLS 610", unit: "KG", sku: 2.18, price: 1438, category: "Building Care and Maintenance" },
  { name: "Ressi SLS 610", unit: "KG", sku: 21.8, price: 12263, category: "Building Care and Maintenance" },
  
  // Ressi TA 210
  { name: "Ressi TA 210", unit: "KG", sku: 1, price: 161, category: "Tiling and Grouting Materials" },
  { name: "Ressi TA 210", unit: "KG", sku: 15, price: 2243, category: "Tiling and Grouting Materials" },
  
  // Water Guard products
  { name: "Water Guard 3020 N", colorCode: "0001", unit: "KG", sku: 20, price: 25213, category: "Building Care and Maintenance" },
  { name: "Water Guard 1530 Econo", colorCode: "0001", unit: "KG", sku: 20, price: 15500, category: "Building Care and Maintenance" },
];

async function verifySKUAndCategories() {
  try {
    await connect();
    console.log('🔍 Verifying SKU Formats and Category Assignments...\n');
    
    let correct = 0;
    let skuMismatches = [];
    let categoryMismatches = [];
    let missing = [];
    
    for (const priceListProduct of priceListProducts) {
      // Build product name
      let productName;
      if (priceListProduct.colorCode) {
        if (priceListProduct.name === "100" || priceListProduct.name === "110" || priceListProduct.name === "120") {
          productName = `Ressi PlastoRend ${priceListProduct.name} - ${priceListProduct.colorCode}`;
        } else {
          productName = `${priceListProduct.name} - ${priceListProduct.colorCode}`;
        }
      } else {
        productName = priceListProduct.name;
      }
      
      // Build full name with SKU and unit (as stored in database)
      const fullName = `${productName} - ${priceListProduct.sku} ${priceListProduct.unit}`;
      
      // Search for product
      const dbProduct = await Product.findOne({
        name: fullName,
        company_id: "RESSICHEM"
      });
      
      if (!dbProduct) {
        // Try without SKU in name (check by SKU and unit separately)
        const dbProductAlt = await Product.findOne({
          name: { $regex: new RegExp(productName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
          company_id: "RESSICHEM",
          sku: String(priceListProduct.sku),
          unit: priceListProduct.unit
        });
        
        if (dbProductAlt) {
          // Found but name format might be different
          const expectedSKU = String(priceListProduct.sku);
          const foundSKU = String(dbProductAlt.sku);
          const expectedCategory = priceListProduct.category;
          const foundCategory = dbProductAlt.category?.mainCategory || '';
          
          if (expectedSKU !== foundSKU) {
            skuMismatches.push({
              name: productName,
              expectedSKU,
              foundSKU,
              unit: priceListProduct.unit,
              dbName: dbProductAlt.name
            });
          }
          
          if (expectedCategory !== foundCategory) {
            categoryMismatches.push({
              name: productName,
              sku: foundSKU,
              expectedCategory,
              foundCategory,
              dbName: dbProductAlt.name
            });
          }
          
          if (expectedSKU === foundSKU && expectedCategory === foundCategory) {
            correct++;
          }
        } else {
          missing.push({
            name: productName,
            sku: priceListProduct.sku,
            unit: priceListProduct.unit,
            category: priceListProduct.category
          });
        }
      } else {
        // Found exact match - verify SKU and category
        const expectedSKU = String(priceListProduct.sku);
        const foundSKU = String(dbProduct.sku);
        const expectedCategory = priceListProduct.category;
        const foundCategory = dbProduct.category?.mainCategory || '';
        
        if (expectedSKU !== foundSKU) {
          skuMismatches.push({
            name: productName,
            expectedSKU,
            foundSKU,
            unit: priceListProduct.unit,
            dbName: dbProduct.name
          });
        }
        
        if (expectedCategory !== foundCategory) {
          categoryMismatches.push({
            name: productName,
            sku: foundSKU,
            expectedCategory,
            foundCategory,
            dbName: dbProduct.name
          });
        }
        
        if (expectedSKU === foundSKU && expectedCategory === foundCategory) {
          correct++;
        }
      }
    }
    
    console.log(`\n📊 Verification Summary:`);
    console.log(`   ✅ Correct: ${correct}`);
    console.log(`   ⚠️  SKU Mismatches: ${skuMismatches.length}`);
    console.log(`   ⚠️  Category Mismatches: ${categoryMismatches.length}`);
    console.log(`   ❌ Missing: ${missing.length}`);
    console.log(`   Total Checked: ${priceListProducts.length}\n`);
    
    if (skuMismatches.length > 0) {
      console.log(`⚠️  SKU Mismatches (${skuMismatches.length}):`);
      skuMismatches.slice(0, 10).forEach(p => {
        console.log(`   - ${p.name} (${p.unit})`);
        console.log(`     Expected SKU: ${p.expectedSKU}, Found SKU: ${p.foundSKU}`);
        console.log(`     DB Name: ${p.dbName}`);
      });
      if (skuMismatches.length > 10) {
        console.log(`   ... and ${skuMismatches.length - 10} more`);
      }
      console.log('');
    }
    
    if (categoryMismatches.length > 0) {
      console.log(`⚠️  Category Mismatches (${categoryMismatches.length}):`);
      categoryMismatches.slice(0, 10).forEach(p => {
        console.log(`   - ${p.name} (SKU: ${p.sku})`);
        console.log(`     Expected: "${p.expectedCategory}"`);
        console.log(`     Found: "${p.foundCategory}"`);
        console.log(`     DB Name: ${p.dbName}`);
      });
      if (categoryMismatches.length > 10) {
        console.log(`   ... and ${categoryMismatches.length - 10} more`);
      }
      console.log('');
    }
    
    if (missing.length > 0) {
      console.log(`❌ Missing Products (${missing.length}):`);
      missing.slice(0, 10).forEach(p => {
        console.log(`   - ${p.name} (SKU: ${p.sku} ${p.unit}) - Category: ${p.category}`);
      });
      if (missing.length > 10) {
        console.log(`   ... and ${missing.length - 10} more`);
      }
      console.log('');
    }
    
    await disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    await disconnect();
    process.exit(1);
  }
}

// Run verification
verifySKUAndCategories();


// backend/scripts/verifyProducts.js
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

// Sample products from the user's list to verify
// This is a subset - you can add more products to verify
const productsToVerify = [
  // PlastoRend 100 products
  { name: "100 - 0001 B (Brilliant White)", unit: "KG", sku: "50", price: 6325, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100 - 0001 (White)", unit: "KG", sku: "50", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100 - 0003 (Med White)", unit: "KG", sku: "50", price: 4600, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100 - 8400 - 1 HD (Adobe Buff)", unit: "KG", sku: "50", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100 - 1100 (Dessert Sand 3)", unit: "KG", sku: "50", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100 - 1101 (Dessert Sand 4)", unit: "KG", sku: "50", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100 - 9111 TG (Ash White 1)", unit: "KG", sku: "50", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100 - 6110 TG (Ash White 2)", unit: "KG", sku: "50", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100 - 1111 (Dessert Sand 5)", unit: "KG", sku: "50", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100 - 1211-2 (Dirty White)", unit: "KG", sku: "50", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100 - 1200 (Dessert sand 1 )", unit: "KG", sku: "50", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100 - 1210 (Dessert Sand 2)", unit: "KG", sku: "50", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100 - 3990 X 9 (Red)", unit: "KG", sku: "50", price: 9200, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "100 - 6800 (Dark Orange)", unit: "KG", sku: "50", price: 9200, category: "Dry Mix Mortars / Premix Plasters" },
  
  // PlastoRend 110 products
  { name: "110 - 0001 B (Brilliant White)", unit: "KG", sku: "50", price: 6900, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "110 - 0001 (White)", unit: "KG", sku: "50", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  
  // PlastoRend 120 C products
  { name: "RPR 120 C- 0001 B (Brilliant White)", unit: "KG", sku: "50", price: 3335, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C - 0001 (White)", unit: "KG", sku: "50", price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  
  // SC 310 products
  { name: "Ressi SC 310 - 0001 (Pasty White)", unit: "KG", sku: "50", price: 10925, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310 - 1100 (Harvest Sand)", unit: "KG", sku: "50", price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  
  // Building Care and Maintenance
  { name: "Tough Guard 12,000 E", unit: "KG", sku: "50", price: 1380, category: "Building Care and Maintenance" },
  { name: "Water Guard 491", unit: "KG", sku: "50", price: 1380, category: "Building Care and Maintenance" },
  { name: "Water Guard 5010", unit: "KG", sku: "50", price: 10206, category: "Building Care and Maintenance" },
  { name: "Ressi BRC 7000", unit: "KG", sku: "50", price: 2875, category: "Building Care and Maintenance" },
  { name: "Ressi Lime O Might 8000", unit: "KG", sku: "1", price: 250, category: "Building Care and Maintenance" },
  { name: "Ressi Lime O Might 8000", unit: "KG", sku: "20", price: 4000, category: "Building Care and Maintenance" },
  { name: "Ressi Gyps O Might 9000", unit: "KG", sku: "1", price: 344, category: "Building Care and Maintenance" },
  { name: "Ressi Gyps O Might 9000", unit: "KG", sku: "20", price: 4750, category: "Building Care and Maintenance" },
  { name: "Ressi SLS 610", unit: "KG", sku: "2.18", price: 1438, category: "Building Care and Maintenance" },
  { name: "Ressi SLS 610", unit: "KG", sku: "21.8", price: 12263, category: "Building Care and Maintenance" },
  { name: "Ressi BLM 510", unit: "KG", sku: "1", price: 1563, category: "Building Care and Maintenance" },
  { name: "Ressi BLM 510", unit: "KG", sku: "20", price: 26875, category: "Building Care and Maintenance" },
  
  // Water Guard products
  { name: "Water Guard 3020 N - 0001 (White)", unit: "KG", sku: "20", price: 25213, category: "Building Care and Maintenance" },
  { name: "Water Guard 3020 N - 9400 (Grey)", unit: "KG", sku: "20", price: 25213, category: "Building Care and Maintenance" },
  { name: "Water Guard 1530 Econo - 0001 (White)", unit: "KG", sku: "20", price: 15500, category: "Building Care and Maintenance" },
  { name: "Water Guard 1810 - 0001 (White)", unit: "KG", sku: "20", price: 22000, category: "Building Care and Maintenance" },
  
  // Tiling and Grouting Materials
  { name: "810 - 0001 (Bright White)", unit: "KG", sku: "1", price: 161, category: "Tiling and Grouting Materials" },
  { name: "810 - 0001 (Bright White)", unit: "KG", sku: "15", price: 2243, category: "Tiling and Grouting Materials" },
  { name: "810 -1110 (Ivory)", unit: "KG", sku: "1", price: 161, category: "Tiling and Grouting Materials" },
  { name: "810 -1110 (Ivory)", unit: "KG", sku: "15", price: 2243, category: "Tiling and Grouting Materials" },
  { name: "Ressi TA 210", unit: "KG", sku: "1", price: 161, category: "Tiling and Grouting Materials" },
  { name: "Ressi TA 210", unit: "KG", sku: "15", price: 2243, category: "Tiling and Grouting Materials" },
  
  // Concrete Admixtures
  { name: "Max Flo P", unit: "LTR", sku: "1", price: 489, category: "Concrete Admixtures" },
  { name: "Max Flo P", unit: "LTR", sku: "5", price: 1955, category: "Concrete Admixtures" },
  { name: "Max Flo P", unit: "LTR", sku: "10", price: 3680, category: "Concrete Admixtures" },
  { name: "Max Flo P", unit: "LTR", sku: "15", price: 5175, category: "Concrete Admixtures" },
  { name: "Max Flo P", unit: "LTR", sku: "25", price: 8050, category: "Concrete Admixtures" },
  { name: "Max Flo P", unit: "LTR", sku: "200", price: 59800, category: "Concrete Admixtures" },
  { name: "Max Flo P 800", unit: "LTR", sku: "1", price: 529, category: "Concrete Admixtures" },
  { name: "Max Flo P 800", unit: "LTR", sku: "5", price: 2070, category: "Concrete Admixtures" },
  { name: "Max Flo P 800", unit: "LTR", sku: "10", price: 4025, category: "Concrete Admixtures" },
  { name: "Max Flo P 800", unit: "LTR", sku: "15", price: 5865, category: "Concrete Admixtures" },
  { name: "Max Flo P 800", unit: "LTR", sku: "25", price: 9488, category: "Concrete Admixtures" },
  { name: "Max Flo P 800", unit: "LTR", sku: "200", price: 71300, category: "Concrete Admixtures" },
];

async function verifyProducts() {
  try {
    await connect();
    console.log('🔍 Verifying Products...\n');
    
    const results = {
      found: [],
      missing: [],
      incorrect: [],
      total: productsToVerify.length
    };
    
    for (const productToVerify of productsToVerify) {
      // Try to find the product by name (case-insensitive) and company_id
      const product = await Product.findOne({
        $or: [
          { name: { $regex: new RegExp(productToVerify.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }, company_id: 'RESSICHEM' },
          { name: productToVerify.name, company_id: 'RESSICHEM' }
        ]
      });
      
      if (!product) {
        results.missing.push({
          ...productToVerify,
          reason: 'Product not found in database'
        });
        continue;
      }
      
      // Check if SKU, price, unit, and category match
      const issues = [];
      if (product.sku !== productToVerify.sku) {
        issues.push(`SKU mismatch: expected "${productToVerify.sku}", found "${product.sku}"`);
      }
      if (product.price !== productToVerify.price) {
        issues.push(`Price mismatch: expected ${productToVerify.price}, found ${product.price}`);
      }
      if (product.unit !== productToVerify.unit) {
        issues.push(`Unit mismatch: expected "${productToVerify.unit}", found "${product.unit}"`);
      }
      
      // Check category (handle both string and object format)
      let categoryMatch = false;
      if (typeof product.category === 'string') {
        categoryMatch = product.category.includes(productToVerify.category) || 
                       productToVerify.category.includes(product.category);
      } else if (product.category && typeof product.category === 'object') {
        const mainCategory = product.category.mainCategory || '';
        categoryMatch = mainCategory.includes(productToVerify.category) || 
                       productToVerify.category.includes(mainCategory);
      }
      
      if (!categoryMatch) {
        issues.push(`Category mismatch: expected "${productToVerify.category}", found "${JSON.stringify(product.category)}"`);
      }
      
      if (issues.length > 0) {
        results.incorrect.push({
          ...productToVerify,
          found: {
            name: product.name,
            sku: product.sku,
            price: product.price,
            unit: product.unit,
            category: product.category
          },
          issues
        });
      } else {
        results.found.push({
          name: product.name,
          sku: product.sku,
          price: product.price,
          unit: product.unit,
          category: product.category
        });
      }
    }
    
    // Print results
    console.log('📊 Verification Results:\n');
    console.log(`✅ Found and correct: ${results.found.length}/${results.total}`);
    console.log(`❌ Missing: ${results.missing.length}/${results.total}`);
    console.log(`⚠️  Incorrect data: ${results.incorrect.length}/${results.total}\n`);
    
    if (results.found.length > 0) {
      console.log('✅ Correct Products:');
      results.found.slice(0, 10).forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.name} - ${p.sku} ${p.unit} - PKR ${p.price}`);
      });
      if (results.found.length > 10) {
        console.log(`   ... and ${results.found.length - 10} more`);
      }
      console.log('');
    }
    
    if (results.missing.length > 0) {
      console.log('❌ Missing Products:');
      results.missing.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.name} - ${p.sku} ${p.unit} - PKR ${p.price}`);
      });
      console.log('');
    }
    
    if (results.incorrect.length > 0) {
      console.log('⚠️  Products with Incorrect Data:');
      results.incorrect.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.name}`);
        console.log(`      Expected: ${p.sku} ${p.unit} - PKR ${p.price} - ${p.category}`);
        console.log(`      Found: ${p.found.sku} ${p.found.unit} - PKR ${p.found.price} - ${JSON.stringify(p.found.category)}`);
        p.issues.forEach(issue => console.log(`      ⚠️  ${issue}`));
        console.log('');
      });
    }
    
    // Summary
    console.log('\n📈 Summary:');
    console.log(`   Total products to verify: ${results.total}`);
    console.log(`   ✅ Correct: ${results.found.length} (${((results.found.length / results.total) * 100).toFixed(1)}%)`);
    console.log(`   ❌ Missing: ${results.missing.length} (${((results.missing.length / results.total) * 100).toFixed(1)}%)`);
    console.log(`   ⚠️  Incorrect: ${results.incorrect.length} (${((results.incorrect.length / results.total) * 100).toFixed(1)}%)`);
    
    // Get total product count
    const totalProducts = await Product.countDocuments({ company_id: 'RESSICHEM' });
    console.log(`\n📦 Total products in database: ${totalProducts}`);
    
  } catch (error) {
    console.error('❌ Error verifying products:', error);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  verifyProducts();
}

module.exports = verifyProducts;

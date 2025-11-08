// backend/scripts/fixProductMismatches.js
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

// Products from user's list that need to be fixed/added
const productsToFix = [
  // Fix category for Ressi BLM 510
  { name: "Ressi BLM 510", sku: "1", unit: "KG", price: 1563, category: "Building Care and Maintenance" },
  { name: "Ressi BLM 510", sku: "20", unit: "KG", price: 26875, category: "Building Care and Maintenance" },
  
  // Add missing SKU variants for Ressi Lime O Might 8000
  { name: "Ressi Lime O Might 8000", sku: "1", unit: "KG", price: 250, category: "Building Care and Maintenance" },
  { name: "Ressi Lime O Might 8000", sku: "20", unit: "KG", price: 4000, category: "Building Care and Maintenance" },
  
  // Add missing SKU variants for Ressi Gyps O Might 9000
  { name: "Ressi Gyps O Might 9000", sku: "1", unit: "KG", price: 344, category: "Building Care and Maintenance" },
  { name: "Ressi Gyps O Might 9000", sku: "20", unit: "KG", price: 4750, category: "Building Care and Maintenance" },
  
  // Add missing SKU variants for Ressi SLS 610
  { name: "Ressi SLS 610", sku: "2.18", unit: "KG", price: 1438, category: "Building Care and Maintenance" },
  { name: "Ressi SLS 610", sku: "21.8", unit: "KG", price: 12263, category: "Building Care and Maintenance" },
  
  // PlastoRend 100 products - 50 KG variants
  { name: "Ressi PlastoRend 100 - 0001 B (Brilliant White)", sku: "50", unit: "KG", price: 6325, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 0001 (White)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 0003 (Med White)", sku: "50", unit: "KG", price: 4600, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 8400 - 1 HD (Adobe Buff)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 1100 (Dessert Sand 3)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 1101 (Dessert Sand 4)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 9111 TG (Ash White 1)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 6110 TG (Ash White 2)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 1111 (Dessert Sand 5)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 1211-2 (Dirty White)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 1200 (Dessert sand 1 )", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 1210 (Dessert Sand 2)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 7000 W (F/F Cement Medium)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 7000 WL (F/F Cement Light)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 9000 W ( F/F cement)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - GRG (Grey 2)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 9210 (Grey 3)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 9110 W (Medium Grey )", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - TG (Light Grey)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 9311 HD (Grey 1)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - GOG (Light Grey 2)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - NW ( Ultra Light Pink)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 1211 (Biege)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - CHG (Light Walnut Brown)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 3990 X 9 (Red)", sku: "50", unit: "KG", price: 9200, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 6800 (Dark Orange)", sku: "50", unit: "KG", price: 9200, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 6400 (Light Orange)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 3400 (Pink)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 8820 X 2 HD (Wheatish 1)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 1320 (Wheatish 2)", sku: "50", unit: "KG", price: 5405, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - 1220 (Wheatish 3)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 100 - CHW (Wheatish 4)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  
  // PlastoRend 110 products - 50 KG variants
  { name: "Ressi PlastoRend 110 - 0001 B (Brilliant White)", sku: "50", unit: "KG", price: 6900, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 110 - 0001 (White)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 110 - 0003 (Med White)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 110 - 8400 - 1 HD (Adobe Buff)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi PlastoRend 110 - 1100 (Dessert Sand 3)", sku: "50", unit: "KG", price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
  
  // PlastoRend 120 C products - 50 KG variants
  { name: "RPR 120 C - 0001 B (Brilliant White)", sku: "50", unit: "KG", price: 3335, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C - 0001 (White)", sku: "50", unit: "KG", price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "RPR 120 C - 0003 (Med White)", sku: "50", unit: "KG", price: 2415, category: "Dry Mix Mortars / Premix Plasters" },
  
  // SC 310 products - 50 KG variants
  { name: "Ressi SC 310 - 0001 (Pasty White)", sku: "50", unit: "KG", price: 10925, category: "Dry Mix Mortars / Premix Plasters" },
  { name: "Ressi SC 310 - 1100 (Harvest Sand)", sku: "50", unit: "KG", price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
  
  // Water Guard 1810
  { name: "Water Guard 1810", sku: "20", unit: "KG", price: 22000, category: "Building Care and Maintenance" },
  
  // Tiling and Grouting Materials - 810 products
  { name: "Ressi TG 810 - 0001 (Bright White)", sku: "1", unit: "KG", price: 161, category: "Tiling and Grouting Materials" },
  { name: "Ressi TG 810 - 0001 (Bright White)", sku: "15", unit: "KG", price: 2243, category: "Tiling and Grouting Materials" },
  { name: "Ressi TG 810 -1110 (Ivory)", sku: "1", unit: "KG", price: 161, category: "Tiling and Grouting Materials" },
  { name: "Ressi TG 810 -1110 (Ivory)", sku: "15", unit: "KG", price: 2243, category: "Tiling and Grouting Materials" },
];

async function fixProductMismatches() {
  try {
    await connect();
    console.log('🔧 Fixing Product Mismatches...\n');
    
    let fixed = 0;
    let created = 0;
    let updated = 0;
    let errors = [];
    
    for (const productInfo of productsToFix) {
      try {
        // Create full product name with SKU and unit
        const productName = `${productInfo.name} - ${productInfo.sku} ${productInfo.unit}`;
        
        // Try to find existing product by name pattern
        const namePattern = productInfo.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const nameRegex = new RegExp(namePattern, 'i');
        
        const existingProduct = await Product.findOne({
          company_id: 'RESSICHEM',
          $or: [
            { name: productName },
            { name: { $regex: nameRegex }, sku: String(productInfo.sku), unit: productInfo.unit }
          ]
        });
        
        const productPayload = {
          name: productName,
          description: productInfo.name,
          price: productInfo.price,
          unit: productInfo.unit,
          sku: String(productInfo.sku),
          category: {
            mainCategory: productInfo.category,
            subCategory: productInfo.name.includes('PlastoRend') ? 'PlastoRend' :
                         productInfo.name.includes('Water Guard') ? 'Water Guard' :
                         productInfo.name.includes('Ressi TG') ? 'Tile Adhesives' :
                         productInfo.name.includes('Ressi BLM') ? 'Building Care' :
                         productInfo.name.includes('Ressi Lime') ? 'Building Care' :
                         productInfo.name.includes('Ressi Gyps') ? 'Building Care' :
                         productInfo.name.includes('Ressi SLS') ? 'Building Care' :
                         productInfo.name.includes('Ressi SC') ? 'SC Series' :
                         productInfo.name.includes('RPR') ? 'PlastoRend 120 C' : ''
          },
          company_id: 'RESSICHEM',
          stock: 0,
          minStock: 0,
          isActive: true
        };
        
        if (existingProduct) {
          // Update existing product
          await Product.findByIdAndUpdate(existingProduct._id, productPayload, { new: true });
          updated++;
          console.log(`✅ Updated: ${productName} - PKR ${productInfo.price}`);
        } else {
          // Create new product
          await Product.create(productPayload);
          created++;
          console.log(`✨ Created: ${productName} - PKR ${productInfo.price}`);
        }
        fixed++;
      } catch (error) {
        errors.push({ product: productInfo.name, error: error.message });
        console.error(`❌ Error processing ${productInfo.name}:`, error.message);
      }
    }
    
    console.log('\n📊 Fix Summary:');
    console.log(`   Total products processed: ${productsToFix.length}`);
    console.log(`   ✅ Fixed/Processed: ${fixed}`);
    console.log(`   ✨ Created: ${created}`);
    console.log(`   🔄 Updated: ${updated}`);
    console.log(`   ❌ Errors: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('\n❌ Errors:');
      errors.forEach(err => {
        console.log(`   - ${err.product}: ${err.error}`);
      });
    }
    
    console.log('\n✅ Product mismatch fixing completed!');
    
  } catch (error) {
    console.error('❌ Error fixing products:', error);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  fixProductMismatches();
}

module.exports = fixProductMismatches;


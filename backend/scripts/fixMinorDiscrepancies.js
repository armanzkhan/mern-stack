// backend/scripts/fixMinorDiscrepancies.js
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

async function fixMinorDiscrepancies() {
  try {
    await connect();
    console.log("🔧 Fixing minor discrepancies...\n");

    // Fix 1: Products without SKU
    console.log("📊 Fix 1: Products without SKU");
    const productsWithoutSku = await Product.find({
      company_id: "RESSICHEM",
      isActive: true,
      $or: [
        { sku: { $exists: false } },
        { sku: "" },
        { sku: null }
      ]
    }).select('name sku unit');

    console.log(`   Found ${productsWithoutSku.length} products without SKU`);
    
    if (productsWithoutSku.length > 0) {
      console.log("   Sample products without SKU:");
      productsWithoutSku.slice(0, 5).forEach(p => {
        console.log(`      - ${p.name}`);
      });

      // Try to extract SKU from name
      let fixed = 0;
      for (const product of productsWithoutSku) {
        // Pattern: "Name - SKU UNIT" or "Name - SKU UNIT"
        const skuMatch = product.name.match(/- (\d+(?:\.\d+)?)\s*(KG|LTR|GM)$/);
        if (skuMatch) {
          await Product.findByIdAndUpdate(product._id, {
            sku: skuMatch[1],
            unit: skuMatch[2]
          });
          fixed++;
        }
      }
      console.log(`   ✅ Fixed ${fixed} products by extracting SKU from name`);
    }

    // Fix 2: GM unit conversion
    console.log("\n📊 Fix 2: GM Unit Conversion");
    const gmProducts = await Product.find({
      company_id: "RESSICHEM",
      isActive: true,
      unit: "GM"
    }).select('name sku unit price');

    console.log(`   Found ${gmProducts.length} products with GM unit`);
    
    if (gmProducts.length > 0) {
      // Convert GM to KG (1 KG = 1000 GM)
      let converted = 0;
      for (const product of gmProducts) {
        // If SKU is in GM (like 615 GM = 0.615 KG), convert
        const skuNum = parseFloat(product.sku);
        if (skuNum > 0 && skuNum < 1000) {
          const kgSku = (skuNum / 1000).toFixed(3);
          await Product.findByIdAndUpdate(product._id, {
            unit: "KG",
            sku: kgSku.toString()
          });
          converted++;
        }
      }
      console.log(`   ✅ Converted ${converted} products from GM to KG`);
      
      // For products that should stay as GM (very small packages), keep them
      const remainingGm = gmProducts.length - converted;
      if (remainingGm > 0) {
        console.log(`   ℹ️  ${remainingGm} products kept as GM (very small packages)`);
      }
    }

    // Fix 3: Verify product naming patterns
    console.log("\n📊 Fix 3: Verify Product Name Patterns");
    
    // Check PlastoRend 120 - might be named differently
    const plastoRend120 = await Product.find({
      name: /PlastoRend 120/i,
      company_id: "RESSICHEM",
      isActive: true
    }).select('name').limit(5);

    console.log(`   Found ${plastoRend120.length} PlastoRend 120 products`);
    if (plastoRend120.length < 30) {
      // Check for RPR 120 C pattern
      const rpr120 = await Product.find({
        name: /RPR 120/i,
        company_id: "RESSICHEM",
        isActive: true
      }).countDocuments();
      
      console.log(`   Found ${rpr120} RPR 120 C products (PlastoRend 120 series)`);
      console.log(`   ℹ️  Total PlastoRend 120 series: ${plastoRend120.length + rpr120} products`);
    }

    // Check DecoRend
    const decoRend = await Product.find({
      name: /DecoRend/i,
      company_id: "RESSICHEM",
      isActive: true
    }).countDocuments();

    if (decoRend === 0) {
      // Check for RDR pattern
      const rdr = await Product.find({
        name: /RDR/i,
        company_id: "RESSICHEM",
        isActive: true
      }).select('name').limit(10);
      
      console.log(`   Found ${rdr.length} RDR products (DecoRend series)`);
    }

    // Final summary
    console.log("\n📊 Final Summary:");
    const finalCount = await Product.countDocuments({
      company_id: "RESSICHEM",
      isActive: true
    });
    
    const finalWithSku = await Product.countDocuments({
      company_id: "RESSICHEM",
      isActive: true,
      sku: { $exists: true, $ne: "" }
    });

    const finalUnits = await Product.distinct('unit', {
      company_id: "RESSICHEM",
      isActive: true
    });

    console.log(`   Total Products: ${finalCount}`);
    console.log(`   Products with SKU: ${finalWithSku} (${((finalWithSku/finalCount)*100).toFixed(1)}%)`);
    console.log(`   Units: ${finalUnits.join(', ')}`);

    console.log("\n✅ Minor discrepancies fixed!");

  } catch (error) {
    console.error("❌ Error fixing discrepancies:", error);
    process.exit(1);
  } finally {
    await disconnect();
  }
}

// Run fix
if (require.main === module) {
  fixMinorDiscrepancies()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { fixMinorDiscrepancies };


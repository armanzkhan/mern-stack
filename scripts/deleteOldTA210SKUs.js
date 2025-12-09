// backend/scripts/deleteOldTA210SKUs.js
// Delete old SKU 1 and 15 variants of Ressi TA 210
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

async function deleteOldTA210SKUs() {
  try {
    await connect();
    console.log('🗑️  Deleting old SKU variants for Ressi TA 210...\n');
    
    // Delete SKU 1 and 15 variants (keep only SKU 20)
    const deleted = await Product.deleteMany({
      name: "Ressi TA 210 - 1 KG",
      company_id: "RESSICHEM"
    });
    console.log(`✅ Deleted ${deleted.deletedCount} products: Ressi TA 210 - 1 KG`);
    
    const deleted2 = await Product.deleteMany({
      name: "Ressi TA 210 - 15 KG",
      company_id: "RESSICHEM"
    });
    console.log(`✅ Deleted ${deleted2.deletedCount} products: Ressi TA 210 - 15 KG`);
    
    // Verify only SKU 20 exists
    const remaining = await Product.find({
      name: { $regex: /^Ressi TA 210$/i },
      company_id: "RESSICHEM"
    }).select('name sku unit price');
    
    console.log(`\n📊 Remaining Ressi TA 210 products:`);
    remaining.forEach(p => {
      console.log(`  - ${p.name} - ${p.sku} ${p.unit} - ${p.price} PKR`);
    });
    
    if (remaining.length === 1 && remaining[0].sku === "20") {
      console.log(`\n✅ Success! Ressi TA 210 now has only SKU 20`);
    } else {
      console.log(`\n⚠️  Warning: Expected 1 product with SKU 20, but found different`);
    }
    
    await disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    await disconnect();
    process.exit(1);
  }
}

deleteOldTA210SKUs();


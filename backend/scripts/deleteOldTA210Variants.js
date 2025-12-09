// backend/scripts/deleteOldTA210Variants.js
// Delete old SKU 1 and 15 variants of Ressi TA 210 and Ressi TA 210 Plus
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

async function deleteOldTA210Variants() {
  try {
    await connect();
    console.log('🗑️  Deleting old SKU variants for Ressi TA 210 and Ressi TA 210 Plus...\n');
    
    // Delete SKU 1 and 15 variants (keep only SKU 20)
    const deleted1 = await Product.deleteMany({
      name: { $in: ["Ressi TA 210 - 1 KG", "Ressi TA 210 Plus - 1 KG"] },
      company_id: "RESSICHEM"
    });
    console.log(`✅ Deleted ${deleted1.deletedCount} products with SKU 1`);
    
    const deleted2 = await Product.deleteMany({
      name: { $in: ["Ressi TA 210 - 15 KG", "Ressi TA 210 Plus - 15 KG"] },
      company_id: "RESSICHEM"
    });
    console.log(`✅ Deleted ${deleted2.deletedCount} products with SKU 15`);
    
    // Verify only SKU 20 exists
    const remaining = await Product.find({
      name: { $regex: /^Ressi TA 210/i },
      company_id: "RESSICHEM"
    }).select('name sku unit price').sort('name');
    
    console.log(`\n📊 Remaining Ressi TA 210 products:`);
    remaining.forEach(p => {
      console.log(`  - ${p.name} - ${p.sku} ${p.unit} - ${p.price} PKR`);
    });
    
    await disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    await disconnect();
    process.exit(1);
  }
}

deleteOldTA210Variants();


// backend/scripts/removeDuplicateProduct.js
// Remove duplicate product from database
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

async function removeDuplicate() {
  try {
    await connect();
    console.log("🔍 REMOVING DUPLICATE PRODUCT");
    console.log("=".repeat(80));
    
    const duplicateName = "Ressi PlastoRend 100 (Market Grade) - 50 KG";
    
    const duplicates = await Product.find({
      name: duplicateName,
      company_id: "RESSICHEM"
    });
    
    console.log(`Found ${duplicates.length} products with name: ${duplicateName}\n`);
    
    if (duplicates.length > 1) {
      // Keep the first one, deactivate the rest
      const toKeep = duplicates[0];
      const toDeactivate = duplicates.slice(1);
      
      console.log(`✅ Keeping: ${toKeep._id} (Price: ${toKeep.price}, Active: ${toKeep.isActive})`);
      
      for (const dup of toDeactivate) {
        await Product.findByIdAndUpdate(dup._id, { $set: { isActive: false } });
        console.log(`❌ Deactivated duplicate: ${dup._id} (Price: ${dup.price})`);
      }
      
      console.log(`\n✅ Removed ${toDeactivate.length} duplicate(s)`);
    } else {
      console.log("✅ No duplicates found");
    }
    
    await disconnect();
  } catch (error) {
    console.error("❌ Error:", error);
    await disconnect();
    process.exit(1);
  }
}

removeDuplicate();


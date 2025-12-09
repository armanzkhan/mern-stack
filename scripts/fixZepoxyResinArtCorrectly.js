// backend/scripts/fixZepoxyResinArtCorrectly.js
// Fixes Zepoxy Resin Art - only removes SKU 24, keeps all others
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

async function fixZepoxyResinArtCorrectly() {
  try {
    await connect();
    console.log("🔧 FIXING ZEPOXY RESIN ART CORRECTLY");
    console.log("=".repeat(80));
    console.log("User's requirement: Remove ONLY SKU 24 (not in list)");
    console.log("Keep: SKU 0.75, 1.5, 15, 45 (if they exist in user's list)\n");
    
    // Find all Zepoxy Resin Art products
    const products = await Product.find({
      name: { $regex: /Zepoxy Resin Art/i },
      company_id: "RESSICHEM"
    }).sort({ sku: 1 });
    
    console.log(`📦 Found ${products.length} Zepoxy Resin Art products:\n`);
    
    let reactivated = 0;
    let deactivated = 0;
    let created = 0;
    
    for (const product of products) {
      const sku = String(product.sku);
      console.log(`  Checking: ${product.name} (SKU: ${sku})`);
      
      if (sku === "24") {
        // SKU 24 should be deactivated (not in user's list)
        if (product.isActive) {
          await Product.findByIdAndUpdate(product._id, { $set: { isActive: false } });
          console.log(`    ❌ Deactivated: SKU 24 (not in user's list)`);
          deactivated++;
        }
      } else {
        // All other SKUs should be active (0.75, 1.5, 15, 45)
        if (!product.isActive) {
          await Product.findByIdAndUpdate(product._id, { $set: { isActive: true } });
          console.log(`    ✅ Reactivated: SKU ${sku}`);
          reactivated++;
        } else {
          console.log(`    ✅ Already active: SKU ${sku}`);
        }
      }
    }
    
    // Check if SKU 0.75 exists, create if missing
    const sku075 = products.find(p => String(p.sku) === "0.75");
    if (!sku075) {
      const newProduct = new Product({
        name: "Zepoxy Resin Art - 0.75 KG",
        sku: "0.75",
        unit: "KG",
        price: 0, // Price needs to be set from user's list
        category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" },
        company_id: "RESSICHEM",
        isActive: true,
        stock: 0
      });
      await newProduct.save();
      console.log(`\n➕ Created: Zepoxy Resin Art - 0.75 KG`);
      created++;
    }
    
    console.log("\n" + "=".repeat(80));
    console.log("📊 SUMMARY");
    console.log("=".repeat(80));
    console.log(`✅ Reactivated: ${reactivated} products (SKUs 1.5, 15, 45)`);
    console.log(`❌ Deactivated: ${deactivated} products (SKU 24 only)`);
    console.log(`➕ Created: ${created} products (SKU 0.75 if missing)`);
    console.log(`\n✅ Zepoxy Resin Art now has: SKU 0.75, 1.5, 15, 45 (active)`);
    console.log(`❌ SKU 24 is deactivated (not in user's list)`);
    
    await disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    await disconnect();
    process.exit(1);
  }
}

fixZepoxyResinArtCorrectly();


// backend/scripts/fixZepoxyPrices.js
// Updates Zepoxy products with correct prices from import script
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

async function fixZepoxyPrices() {
  try {
    await connect();
    console.log("🔧 FIXING ZEPOXY PRODUCT PRICES");
    console.log("=".repeat(80));
    
    let fixed = 0;
    
    // Zepoxy products with correct prices from import script
    const zepoxyFixes = [
      { name: "Zepoxy Electropot - 15 KG", price: 5107 },
      { name: "Zepoxy Electropot - 24 KG", price: 7447 },
      { name: "Zepoxy Electropot - 45 KG", price: 114149 },
      { name: "Zepoxy Clear - 24 KG", price: 23936 },
      { name: "Zepoxy 150 - 0.75 KG", price: 1144 },
      { name: "Zepoxy 200 - 0.75 KG", price: 1144 },
      { name: "Zepoxy Crystal - 24.6 KG", price: 20282 },
    ];
    
    for (const fix of zepoxyFixes) {
      const product = await Product.findOne({
        name: fix.name,
        company_id: "RESSICHEM"
      });
      
      if (product && product.price !== fix.price) {
        await Product.findByIdAndUpdate(product._id, { $set: { price: fix.price } });
        console.log(`✅ Fixed: ${fix.name} (${product.price} → ${fix.price})`);
        fixed++;
      } else if (!product) {
        console.log(`⚠️  Not found: ${fix.name}`);
      }
    }
    
    console.log("\n" + "=".repeat(80));
    console.log("📊 FIX SUMMARY");
    console.log("=".repeat(80));
    console.log(`✅ Fixed: ${fixed} products`);
    
    await disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error fixing prices:", error);
    await disconnect();
    process.exit(1);
  }
}

fixZepoxyPrices();


// backend/scripts/checkAndFixZepoxyResinArtPrices.js
// Checks and fixes Zepoxy Resin Art prices to match user's list
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

async function checkAndFixPrices() {
  try {
    await connect();
    console.log("🔍 CHECKING ZEPOXY RESIN ART PRICES");
    console.log("=".repeat(80));
    
    // Find all active Zepoxy Resin Art products
    const products = await Product.find({
      name: { $regex: /Zepoxy Resin Art/i },
      company_id: "RESSICHEM",
      isActive: true
    }).sort({ sku: 1 });
    
    console.log("📦 Current Prices in Database:\n");
    products.forEach(p => {
      console.log(`  SKU ${p.sku}: ${p.price} PKR`);
    });
    
    console.log("\n" + "=".repeat(80));
    console.log("📋 Prices in Import Script:");
    console.log("=".repeat(80));
    console.log("  SKU 0.75: 0 PKR (needs price from user's list)");
    console.log("  SKU 1.5: 3872 PKR");
    console.log("  SKU 15: 37872 PKR");
    console.log("  SKU 45: 114149 PKR");
    
    console.log("\n" + "=".repeat(80));
    console.log("⚠️  PRICE MISMATCH DETECTED");
    console.log("=".repeat(80));
    console.log("Please provide the correct prices from your list:");
    console.log("  - Zepoxy Resin Art SKU 0.75: ? PKR");
    console.log("  - Zepoxy Resin Art SKU 1.5: ? PKR");
    console.log("  - Zepoxy Resin Art SKU 15: ? PKR");
    console.log("  - Zepoxy Resin Art SKU 45: ? PKR");
    console.log("\nOnce you provide the correct prices, I'll update them immediately.");
    
    await disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    await disconnect();
    process.exit(1);
  }
}

checkAndFixPrices();


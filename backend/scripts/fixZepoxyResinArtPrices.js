// backend/scripts/fixZepoxyResinArtPrices.js
// Updates Zepoxy Resin Art prices to match user's list
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

// Correct prices from user's list
const correctPrices = {
  "0.75": 1170.21,
  "1.5": 2170.21,
  "15": 19680.85,
  "45": 59042.55
};

async function fixPrices() {
  try {
    await connect();
    console.log("🔧 UPDATING ZEPOXY RESIN ART PRICES");
    console.log("=".repeat(80));
    console.log("Updating prices to match user's list:\n");
    
    let updated = 0;
    
    for (const [sku, price] of Object.entries(correctPrices)) {
      const product = await Product.findOne({
        name: `Zepoxy Resin Art - ${sku} KG`,
        company_id: "RESSICHEM"
      });
      
      if (product) {
        if (Math.abs(product.price - price) > 0.01) {
          await Product.findByIdAndUpdate(product._id, { $set: { price: price } });
          console.log(`✅ Updated SKU ${sku}: ${product.price} → ${price} PKR`);
          updated++;
        } else {
          console.log(`✅ SKU ${sku}: Already correct (${price} PKR)`);
        }
      } else {
        console.log(`⚠️  SKU ${sku}: Product not found`);
      }
    }
    
    console.log("\n" + "=".repeat(80));
    console.log("📊 SUMMARY");
    console.log("=".repeat(80));
    console.log(`✅ Updated: ${updated} products`);
    console.log("\n📋 Final Prices:");
    Object.entries(correctPrices).forEach(([sku, price]) => {
      console.log(`   SKU ${sku}: ${price} PKR`);
    });
    
    await disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    await disconnect();
    process.exit(1);
  }
}

fixPrices();


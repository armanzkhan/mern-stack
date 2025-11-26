// backend/scripts/updateZepoxyResinArtPrices.js
// Updates Zepoxy Resin Art prices to match user's list
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

// UPDATE THESE PRICES WITH THE CORRECT VALUES FROM USER'S LIST
const correctPrices = {
  "0.75": 0,  // UPDATE: What is the price for SKU 0.75?
  "1.5": 0,   // UPDATE: What is the price for SKU 1.5?
  "15": 0,    // UPDATE: What is the price for SKU 15?
  "45": 0     // UPDATE: What is the price for SKU 45?
};

async function updatePrices() {
  try {
    await connect();
    console.log("🔧 UPDATING ZEPOXY RESIN ART PRICES");
    console.log("=".repeat(80));
    
    let updated = 0;
    
    for (const [sku, price] of Object.entries(correctPrices)) {
      if (price === 0) {
        console.log(`⚠️  SKU ${sku}: Price not set (still 0)`);
        continue;
      }
      
      const product = await Product.findOne({
        name: { $regex: new RegExp(`Zepoxy Resin Art.*${sku.replace('.', '\\.')}`, 'i') },
        company_id: "RESSICHEM",
        isActive: true
      });
      
      if (product) {
        if (product.price !== price) {
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
    console.log("\n💡 To update prices, edit this script and set the correctPrices object");
    console.log("   Then run: node scripts/updateZepoxyResinArtPrices.js");
    
    await disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    await disconnect();
    process.exit(1);
  }
}

updatePrices();


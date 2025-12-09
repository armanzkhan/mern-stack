// backend/scripts/fixRemainingMismatches.js
// Fixes the remaining 5% of mismatches
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

// Products that need price fixes based on verification
const productsToFix = [
  // Market Grade and Machine Grade products - need to check correct prices
  // Based on user's list: (Market Grade) KG 50 943, (Machine Grade) KG 50 1,553
  { name: "Ressi PlastoRend 100 (Market Grade) - 50 KG", price: 943 },
  { name: "Ressi PlastoRend 100 (Machine Grade) - 50 KG", price: 1553 },
  { name: "Ressi PlastoRend 110 (Market Grade) - 50 KG", price: 943 },
  { name: "Ressi PlastoRend 110 (Machine Grade) - 50 KG", price: 1553 },
  
  // Note: Zepoxy products with price 0 in import script but actual prices in database
  // These are likely correct in database (prices were added), but we'll verify
  // If user wants them at 0, we can set them to 0, otherwise keep database prices
];

async function fixRemainingMismatches() {
  try {
    await connect();
    console.log("🔧 FIXING REMAINING 5% MISMATCHES");
    console.log("=".repeat(80));
    
    let fixed = 0;
    let notFound = 0;
    let skipped = 0;
    
    // Fix Market/Machine Grade prices
    for (const fix of productsToFix) {
      const product = await Product.findOne({
        name: fix.name,
        company_id: "RESSICHEM"
      });
      
      if (!product) {
        console.log(`⚠️  Not found: ${fix.name}`);
        notFound++;
        continue;
      }
      
      if (product.price !== fix.price) {
        await Product.findByIdAndUpdate(product._id, { $set: { price: fix.price } });
        console.log(`✅ Fixed: ${fix.name}`);
        console.log(`   Price: ${product.price} → ${fix.price}`);
        fixed++;
      } else {
        skipped++;
      }
    }
    
    // Check for Zepoxy products with price 0 in import script
    // These might need to be set to 0, but let's check what's in database first
    const zepoxyProducts = await Product.find({
      name: { $regex: /^Zepoxy/ },
      company_id: "RESSICHEM",
      price: { $gt: 0 }
    }).limit(20);
    
    console.log(`\n📋 Zepoxy products with prices (sample):`);
    zepoxyProducts.forEach(p => {
      console.log(`   ${p.name}: ${p.price} PKR`);
    });
    
    console.log("\n" + "=".repeat(80));
    console.log("📊 FIX SUMMARY");
    console.log("=".repeat(80));
    console.log(`✅ Fixed: ${fixed} products`);
    console.log(`⏭️  Already correct: ${skipped} products`);
    console.log(`⚠️  Not found: ${notFound} products`);
    
    await disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error fixing mismatches:", error);
    await disconnect();
    process.exit(1);
  }
}

fixRemainingMismatches();


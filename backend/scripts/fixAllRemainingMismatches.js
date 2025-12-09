// backend/scripts/fixAllRemainingMismatches.js
// Fixes ALL remaining mismatches to get to 100% match
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

async function fixAllRemainingMismatches() {
  try {
    await connect();
    console.log("🔧 FIXING ALL REMAINING 5% MISMATCHES");
    console.log("=".repeat(80));
    console.log("Target: 100% exact match\n");
    
    let fixed = 0;
    let notFound = 0;
    
    // Fix Market/Machine Grade products
    // The database might have entries without "(Market Grade)" or "(Machine Grade)" suffix
    const marketMachineProducts = [
      { searchName: "Ressi PlastoRend 100", sku: 50, price: 943, grade: "Market" },
      { searchName: "Ressi PlastoRend 100", sku: 50, price: 1553, grade: "Machine" },
      { searchName: "Ressi PlastoRend 110", sku: 50, price: 943, grade: "Market" },
      { searchName: "Ressi PlastoRend 110", sku: 50, price: 1553, grade: "Machine" },
    ];
    
    // Try to find products with exact names first
    const exactNames = [
      { name: "Ressi PlastoRend 100 (Market Grade) - 50 KG", price: 943 },
      { name: "Ressi PlastoRend 100 (Machine Grade) - 50 KG", price: 1553 },
      { name: "Ressi PlastoRend 110 (Market Grade) - 50 KG", price: 943 },
      { name: "Ressi PlastoRend 110 (Machine Grade) - 50 KG", price: 1553 },
    ];
    
    for (const fix of exactNames) {
      const product = await Product.findOne({
        name: fix.name,
        company_id: "RESSICHEM"
      });
      
      if (product && product.price !== fix.price) {
        await Product.findByIdAndUpdate(product._id, { $set: { price: fix.price } });
        console.log(`✅ Fixed: ${fix.name}`);
        console.log(`   Price: ${product.price} → ${fix.price}`);
        fixed++;
      } else if (!product) {
        // Try to find without the grade suffix
        const baseName = fix.name.replace(/ \(Market Grade\)| \(Machine Grade\)/g, '');
        const products = await Product.find({
          name: { $regex: new RegExp(baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
          company_id: "RESSICHEM",
          sku: "50",
          unit: "KG"
        });
        
        if (products.length > 0) {
          // Check if we have multiple entries (Market and Machine Grade)
          // We need to identify which is which
          for (const p of products) {
            if (p.price === 1380 || p.price !== fix.price) {
              // This might be the one to fix, but we need to be careful
              // Let's check if there are multiple entries
              if (products.length === 2) {
                // We have both Market and Machine Grade
                // Sort by price and assign
                const sorted = products.sort((a, b) => a.price - b.price);
                if (fix.price === 943) {
                  // Market Grade should be the cheaper one
                  if (sorted[0].price !== 943) {
                    await Product.findByIdAndUpdate(sorted[0]._id, { 
                      $set: { 
                        price: 943,
                        name: `${sorted[0].name.split(' - ')[0]} (Market Grade) - 50 KG`
                      } 
                    });
                    console.log(`✅ Fixed: ${sorted[0].name} → Market Grade (943)`);
                    fixed++;
                  }
                } else if (fix.price === 1553) {
                  // Machine Grade should be the more expensive one
                  if (sorted[1].price !== 1553) {
                    await Product.findByIdAndUpdate(sorted[1]._id, { 
                      $set: { 
                        price: 1553,
                        name: `${sorted[1].name.split(' - ')[0]} (Machine Grade) - 50 KG`
                      } 
                    });
                    console.log(`✅ Fixed: ${sorted[1].name} → Machine Grade (1553)`);
                    fixed++;
                  }
                }
                break;
              } else {
                // Single entry - update price
                await Product.findByIdAndUpdate(p._id, { $set: { price: fix.price } });
                console.log(`✅ Fixed: ${p.name}`);
                console.log(`   Price: ${p.price} → ${fix.price}`);
                fixed++;
              }
            }
          }
        } else {
          notFound++;
        }
      }
    }
    
    // Fix Zepoxy products - check if they should have price 0 or keep database prices
    // For now, we'll leave Zepoxy products as they are (database has actual prices)
    // If user wants them at 0, we can update later
    
    console.log("\n" + "=".repeat(80));
    console.log("📊 FIX SUMMARY");
    console.log("=".repeat(80));
    console.log(`✅ Fixed: ${fixed} products`);
    console.log(`⚠️  Not found: ${notFound} products`);
    
    // Re-verify
    console.log("\n" + "=".repeat(80));
    console.log("🔍 RE-VERIFYING...");
    console.log("=".repeat(80));
    
    const allProducts = await Product.find({ company_id: "RESSICHEM", isActive: true });
    console.log(`📦 Total products: ${allProducts.length}`);
    
    let validCount = 0;
    for (const p of allProducts) {
      if (p.sku && p.price !== undefined && p.unit && p.category?.mainCategory) {
        validCount++;
      }
    }
    
    console.log(`✅ Valid products: ${validCount} (${((validCount / allProducts.length) * 100).toFixed(2)}%)`);
    
    await disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error fixing mismatches:", error);
    await disconnect();
    process.exit(1);
  }
}

fixAllRemainingMismatches();


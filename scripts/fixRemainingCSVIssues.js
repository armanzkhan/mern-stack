// backend/scripts/fixRemainingCSVIssues.js
// Fixes remaining issues found in CSV verification
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

async function fixRemainingIssues() {
  try {
    await connect();
    console.log("🔧 FIXING REMAINING CSV ISSUES");
    console.log("=".repeat(80));
    
    let updated = 0;
    let created = 0;
    
    // 1. Fix category/price mismatches
    console.log("📋 Fixing category/price mismatches...\n");
    const fixes = [
      { name: "Ressi Lime O Might 8000 - 50 KG", category: "Dry Mix Mortars / Premix Plasters" },
      { name: "Ressi Gyps O Might 9000 - 50 KG", price: 0, category: "Dry Mix Mortars / Premix Plasters" },
    ];
    
    for (const fix of fixes) {
      const product = await Product.findOne({
        name: fix.name,
        company_id: "RESSICHEM"
      });
      
      if (product) {
        const updates = {};
        if (fix.price !== undefined && product.price !== fix.price) {
          updates.price = fix.price;
        }
        if (fix.category && product.category?.mainCategory !== fix.category) {
          updates["category.mainCategory"] = fix.category;
        }
        
        if (Object.keys(updates).length > 0) {
          await Product.findByIdAndUpdate(product._id, { $set: updates });
          console.log(`✅ Fixed: ${fix.name}`);
          if (updates.price !== undefined) console.log(`   Price: ${product.price} → ${fix.price}`);
          if (updates["category.mainCategory"]) console.log(`   Category: ${product.category?.mainCategory} → ${fix.category}`);
          updated++;
        }
      }
    }
    
    // 2. Create missing products
    console.log("\n📋 Creating missing products...\n");
    const missingProducts = [
      { name: "Ressi SC 310 -9640 - 50 KG", sku: "50", unit: "KG", price: 5750, category: "Dry Mix Mortars / Premix Plasters" },
      { name: "Ressi SLS 610 - 50 KG", sku: "50", unit: "KG", price: 10206, category: "Dry Mix Mortars / Premix Plasters" },
      { name: "Ressi SLS 610 - 5 KG", sku: "5", unit: "KG", price: 2444, category: "Dry Mix Mortars / Premix Plasters" },
      { name: "Ressi SLS 610 - 10 KG", sku: "10", unit: "KG", price: 4830, category: "Dry Mix Mortars / Premix Plasters" },
      { name: "Ressi SLS Primer - 15 KG", sku: "15", unit: "KG", price: 7159, category: "Dry Mix Mortars / Premix Plasters" },
      { name: "Ressi SLS Primer - 200 KG", sku: "200", unit: "KG", price: 93150, category: "Dry Mix Mortars / Premix Plasters" },
      { name: "Ressi BLM 510 - 50 KG", sku: "50", unit: "KG", price: 1380, category: "Dry Mix Mortars / Premix Plasters" },
    ];
    
    for (const productData of missingProducts) {
      const existing = await Product.findOne({
        name: productData.name,
        company_id: "RESSICHEM"
      });
      
      if (!existing) {
        const newProduct = new Product({
          name: productData.name,
          sku: productData.sku,
          unit: productData.unit,
          price: productData.price,
          category: { mainCategory: productData.category },
          company_id: "RESSICHEM",
          isActive: true,
          stock: 0
        });
        await newProduct.save();
        console.log(`✅ Created: ${productData.name} (${productData.price} PKR)`);
        created++;
      }
    }
    
    console.log("\n" + "=".repeat(80));
    console.log("📊 FIX SUMMARY");
    console.log("=".repeat(80));
    console.log(`🔄 Updated: ${updated} products`);
    console.log(`➕ Created: ${created} products`);
    
    await disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    await disconnect();
    process.exit(1);
  }
}

fixRemainingIssues();


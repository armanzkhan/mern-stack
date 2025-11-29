// backend/scripts/fixCSVMismatches.js
// Fixes mismatches found in CSV verification
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

async function fixCSVMismatches() {
  try {
    await connect();
    console.log("🔧 FIXING CSV MISMATCHES");
    console.log("=".repeat(80));
    
    let created = 0;
    let updated = 0;
    
    // 1. Create missing RDR products (SKU 1 and 12)
    console.log("📋 Creating missing RDR products...\n");
    const rdrProducts = [
      { name: "RDR 0001 (White)", sku: 1, price: 299 },
      { name: "RDR 0001 (White)", sku: 12, price: 2990 },
      { name: "RDR 9000 W (Dark Fair Face Concrete)", sku: 1, price: 299 },
      { name: "RDR 9000 W (Dark Fair Face Concrete)", sku: 12, price: 2990 },
      { name: "RDR 7000 W (Fair Face Concrete)", sku: 1, price: 299 },
      { name: "RDR 7000 W (Fair Face Concrete)", sku: 12, price: 2990 },
      { name: "RDR 9111 (Ash White)", sku: 1, price: 299 },
      { name: "RDR 9111 (Ash White)", sku: 12, price: 2990 },
      { name: "RDR 8500 (Dessert Sand 3)", sku: 1, price: 299 },
      { name: "RDR 8500 (Dessert Sand 3)", sku: 12, price: 2990 },
      { name: "RDR 1200 (Dessert Sand 1)", sku: 1, price: 299 },
      { name: "RDR 1200 (Dessert Sand 1)", sku: 12, price: 2875 },
    ];
    
    for (const rdr of rdrProducts) {
      const productName = `${rdr.name} - ${rdr.sku} KG`;
      const existing = await Product.findOne({
        name: productName,
        company_id: "RESSICHEM"
      });
      
      if (!existing) {
        const newProduct = new Product({
          name: productName,
          sku: String(rdr.sku),
          unit: "KG",
          price: rdr.price,
          category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "DecoRend" },
          company_id: "RESSICHEM",
          isActive: true,
          stock: 0
        });
        await newProduct.save();
        console.log(`✅ Created: ${productName} (${rdr.price} PKR)`);
        created++;
      }
    }
    
    // 2. Fix price/category mismatches
    console.log("\n📋 Fixing price/category mismatches...\n");
    const fixes = [
      { name: "Ressi Lime O Might 8000 - 50 KG", price: 0, category: "Building Care and Maintenance" },
      { name: "Ressi SLS 610 - 20 KG", price: 4140, category: "Dry Mix Mortars / Premix Plasters" },
      { name: "Ressi SLS 610 - 1 KG", price: 598, category: "Dry Mix Mortars / Premix Plasters" },
      { name: "Ressi SLS Primer - 25 KG", price: 11788, category: "Dry Mix Mortars / Premix Plasters" },
    ];
    
    for (const fix of fixes) {
      const product = await Product.findOne({
        name: fix.name,
        company_id: "RESSICHEM"
      });
      
      if (product) {
        const updates = {};
        if (product.price !== fix.price) {
          updates.price = fix.price;
        }
        if (product.category?.mainCategory !== fix.category) {
          updates["category.mainCategory"] = fix.category;
        }
        
        if (Object.keys(updates).length > 0) {
          await Product.findByIdAndUpdate(product._id, { $set: updates });
          console.log(`✅ Fixed: ${fix.name}`);
          if (updates.price) console.log(`   Price: ${product.price} → ${fix.price}`);
          if (updates["category.mainCategory"]) console.log(`   Category: ${product.category?.mainCategory} → ${fix.category}`);
          updated++;
        }
      }
    }
    
    console.log("\n" + "=".repeat(80));
    console.log("📊 FIX SUMMARY");
    console.log("=".repeat(80));
    console.log(`➕ Created: ${created} products`);
    console.log(`🔄 Updated: ${updated} products`);
    
    console.log("\n💡 NOTE:");
    console.log("   This fixed the first batch of issues.");
    console.log("   To verify ALL products from CSV, I need to:");
    console.log("   1. Parse the entire CSV systematically");
    console.log("   2. Extract all products (hundreds)");
    console.log("   3. Verify each one");
    console.log("   4. Fix all mismatches");
    
    await disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    await disconnect();
    process.exit(1);
  }
}

fixCSVMismatches();


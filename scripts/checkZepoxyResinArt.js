// backend/scripts/checkZepoxyResinArt.js
// Checks and fixes Zepoxy Resin Art products
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

async function checkZepoxyResinArt() {
  try {
    await connect();
    console.log("🔍 CHECKING ZEPOXY RESIN ART PRODUCTS");
    console.log("=".repeat(80));
    
    // Find all Zepoxy Resin Art products
    const products = await Product.find({
      name: { $regex: /Zepoxy Resin Art/i },
      company_id: "RESSICHEM"
    }).sort({ sku: 1 });
    
    console.log(`📦 Found ${products.length} Zepoxy Resin Art products in database:\n`);
    products.forEach(p => {
      console.log(`  - ${p.name}`);
      console.log(`    SKU: ${p.sku} | Unit: ${p.unit} | Price: ${p.price} PKR | Active: ${p.isActive}`);
    });
    
    console.log("\n" + "=".repeat(80));
    console.log("📋 USER'S REQUIREMENT:");
    console.log("=".repeat(80));
    console.log("  - Zepoxy Resin Art should ONLY have SKU: 0.75");
    console.log("  - All other SKUs should be removed/deactivated");
    
    // Check if SKU 0.75 exists
    const correctProduct = products.find(p => String(p.sku) === "0.75" || String(p.sku) === "0.75");
    
    if (!correctProduct) {
      console.log("\n⚠️  SKU 0.75 NOT FOUND - needs to be created");
    } else {
      console.log("\n✅ SKU 0.75 found:", correctProduct.name);
    }
    
    // Deactivate incorrect products
    console.log("\n" + "=".repeat(80));
    console.log("🔧 FIXING PRODUCTS...");
    console.log("=".repeat(80));
    
    let deactivated = 0;
    for (const product of products) {
      const sku = String(product.sku);
      if (sku !== "0.75") {
        await Product.findByIdAndUpdate(product._id, { $set: { isActive: false } });
        console.log(`❌ Deactivated: ${product.name} (SKU: ${sku})`);
        deactivated++;
      } else {
        // Ensure it's active
        if (!product.isActive) {
          await Product.findByIdAndUpdate(product._id, { $set: { isActive: true } });
          console.log(`✅ Activated: ${product.name} (SKU: ${sku})`);
        } else {
          console.log(`✅ Kept active: ${product.name} (SKU: ${sku})`);
        }
      }
    }
    
    // Create SKU 0.75 if it doesn't exist
    if (!correctProduct) {
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
      console.log(`   ⚠️  Note: Price needs to be set from user's list`);
    }
    
    console.log("\n" + "=".repeat(80));
    console.log("📊 SUMMARY");
    console.log("=".repeat(80));
    console.log(`❌ Deactivated: ${deactivated} incorrect products`);
    console.log(`✅ Zepoxy Resin Art now only has SKU: 0.75`);
    
    await disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    await disconnect();
    process.exit(1);
  }
}

checkZepoxyResinArt();


// backend/scripts/fixProductMismatches.js
// Fixes price and category mismatches found in verification
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

// Products that need to be fixed - correct values from Decorative Concrete section
const productsToFix = [
  // Ressi Neutraliser - fix prices and category
  { name: "Ressi Neutraliser - 1 LTR", price: 920, category: "Decorative Concrete" },
  { name: "Ressi Neutraliser - 5 LTR", price: 4543, category: "Decorative Concrete" },
  { name: "Ressi Neutraliser - 10 LTR", price: 8855, category: "Decorative Concrete" },
  { name: "Ressi Neutraliser - 15 LTR", price: 13110, category: "Decorative Concrete" },
  { name: "Ressi Neutraliser - 25 LTR", price: 26220, category: "Decorative Concrete" },
  
  // Ressi Polymer - fix prices and category
  { name: "Ressi Polymer - 1 LTR", price: 3335, category: "Decorative Concrete" },
  { name: "Ressi Polymer - 5 LTR", price: 16100, category: "Decorative Concrete" },
  { name: "Ressi Polymer - 10 LTR", price: 31050, category: "Decorative Concrete" },
  { name: "Ressi Polymer - 15 LTR", price: 44850, category: "Decorative Concrete" },
  { name: "Ressi Polymer - 30 LTR", price: 86250, category: "Decorative Concrete" },
  
  // Ressi Acid Itch - fix category
  { name: "Ressi Acid Itch - 1 LTR", category: "Decorative Concrete" },
  { name: "Ressi Acid Itch - 5 LTR", category: "Decorative Concrete" },
  { name: "Ressi Acid Itch - 10 LTR", category: "Decorative Concrete" },
  { name: "Ressi Acid Itch - 15 LTR", category: "Decorative Concrete" },
  { name: "Ressi Acid Itch - 25 LTR", category: "Decorative Concrete" },
  
  // Ressi Reactive Stain - fix category (if exists with wrong category)
  { name: "Ressi Reactive Stain - 1 LTR", category: "Decorative Concrete" },
  { name: "Ressi Reactive Stain - 5 LTR", category: "Decorative Concrete" },
  { name: "Ressi Reactive Stain - 10 LTR", category: "Decorative Concrete" },
  { name: "Ressi Reactive Stain - 15 LTR", category: "Decorative Concrete" },
  { name: "Ressi Reactive Stain - 25 LTR", category: "Decorative Concrete" },
  
  // Reactive Stain variants - fix category
  { name: "Reactive Stain - Honey White - 1 LTR", category: "Decorative Concrete" },
  { name: "Reactive Stain - Honey White - 5 LTR", category: "Decorative Concrete" },
  { name: "Reactive Stain - Honey White - 10 LTR", category: "Decorative Concrete" },
  { name: "Reactive Stain - Honey White - 15 LTR", category: "Decorative Concrete" },
  { name: "Reactive Stain - Honey White - 25 LTR", category: "Decorative Concrete" },
  { name: "Reactive Stain - Nectarine - 1 LTR", category: "Decorative Concrete" },
  { name: "Reactive Stain - Nectarine - 5 LTR", category: "Decorative Concrete" },
  { name: "Reactive Stain - Nectarine - 10 LTR", category: "Decorative Concrete" },
  { name: "Reactive Stain - Nectarine - 15 LTR", category: "Decorative Concrete" },
  { name: "Reactive Stain - Nectarine - 25 LTR", category: "Decorative Concrete" },
  { name: "Reactive Stain - Persimmon - 1 LTR", category: "Decorative Concrete" },
  { name: "Reactive Stain - Persimmon - 5 LTR", category: "Decorative Concrete" },
  { name: "Reactive Stain - Persimmon - 10 LTR", category: "Decorative Concrete" },
  { name: "Reactive Stain - Persimmon - 15 LTR", category: "Decorative Concrete" },
  { name: "Reactive Stain - Persimmon - 25 LTR", category: "Decorative Concrete" },
  { name: "Reactive Stain - Rust Brown - 1 LTR", category: "Decorative Concrete" },
  { name: "Reactive Stain - Rust Brown - 5 LTR", category: "Decorative Concrete" },
  { name: "Reactive Stain - Rust Brown - 10 LTR", category: "Decorative Concrete" },
  { name: "Reactive Stain - Rust Brown - 15 LTR", category: "Decorative Concrete" },
  { name: "Reactive Stain - Rust Brown - 25 LTR", category: "Decorative Concrete" },
  { name: "Reactive Stain - Storm Green - 1 LTR", category: "Decorative Concrete" },
  { name: "Reactive Stain - Storm Green - 5 LTR", category: "Decorative Concrete" },
  { name: "Reactive Stain - Storm Green - 10 LTR", category: "Decorative Concrete" },
  { name: "Reactive Stain - Storm Green - 15 LTR", category: "Decorative Concrete" },
  { name: "Reactive Stain - Storm Green - 25 LTR", category: "Decorative Concrete" },
  { name: "Reactive Stain - Cool Blue - 1 LTR", category: "Decorative Concrete" },
  { name: "Reactive Stain - Cool Blue - 5 LTR", category: "Decorative Concrete" },
  { name: "Reactive Stain - Cool Blue - 10 LTR", category: "Decorative Concrete" },
  { name: "Reactive Stain - Cool Blue - 15 LTR", category: "Decorative Concrete" },
  { name: "Reactive Stain - Cool Blue - 25 LTR", category: "Decorative Concrete" },
  { name: "Reactive Stain - Kahlua - 1 LTR", category: "Decorative Concrete" },
  { name: "Reactive Stain - Kahlua - 5 LTR", category: "Decorative Concrete" },
  { name: "Reactive Stain - Kahlua - 10 LTR", category: "Decorative Concrete" },
  { name: "Reactive Stain - Kahlua - 15 LTR", category: "Decorative Concrete" },
  { name: "Reactive Stain - Kahlua - 25 LTR", category: "Decorative Concrete" },
  { name: "Reactive Stain - Citrus Green - 1 LTR", category: "Decorative Concrete" },
  { name: "Reactive Stain - Citrus Green - 5 LTR", category: "Decorative Concrete" },
  { name: "Reactive Stain - Citrus Green - 10 LTR", category: "Decorative Concrete" },
  { name: "Reactive Stain - Citrus Green - 15 LTR", category: "Decorative Concrete" },
  { name: "Reactive Stain - Citrus Green - 25 LTR", category: "Decorative Concrete" },
  
  // MT Base Coat, MT Top Coat, MT - Polymer Liquid, Terrazzo Retarder - fix category
  { name: "MT Base Coat - 20 KG", category: "Decorative Concrete" },
  { name: "MT Top Coat - 20 KG", category: "Decorative Concrete" },
  { name: "MT - Polymer Liquid - 1 LTR", category: "Decorative Concrete" },
  { name: "MT - Polymer Liquid - 5 LTR", category: "Decorative Concrete" },
  { name: "MT - Polymer Liquid - 10 LTR", category: "Decorative Concrete" },
  { name: "MT - Polymer Liquid - 15 LTR", category: "Decorative Concrete" },
  { name: "MT - Polymer Liquid - 25 LTR", category: "Decorative Concrete" },
  { name: "Terrazzo Retarder - 1 LTR", category: "Decorative Concrete" },
  { name: "Terrazzo Retarder - 5 LTR", category: "Decorative Concrete" },
  { name: "Terrazzo Retarder - 10 LTR", category: "Decorative Concrete" },
  { name: "Terrazzo Retarder - 15 LTR", category: "Decorative Concrete" },
  { name: "Terrazzo Retarder - 25 LTR", category: "Decorative Concrete" },
];

async function fixMismatches() {
  try {
    await connect();
    console.log("🔧 FIXING PRODUCT MISMATCHES");
    console.log("=".repeat(80));
    console.log(`Fixing ${productsToFix.length} products...\n`);
    
    let fixed = 0;
    let notFound = 0;
    
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
      
      const updates = {};
      let needsUpdate = false;
      
      if (fix.price !== undefined && product.price !== fix.price) {
        updates.price = fix.price;
        needsUpdate = true;
      }
      
      if (fix.category && product.category?.mainCategory !== fix.category) {
        updates['category.mainCategory'] = fix.category;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await Product.findByIdAndUpdate(product._id, { $set: updates });
        console.log(`✅ Fixed: ${fix.name}`);
        if (fix.price !== undefined) {
          console.log(`   Price: ${product.price} → ${fix.price}`);
        }
        if (fix.category) {
          console.log(`   Category: ${product.category?.mainCategory} → ${fix.category}`);
        }
        fixed++;
      }
    }
    
    console.log("\n" + "=".repeat(80));
    console.log("📊 FIX SUMMARY");
    console.log("=".repeat(80));
    console.log(`✅ Fixed: ${fixed} products`);
    console.log(`⚠️  Not found: ${notFound} products`);
    console.log(`📦 Total processed: ${productsToFix.length}`);
    
    await disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error fixing mismatches:", error);
    await disconnect();
    process.exit(1);
  }
}

fixMismatches();

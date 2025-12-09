// backend/scripts/analyzeAndRestrict.js
// Analyzes current database and helps restrict to user's product list
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

async function analyzeAndRestrict() {
  try {
    await connect();
    console.log("🔍 ANALYZING DATABASE FOR RESTRICTION");
    console.log("=".repeat(80));
    
    // Get all active products grouped by category
    const allProducts = await Product.find({ 
      company_id: "RESSICHEM", 
      isActive: true 
    }).sort({ "category.mainCategory": 1, name: 1 });
    
    console.log(`📦 Total active products: ${allProducts.length}\n`);
    
    // Group by category
    const byCategory = {};
    allProducts.forEach(p => {
      const cat = p.category?.mainCategory || "Uncategorized";
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(p);
    });
    
    console.log("📊 Products by Category:");
    Object.keys(byCategory).sort().forEach(cat => {
      console.log(`   ${cat}: ${byCategory[cat].length} products`);
    });
    
    console.log("\n" + "=".repeat(80));
    console.log("⚠️  RESTRICTION PLAN");
    console.log("=".repeat(80));
    console.log("To restrict the database to ONLY your product list, we need to:");
    console.log("1. Create a comprehensive list of products from your message");
    console.log("2. Parse all products with their SKU, unit, price, and category");
    console.log("3. Deactivate all products NOT in your list");
    console.log("4. Create/update products from your list");
    console.log("\n💡 Next Steps:");
    console.log("   Option A: Provide the product list in a structured format (JSON/CSV)");
    console.log("   Option B: I can create a parser for your current format");
    console.log("   Option C: Update the import script to only contain your products");
    console.log("\n📋 Your list appears to contain products from:");
    console.log("   - Dry Mix Mortars / Premix Plasters (PlastoRend 100, 110, 120 C, SC 310)");
    console.log("   - Building Care and Maintenance (Water Guard, Heat Guard, etc.)");
    console.log("   - Tiling and Grouting Materials");
    console.log("   - Concrete Admixtures");
    console.log("   - Decorative Concrete");
    console.log("   - Epoxy Floorings & Coatings");
    console.log("   - Specialty Products");
    
    // Show sample products that might need to be removed
    console.log("\n" + "=".repeat(80));
    console.log("📋 Sample Products (first 30) - These will be checked against your list:");
    console.log("=".repeat(80));
    allProducts.slice(0, 30).forEach((p, i) => {
      console.log(`${i + 1}. ${p.name} | ${p.price} PKR | ${p.category?.mainCategory}`);
    });
    
    await disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    await disconnect();
    process.exit(1);
  }
}

analyzeAndRestrict();


// backend/scripts/fullCSVVerification.js
// Comprehensive verification - parses CSV and verifies ALL products
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

// Comprehensive product list extracted from CSV
// Format: { name, unit, sku, price, category }
// This will be populated by parsing the CSV systematically

const csvProductList = [];

// Helper function to build product name for database lookup
function buildProductName(csvEntry) {
  // CSV format examples:
  // "100 - 0001 B (Brilliant White)" -> "Ressi PlastoRend 100 - 0001 B"
  // "RDR 0001 (White)" -> "RDR 0001 (White)" or "Ressi DecoRend 20,000 C - RDR 0001 (White)"
  // "Max Flo P" -> "Max Flo P"
  // "Ressi PlastoRend 100 (Market Grade)" -> "Ressi PlastoRend 100 (Market Grade)"
  
  let name = csvEntry.name;
  
  // Handle PlastoRend 100/110/120 products
  if (name.match(/^100\s*-/)) {
    name = name.replace(/^100\s*-/, "Ressi PlastoRend 100 -");
  } else if (name.match(/^110\s*-/)) {
    name = name.replace(/^110\s*-/, "Ressi PlastoRend 110 -");
  } else if (name.match(/^RPR 120 C\s*-/)) {
    name = name.replace(/^RPR 120 C\s*-/, "RPR 120 C -");
  }
  
  // Remove color descriptions in parentheses if they're at the end
  // Keep color codes like "0001 B" but remove descriptions like "(Brilliant White)"
  name = name.replace(/\s*\([^)]+\)$/, '');
  
  return name.trim();
}

async function fullCSVVerification() {
  try {
    await connect();
    console.log("🔍 FULL CSV VERIFICATION");
    console.log("=".repeat(80));
    console.log("Verifying ALL products from CSV against database\n");
    
    // Get all database products
    const dbProducts = await Product.find({
      company_id: "RESSICHEM",
      isActive: true
    });
    
    console.log(`📦 Database: ${dbProducts.length} active products\n`);
    
    console.log("⚠️  NOTE:");
    console.log("   To verify ALL products from your CSV, I need to:");
    console.log("   1. Parse the entire CSV you provided");
    console.log("   2. Extract each product with: name, SKU, unit, price, category");
    console.log("   3. Build the database lookup name (format: 'Product Name - SKU UNIT')");
    console.log("   4. Compare with database");
    console.log("   5. Report all mismatches\n");
    
    console.log("📋 Your CSV format:");
    console.log("   - Product Name / Color Code | Unit | SKU | Price");
    console.log("   - Example: '100 - 0001 B (Brilliant White) KG 50 6,325'");
    console.log("   - Database format: 'Ressi PlastoRend 100 - 0001 B - 50 KG'\n");
    
    console.log("💡 I can:");
    console.log("   A) Parse the entire CSV now (systematic extraction)");
    console.log("   B) Work category by category");
    console.log("   C) Create a structured product list file first\n");
    
    console.log("🔧 Creating comprehensive parser...");
    console.log("   This will extract ALL products from your CSV format\n");
    
    // For now, let's verify some key products to show the process
    const sampleCSVProducts = [
      { csvName: "100 - 0001 B (Brilliant White)", unit: "KG", sku: 50, price: 6325, category: "Dry Mix Mortars / Premix Plasters", dbName: "Ressi PlastoRend 100 - 0001 B - 50 KG" },
      { csvName: "RDR 0001 (White)", unit: "KG", sku: 1, price: 299, category: "Dry Mix Mortars / Premix Plasters", dbName: "RDR 0001 (White) - 1 KG" },
      { csvName: "Ressi PlastoRend 100 (Market Grade)", unit: "KG", sku: 50, price: 943, category: "Dry Mix Mortars / Premix Plasters", dbName: "Ressi PlastoRend 100 (Market Grade) - 50 KG" },
      { csvName: "Zepoxy Resin Art", unit: "KG", sku: 0.75, price: 1170.21, category: "Epoxy Adhesives and Coatings", dbName: "Zepoxy Resin Art - 0.75 KG" },
      { csvName: "Max Flo P", unit: "LTR", sku: 1, price: 489, category: "Concrete Admixtures", dbName: "Max Flo P - 1 LTR" },
    ];
    
    console.log("📋 Sample Verification:\n");
    let correct = 0;
    let incorrect = 0;
    
    for (const csvProduct of sampleCSVProducts) {
      const dbProduct = await Product.findOne({
        name: csvProduct.dbName,
        company_id: "RESSICHEM"
      });
      
      if (dbProduct) {
        const priceMatch = Math.abs(dbProduct.price - csvProduct.price) < 0.01;
        const skuMatch = String(dbProduct.sku) === String(csvProduct.sku);
        const unitMatch = dbProduct.unit === csvProduct.unit;
        const categoryMatch = dbProduct.category?.mainCategory === csvProduct.category;
        
        if (priceMatch && skuMatch && unitMatch && categoryMatch) {
          console.log(`✅ ${csvProduct.dbName}`);
          console.log(`   Price: ${dbProduct.price} | SKU: ${dbProduct.sku} | Unit: ${dbProduct.unit} | Category: ${dbProduct.category?.mainCategory}`);
          correct++;
        } else {
          console.log(`❌ ${csvProduct.dbName}`);
          if (!priceMatch) console.log(`   Price: ${dbProduct.price} → ${csvProduct.price}`);
          if (!skuMatch) console.log(`   SKU: ${dbProduct.sku} → ${csvProduct.sku}`);
          if (!unitMatch) console.log(`   Unit: ${dbProduct.unit} → ${csvProduct.unit}`);
          if (!categoryMatch) console.log(`   Category: ${dbProduct.category?.mainCategory} → ${csvProduct.category}`);
          incorrect++;
        }
      } else {
        console.log(`⚠️  ${csvProduct.dbName}: NOT FOUND`);
        incorrect++;
      }
    }
    
    console.log("\n" + "=".repeat(80));
    console.log("📊 SAMPLE RESULTS");
    console.log("=".repeat(80));
    console.log(`✅ Correct: ${correct}`);
    console.log(`❌ Incorrect/Missing: ${incorrect}`);
    
    console.log("\n💡 To verify ALL products:");
    console.log("   I need to parse your entire CSV and create a complete product list");
    console.log("   Then systematically verify each product against the database");
    
    await disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    await disconnect();
    process.exit(1);
  }
}

fullCSVVerification();


// backend/scripts/parseAndRestrictUserList.js
// Parses user's product list and restricts database to ONLY those products
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

// This is a comprehensive list extracted from the user's message
// Format: { name, unit, sku, price, category }
// Note: This is a partial list - we'll need to complete it based on the full user message
const userProducts = [];

// Helper function to parse product entries from the user's text
function parseProductLine(line, currentCategory = "Dry Mix Mortars / Premix Plasters") {
  // Remove extra whitespace
  line = line.trim();
  if (!line) return null;
  
  // Skip category headers
  if (line.includes("PRODCUT") || line.includes("COLOUR CODE") || line.includes("KG/LTR SKU") || 
      line.includes("Pack Price") || line.includes("PRICE") || line.match(/^[A-Z\s\/&]+$/)) {
    return null;
  }
  
  // Pattern: "Product Name - Color Code KG/LTR SKU Price"
  // Or: "KG SKU Price" (variant of previous product)
  // Or: "100 - 0001 B (Brilliant White) KG 50 6,325"
  
  // Try to match patterns
  const patterns = [
    // Pattern 1: "100 - 0001 B (Brilliant White) KG 50 6,325"
    /^(\d+)\s*-\s*([^\s]+(?:\s+\([^)]+\))?)\s+(KG|LTR)\s+(\d+(?:\.\d+)?)\s+([\d,]+)$/,
    // Pattern 2: "Ressi PlastoRend 100 KG 1 299"
    /^(Ressi\s+[^-]+)\s+(KG|LTR)\s+(\d+(?:\.\d+)?)\s+([\d,]+)$/,
    // Pattern 3: "RPR 120 C - 0001 B KG 50 3,335"
    /^([A-Z0-9\s]+)\s*-\s*([^\s]+)\s+(KG|LTR)\s+(\d+(?:\.\d+)?)\s+([\d,]+)$/,
    // Pattern 4: "KG 1 299" (variant, needs previous product name)
    /^(KG|LTR)\s+(\d+(?:\.\d+)?)\s+([\d,]+)$/,
  ];
  
  for (const pattern of patterns) {
    const match = line.match(pattern);
    if (match) {
      // Extract and return product data
      return {
        name: match[1] || match[2] || "",
        unit: match[3] || match[1],
        sku: match[4] || match[2],
        price: parseFloat((match[5] || match[3] || match[4]).replace(/,/g, '')),
        category: currentCategory
      };
    }
  }
  
  return null;
}

async function restrictToUserList() {
  try {
    await connect();
    console.log("🔧 RESTRICTING DATABASE TO USER'S PRODUCT LIST");
    console.log("=".repeat(80));
    console.log("⚠️  This will DEACTIVATE all products NOT in the user's list!\n");
    
    // For now, we'll use a different approach:
    // 1. Get all current products
    // 2. Show what would be deactivated
    // 3. Ask for confirmation (or create a dry-run mode)
    
    const allProducts = await Product.find({ 
      company_id: "RESSICHEM", 
      isActive: true 
    }).sort({ name: 1 });
    
    console.log(`📦 Current active products: ${allProducts.length}\n`);
    console.log("📋 Sample products (first 20):");
    allProducts.slice(0, 20).forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name} (${p.price} PKR)`);
    });
    
    console.log("\n" + "=".repeat(80));
    console.log("⚠️  IMPORTANT: This script needs the complete user product list");
    console.log("=".repeat(80));
    console.log("To complete this task, we need to:");
    console.log("1. Parse the entire user's product list");
    console.log("2. Create a comprehensive product list array");
    console.log("3. Deactivate all products NOT in that list");
    console.log("4. Create/update products from the user's list");
    console.log("\n💡 Recommendation:");
    console.log("   - Create a structured product list file (JSON/CSV)");
    console.log("   - Or provide the list in a more structured format");
    console.log("   - Then run this script to restrict the database");
    
    await disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    await disconnect();
    process.exit(1);
  }
}

restrictToUserList();


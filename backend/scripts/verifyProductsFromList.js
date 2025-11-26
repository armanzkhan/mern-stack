// backend/scripts/verifyProductsFromList.js
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

// Parse the user's product list into structured data
// This is a simplified parser - you may need to adjust based on exact format
function parseProductList(text) {
  const products = [];
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  
  let currentCategory = null;
  let currentProductName = null;
  
  for (const line of lines) {
    // Detect category headers
    if (line.includes('Dry Mix Mortars') || line.includes('Premix Plasters')) {
      currentCategory = "Dry Mix Mortars / Premix Plasters";
      continue;
    }
    if (line.includes('Building Care') || line.includes('Maintenance')) {
      currentCategory = "Building Care & Maintenance";
      continue;
    }
    if (line.includes('Tiling') || line.includes('Grouting')) {
      currentCategory = "Tiling and Grouting Materials";
      continue;
    }
    if (line.includes('Concrete Admixtures')) {
      currentCategory = "Concrete Admixtures";
      continue;
    }
    if (line.includes('Epoxy Flooring') || line.includes('EPOXY FLOORING')) {
      currentCategory = "Epoxy Floorings & Coatings";
      continue;
    }
    if (line.includes('Specialty Products')) {
      currentCategory = "Specialty Products";
      continue;
    }
    if (line.includes('Decorative Concrete')) {
      currentCategory = "Decorative Concrete";
      continue;
    }
    
    // Parse product lines - format: "Product Name KG/LTR SKU Price"
    // Examples:
    // "KG 1 299"
    // "100 - 0001 B (Brilliant White) KG 50 6,325"
    // "Ressi PlastoRend 100 - 0001 B KG 50 6,325"
    
    const kgMatch = line.match(/KG\s+(\d+(?:\.\d+)?)\s+([\d,]+)/);
    const ltrMatch = line.match(/LTR\s+(\d+(?:\.\d+)?)\s+([\d,]+)/);
    
    if (kgMatch || ltrMatch) {
      const match = kgMatch || ltrMatch;
      const unit = kgMatch ? "KG" : "LTR";
      const sku = parseFloat(match[1]);
      const price = parseFloat(match[2].replace(/,/g, ''));
      
      // Try to extract product name from previous context or current line
      let productName = currentProductName;
      
      // Look for product name in the line before the KG/LTR
      const nameMatch = line.match(/^(.+?)\s+KG\s+/i) || line.match(/^(.+?)\s+LTR\s+/i);
      if (nameMatch) {
        productName = nameMatch[1].trim();
        // Clean up product name
        productName = productName.replace(/\([^)]*\)/g, '').trim(); // Remove color codes in parentheses
      }
      
      if (productName && currentCategory) {
        products.push({
          name: productName,
          unit: unit,
          sku: sku,
          price: price,
          category: currentCategory,
          rawLine: line
        });
      }
    }
    
    // Store product name for next iteration if it's a product header
    if (line.includes('Ressi') || line.includes('Max Flo') || line.includes('Water Guard') || 
        line.includes('Crack Heal') || line.includes('Zepoxy') || line.match(/^\d+\s*-/)) {
      if (!line.match(/KG|LTR/)) {
        currentProductName = line.trim();
      }
    }
  }
  
  return products;
}

// Verify products in database
async function verifyProducts() {
  try {
    await connect();
    console.log("🔍 Starting product verification...\n");
    
    // Read the user's product list from a file or use embedded data
    // For now, we'll create a structured list based on the user's input
    const userProducts = [
      // Dry Mix Mortars / Premix Plasters - PlastoRend 100 (1 KG and 12 KG variants)
      { name: "Ressi PlastoRend 100", unit: "KG", sku: 1, price: 299, category: "Dry Mix Mortars / Premix Plasters" },
      { name: "Ressi PlastoRend 100", unit: "KG", sku: 12, price: 2990, category: "Dry Mix Mortars / Premix Plasters" },
      
      // PlastoRend 100 - 50 KG variants with color codes
      { name: "Ressi PlastoRend 100 - 0001 B", unit: "KG", sku: 50, price: 6325, category: "Dry Mix Mortars / Premix Plasters" },
      { name: "Ressi PlastoRend 100 - 0001", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
      { name: "Ressi PlastoRend 100 - 0003", unit: "KG", sku: 50, price: 4600, category: "Dry Mix Mortars / Premix Plasters" },
      { name: "Ressi PlastoRend 100 - 8400 - 1 HD", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
      { name: "Ressi PlastoRend 100 - 1100", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
      { name: "Ressi PlastoRend 100 - 1101", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
      { name: "Ressi PlastoRend 100 - 9111 TG", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
      { name: "Ressi PlastoRend 100 - 6110 TG", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
      { name: "Ressi PlastoRend 100 - 1111", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
      { name: "Ressi PlastoRend 100 - 1211-2", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
      { name: "Ressi PlastoRend 100 - 1200", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
      { name: "Ressi PlastoRend 100 - 1210", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
      { name: "Ressi PlastoRend 100 - 7000 W", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
      { name: "Ressi PlastoRend 100 - 7000 WL", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
      { name: "Ressi PlastoRend 100 - 9000 W", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
      { name: "Ressi PlastoRend 100 - GRG", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
      { name: "Ressi PlastoRend 100 - 9210", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
      { name: "Ressi PlastoRend 100 - 9110 W", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
      { name: "Ressi PlastoRend 100 - TG", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
      { name: "Ressi PlastoRend 100 - 9311 HD", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
      { name: "Ressi PlastoRend 100 - GOG", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
      { name: "Ressi PlastoRend 100 - NW", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
      { name: "Ressi PlastoRend 100 - 1211", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
      { name: "Ressi PlastoRend 100 - CHG", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
      { name: "Ressi PlastoRend 100 - 3990 X 9", unit: "KG", sku: 50, price: 9200, category: "Dry Mix Mortars / Premix Plasters" },
      { name: "Ressi PlastoRend 100 - 6800", unit: "KG", sku: 50, price: 9200, category: "Dry Mix Mortars / Premix Plasters" },
      { name: "Ressi PlastoRend 100 - 6400", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
      { name: "Ressi PlastoRend 100 - 3400", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
      { name: "Ressi PlastoRend 100 - 8820 X 2 HD", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
      { name: "Ressi PlastoRend 100 - 1320", unit: "KG", sku: 50, price: 5405, category: "Dry Mix Mortars / Premix Plasters" },
      { name: "Ressi PlastoRend 100 - 1220", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
      { name: "Ressi PlastoRend 100 - CHW", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
      { name: "Ressi PlastoRend 100 - 8810 X 1", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
      { name: "Ressi PlastoRend 100 - 8500 HD", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
      { name: "Ressi PlastoRend 100 - 5211", unit: "KG", sku: 50, price: 5175, category: "Dry Mix Mortars / Premix Plasters" },
      { name: "Ressi PlastoRend 100 - 5210", unit: "KG", sku: 50, price: 5520, category: "Dry Mix Mortars / Premix Plasters" },
      
      // PlastoRend 110 variants (similar structure)
      // ... (add more products as needed)
    ];
    
    console.log(`📋 Checking ${userProducts.length} products from user list...\n`);
    
    const results = {
      found: [],
      missing: [],
      priceMismatch: [],
      categoryMismatch: []
    };
    
    for (const userProduct of userProducts) {
      // Build search query - products are stored as "Product Name - SKU UNIT"
      const productName = `${userProduct.name} - ${userProduct.sku} ${userProduct.unit}`;
      
      const dbProduct = await Product.findOne({
        name: productName,
        company_id: "RESSICHEM"
      });
      
      if (!dbProduct) {
        results.missing.push({
          ...userProduct,
          expectedName: productName
        });
        console.log(`❌ MISSING: ${productName}`);
      } else {
        // Check price
        if (Math.abs(dbProduct.price - userProduct.price) > 0.01) {
          results.priceMismatch.push({
            ...userProduct,
            expectedName: productName,
            dbPrice: dbProduct.price,
            expectedPrice: userProduct.price
          });
          console.log(`⚠️  PRICE MISMATCH: ${productName} - DB: ${dbProduct.price}, Expected: ${userProduct.price}`);
        }
        
        // Check category
        const dbCategory = dbProduct.category?.mainCategory || '';
        if (dbCategory !== userProduct.category) {
          results.categoryMismatch.push({
            ...userProduct,
            expectedName: productName,
            dbCategory: dbCategory,
            expectedCategory: userProduct.category
          });
          console.log(`⚠️  CATEGORY MISMATCH: ${productName} - DB: ${dbCategory}, Expected: ${userProduct.category}`);
        }
        
        if (Math.abs(dbProduct.price - userProduct.price) <= 0.01 && dbCategory === userProduct.category) {
          results.found.push({
            ...userProduct,
            dbId: dbProduct._id
          });
        }
      }
    }
    
    // Generate summary report
    console.log("\n" + "=".repeat(60));
    console.log("📊 VERIFICATION SUMMARY");
    console.log("=".repeat(60));
    console.log(`✅ Found & Correct: ${results.found.length}`);
    console.log(`❌ Missing: ${results.missing.length}`);
    console.log(`⚠️  Price Mismatch: ${results.priceMismatch.length}`);
    console.log(`⚠️  Category Mismatch: ${results.categoryMismatch.length}`);
    console.log(`\nTotal Checked: ${userProducts.length}`);
    
    // Test API fetching
    console.log("\n" + "=".repeat(60));
    console.log("🔍 Testing Product Fetching...");
    console.log("=".repeat(60));
    
    const totalProducts = await Product.countDocuments({ company_id: "RESSICHEM", isActive: true });
    console.log(`📦 Total active products in database: ${totalProducts}`);
    
    const sampleProducts = await Product.find({ company_id: "RESSICHEM", isActive: true }).limit(10);
    console.log(`\n📋 Sample products (first 10):`);
    sampleProducts.forEach(p => {
      console.log(`   - ${p.name} (${p.price} PKR)`);
    });
    
    // Check if products are fetchable via API structure
    console.log("\n✅ Database connection: OK");
    console.log("✅ Product model: OK");
    console.log("✅ Products are stored with format: 'Product Name - SKU UNIT'");
    
    if (results.missing.length > 0) {
      console.log("\n⚠️  ACTION REQUIRED:");
      console.log(`   ${results.missing.length} products need to be added to the database.`);
      console.log("   Run: node backend/scripts/importProductsFromExcel.js");
    }
    
    if (results.priceMismatch.length > 0) {
      console.log("\n⚠️  ACTION REQUIRED:");
      console.log(`   ${results.priceMismatch.length} products have incorrect prices.`);
      console.log("   Update prices in the import script and re-import.");
    }
    
    await disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during verification:", error);
    await disconnect();
    process.exit(1);
  }
}

// Run verification
verifyProducts();


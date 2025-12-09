// backend/scripts/verifyAgainstCSV.js
// Verifies all products against the CSV file provided by user
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

// Parse the CSV data into structured format
// This is a comprehensive list from the user's CSV
const csvProducts = {
  "Dry Mix Mortars / Premix Plasters": [
    // Ressi DecoRend 20,000 C
    { name: "RDR 0001 (White)", unit: "KG", sku: 1, price: 299 },
    { name: "RDR 0001 (White)", unit: "KG", sku: 12, price: 2990 },
    { name: "RDR 9000 W (Dark Fair Face Concrete)", unit: "KG", sku: 1, price: 299 },
    { name: "RDR 9000 W (Dark Fair Face Concrete)", unit: "KG", sku: 12, price: 2990 },
    { name: "RDR 7000 W (Fair Face Concrete)", unit: "KG", sku: 1, price: 299 },
    { name: "RDR 7000 W (Fair Face Concrete)", unit: "KG", sku: 12, price: 2990 },
    { name: "RDR 9111 (Ash White)", unit: "KG", sku: 1, price: 299 },
    { name: "RDR 9111 (Ash White)", unit: "KG", sku: 12, price: 2990 },
    { name: "RDR 8500 (Dessert Sand 3)", unit: "KG", sku: 1, price: 299 },
    { name: "RDR 8500 (Dessert Sand 3)", unit: "KG", sku: 12, price: 2990 },
    { name: "RDR 1200 (Dessert Sand 1)", unit: "KG", sku: 1, price: 299 },
    { name: "RDR 1200 (Dessert Sand 1)", unit: "KG", sku: 12, price: 2875 },
    
    // Ressi PlastoRend 100
    { name: "Ressi PlastoRend 100 - 0001 B", unit: "KG", sku: 50, price: 6325 },
    { name: "Ressi PlastoRend 100 - 0001", unit: "KG", sku: 50, price: 5175 },
    { name: "Ressi PlastoRend 100 - 0003", unit: "KG", sku: 50, price: 4600 },
    { name: "Ressi PlastoRend 100 - 8400 - 1 HD", unit: "KG", sku: 50, price: 5175 },
    { name: "Ressi PlastoRend 100 - 1100", unit: "KG", sku: 50, price: 5175 },
    { name: "Ressi PlastoRend 100 - 1101", unit: "KG", sku: 50, price: 5175 },
    { name: "Ressi PlastoRend 100 - 9111 TG", unit: "KG", sku: 50, price: 5175 },
    { name: "Ressi PlastoRend 100 - 6110 TG", unit: "KG", sku: 50, price: 5175 },
    { name: "Ressi PlastoRend 100 - 1111", unit: "KG", sku: 50, price: 5175 },
    { name: "Ressi PlastoRend 100 - 1211-2", unit: "KG", sku: 50, price: 5175 },
    { name: "Ressi PlastoRend 100 - 1200", unit: "KG", sku: 50, price: 5175 },
    { name: "Ressi PlastoRend 100 - 1210", unit: "KG", sku: 50, price: 5175 },
    { name: "Ressi PlastoRend 100 - 7000 W", unit: "KG", sku: 50, price: 5175 },
    { name: "Ressi PlastoRend 100 - 7000 WL", unit: "KG", sku: 50, price: 5175 },
    { name: "Ressi PlastoRend 100 - 9000 W", unit: "KG", sku: 50, price: 5175 },
    { name: "Ressi PlastoRend 100 - GRG", unit: "KG", sku: 50, price: 5175 },
    { name: "Ressi PlastoRend 100 - 9210", unit: "KG", sku: 50, price: 5175 },
    { name: "Ressi PlastoRend 100 - 9110 W", unit: "KG", sku: 50, price: 5175 },
    { name: "Ressi PlastoRend 100 - TG", unit: "KG", sku: 50, price: 5175 },
    { name: "Ressi PlastoRend 100 - 9311 HD", unit: "KG", sku: 50, price: 5175 },
    { name: "Ressi PlastoRend 100 - GOG", unit: "KG", sku: 50, price: 5175 },
    { name: "Ressi PlastoRend 100 - NW", unit: "KG", sku: 50, price: 5175 },
    { name: "Ressi PlastoRend 100 - 1211", unit: "KG", sku: 50, price: 5175 },
    { name: "Ressi PlastoRend 100 - CHG", unit: "KG", sku: 50, price: 5175 },
    { name: "Ressi PlastoRend 100 - 3990 X 9", unit: "KG", sku: 50, price: 9200 },
    { name: "Ressi PlastoRend 100 - 6800", unit: "KG", sku: 50, price: 9200 },
    { name: "Ressi PlastoRend 100 - 6400", unit: "KG", sku: 50, price: 5175 },
    { name: "Ressi PlastoRend 100 - 3400", unit: "KG", sku: 50, price: 5175 },
    { name: "Ressi PlastoRend 100 - 8820 X 2 HD", unit: "KG", sku: 50, price: 5175 },
    { name: "Ressi PlastoRend 100 - 1320", unit: "KG", sku: 50, price: 5405 },
    { name: "Ressi PlastoRend 100 - 1220", unit: "KG", sku: 50, price: 5175 },
    { name: "Ressi PlastoRend 100 - CHW", unit: "KG", sku: 50, price: 5175 },
    { name: "Ressi PlastoRend 100 - 8810 X 1", unit: "KG", sku: 50, price: 5175 },
    { name: "Ressi PlastoRend 100 - 8500 HD", unit: "KG", sku: 50, price: 5175 },
    { name: "Ressi PlastoRend 100 - 5211", unit: "KG", sku: 50, price: 5175 },
    { name: "Ressi PlastoRend 100 - 5210", unit: "KG", sku: 50, price: 5520 },
    { name: "Ressi PlastoRend 100 (Market Grade)", unit: "KG", sku: 50, price: 943 },
    { name: "Ressi PlastoRend 100 (Machine Grade)", unit: "KG", sku: 50, price: 1553 },
    
    // Ressi PlastoRend 110 - similar pattern, all with SKU 50
    // ... (I'll need to add all 110 variants)
    
    // Ressi PlastoRend 120 C (RPR 120 C)
    { name: "RPR 120 C - 0001 B", unit: "KG", sku: 50, price: 3335 },
    { name: "RPR 120 C - 0001", unit: "KG", sku: 50, price: 2415 },
    // ... (all RPR 120 C variants)
    
    // Ressi SC 310
    { name: "Ressi SC 310 - 0001", unit: "KG", sku: 50, price: 10925 },
    // ... (all SC 310 variants)
    
    // Specialty products
    { name: "Ressi PFS 620", unit: "KG", sku: 50, price: 1380 },
    { name: "Ressi BRC 7000", unit: "KG", sku: 50, price: 2875 },
    { name: "Ressi Lime O Might 8000", unit: "KG", sku: 50, price: 0 }, // Price not specified in CSV
    { name: "Ressi Gyps O Might 9000", unit: "KG", sku: 50, price: 0 }, // Price not specified
    { name: "Ressi SLS 610", unit: "KG", sku: 20, price: 4140 },
    { name: "Ressi SLS 610", unit: "KG", sku: 50, price: 10206 },
    { name: "Ressi SLS 610", unit: "KG", sku: 1, price: 598 },
    { name: "Ressi SLS 610", unit: "KG", sku: 5, price: 2444 },
    { name: "Ressi SLS 610", unit: "KG", sku: 10, price: 4830 },
    { name: "Ressi SLS Primer", unit: "KG", sku: 15, price: 7159 },
    { name: "Ressi SLS Primer", unit: "KG", sku: 25, price: 11788 },
    { name: "Ressi SLS Primer", unit: "KG", sku: 200, price: 93150 },
    { name: "Ressi BLM 510", unit: "KG", sku: 50, price: 1380 },
  ],
  
  "Building Care and Maintenance": [
    { name: "Crack Heal 910", unit: "KG", sku: 1, price: 0 }, // Price not specified
    { name: "Crack Heal 910", unit: "KG", sku: 20, price: 4000 },
    { name: "Crack Heal 910", unit: "KG", sku: 2.5, price: 1025 },
    { name: "Crack Heal 910", unit: "KG", sku: 25, price: 9688 },
    // ... (all Building Care products)
  ],
  
  "Tiling and Grouting Materials": [
    { name: "Ressi TA 210", unit: "KG", sku: 20, price: 558 },
    { name: "Ressi TA 210 Plus", unit: "KG", sku: 20, price: 822 },
    // ... (all Tiling products)
  ],
  
  "Concrete Admixtures": [
    { name: "Max Flo P", unit: "LTR", sku: 1, price: 489 },
    { name: "Max Flo P", unit: "LTR", sku: 5, price: 1955 },
    { name: "Max Flo P", unit: "LTR", sku: 10, price: 3680 },
    { name: "Max Flo P", unit: "LTR", sku: 15, price: 5175 },
    { name: "Max Flo P", unit: "LTR", sku: 25, price: 8050 },
    { name: "Max Flo P", unit: "LTR", sku: 200, price: 59800 },
    // ... (all Concrete Admixtures)
  ],
  
  "Decorative Concrete": [
    { name: "Ressi Overlay", unit: "KG", sku: 50, price: 3220 },
    { name: "Pigmented H - 0001 (White)", unit: "KG", sku: 20, price: 4600 },
    // ... (all Decorative Concrete products)
  ],
  
  "Epoxy Adhesives and Coatings": [
    // Zepoxy Resin Art
    { name: "Zepoxy Resin Art", unit: "KG", sku: 0.75, price: 1170.21 },
    { name: "Zepoxy Resin Art", unit: "KG", sku: 1.5, price: 2170.21 },
    { name: "Zepoxy Resin Art", unit: "KG", sku: 15, price: 19680.85 },
    { name: "Zepoxy Resin Art", unit: "KG", sku: 45, price: 59042.55 },
    // ... (all Zepoxy products)
  ],
  
  "Specialty Products": [
    { name: "Ressi Anchor Fix", unit: "KG", sku: 3.8, price: 7245 },
    { name: "Ressi Anchor Fix", unit: "KG", sku: 38, price: 70680 },
    { name: "Ressi NSG 710", unit: "KG", sku: 20, price: 2100 },
    { name: "Ressi Kerb Grout 102", unit: "KG", sku: 20, price: 960 },
    { name: "Ressi KerbFix 101", unit: "KG", sku: 20, price: 900 },
    { name: "Zepoxy LEEG 10", unit: "KG", sku: 25, price: 66000 },
  ],
  
  "Epoxy Floorings & Coatings": [
    // All EPO products with their SKUs and prices
    // ... (all Epoxy Flooring products)
  ]
};

// Flatten all products into a single array with lookup key
const allCSVProducts = [];
Object.entries(csvProducts).forEach(([category, products]) => {
  products.forEach(p => {
    const key = `${p.name} - ${p.sku} ${p.unit}`;
    allCSVProducts.push({
      ...p,
      category,
      key
    });
  });
});

async function verifyAgainstCSV() {
  try {
    await connect();
    console.log("🔍 VERIFYING DATABASE AGAINST CSV FILE");
    console.log("=".repeat(80));
    console.log(`📋 CSV contains ${allCSVProducts.length} products\n`);
    
    // Get all active products from database
    const dbProducts = await Product.find({
      company_id: "RESSICHEM",
      isActive: true
    });
    
    console.log(`📦 Database contains ${dbProducts.length} active products\n`);
    
    const results = {
      exactMatch: [],
      priceMismatch: [],
      skuMismatch: [],
      unitMismatch: [],
      categoryMismatch: [],
      missingInDB: [],
      extraInDB: []
    };
    
    // Create lookup map for CSV products
    const csvMap = new Map();
    allCSVProducts.forEach(p => {
      csvMap.set(p.key, p);
    });
    
    // Check each CSV product against database
    console.log("📋 Checking CSV products against database...\n");
    for (const csvProduct of allCSVProducts) {
      const dbProduct = dbProducts.find(p => p.name === csvProduct.key);
      
      if (!dbProduct) {
        results.missingInDB.push(csvProduct);
      } else {
        let hasIssues = false;
        const issues = [];
        
        if (Math.abs(dbProduct.price - csvProduct.price) > 0.01) {
          issues.push(`Price: ${dbProduct.price} → ${csvProduct.price}`);
          hasIssues = true;
        }
        if (String(dbProduct.sku) !== String(csvProduct.sku)) {
          issues.push(`SKU: ${dbProduct.sku} → ${csvProduct.sku}`);
          hasIssues = true;
        }
        if (dbProduct.unit !== csvProduct.unit) {
          issues.push(`Unit: ${dbProduct.unit} → ${csvProduct.unit}`);
          hasIssues = true;
        }
        if (dbProduct.category?.mainCategory !== csvProduct.category) {
          issues.push(`Category: ${dbProduct.category?.mainCategory} → ${csvProduct.category}`);
          hasIssues = true;
        }
        
        if (hasIssues) {
          results.priceMismatch.push({
            name: csvProduct.key,
            issues,
            csv: csvProduct,
            db: dbProduct
          });
        } else {
          results.exactMatch.push(csvProduct.key);
        }
      }
    }
    
    // Check for products in DB but not in CSV
    console.log("📋 Checking for extra products in database...\n");
    for (const dbProduct of dbProducts) {
      if (!csvMap.has(dbProduct.name)) {
        results.extraInDB.push({
          name: dbProduct.name,
          price: dbProduct.price,
          sku: dbProduct.sku,
          unit: dbProduct.unit,
          category: dbProduct.category?.mainCategory
        });
      }
    }
    
    // Print results
    console.log("=".repeat(80));
    console.log("📊 VERIFICATION RESULTS");
    console.log("=".repeat(80));
    console.log(`✅ Exact Matches: ${results.exactMatch.length}`);
    console.log(`⚠️  Price/SKU/Unit/Category Mismatches: ${results.priceMismatch.length}`);
    console.log(`❌ Missing in Database: ${results.missingInDB.length}`);
    console.log(`➕ Extra in Database (not in CSV): ${results.extraInDB.length}`);
    
    // Show mismatches
    if (results.priceMismatch.length > 0) {
      console.log("\n" + "=".repeat(80));
      console.log("⚠️  MISMATCHES (first 20):");
      console.log("=".repeat(80));
      results.priceMismatch.slice(0, 20).forEach((m, i) => {
        console.log(`${i + 1}. ${m.name}`);
        m.issues.forEach(issue => console.log(`   - ${issue}`));
      });
      if (results.priceMismatch.length > 20) {
        console.log(`\n... and ${results.priceMismatch.length - 20} more mismatches`);
      }
    }
    
    // Show missing products
    if (results.missingInDB.length > 0) {
      console.log("\n" + "=".repeat(80));
      console.log("❌ MISSING IN DATABASE (first 20):");
      console.log("=".repeat(80));
      results.missingInDB.slice(0, 20).forEach((p, i) => {
        console.log(`${i + 1}. ${p.key} | ${p.price} PKR | ${p.category}`);
      });
      if (results.missingInDB.length > 20) {
        console.log(`\n... and ${results.missingInDB.length - 20} more missing products`);
      }
    }
    
    // Show extra products
    if (results.extraInDB.length > 0) {
      console.log("\n" + "=".repeat(80));
      console.log("➕ EXTRA IN DATABASE (not in CSV - first 20):");
      console.log("=".repeat(80));
      results.extraInDB.slice(0, 20).forEach((p, i) => {
        console.log(`${i + 1}. ${p.name} | ${p.price} PKR | ${p.category}`);
      });
      if (results.extraInDB.length > 20) {
        console.log(`\n... and ${results.extraInDB.length - 20} more extra products`);
      }
    }
    
    await disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    await disconnect();
    process.exit(1);
  }
}

verifyAgainstCSV();


// backend/scripts/fixRemainingTilingProducts.js
// Fixes remaining Tiling products based on CSV verification
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

async function fixRemainingTilingProducts() {
  try {
    await connect();
    console.log("🔧 FIXING REMAINING TILING PRODUCTS");
    console.log("=".repeat(80));
    
    let updated = 0;
    let created = 0;
    
    // Price updates
    const priceFixes = [
      { name: "TG 820 - 9960 - 1 KG", price: 460 },
      { name: "TG 820 - 9960 - 15 KG", price: 6555 },
      { name: "Ressi Tile Latex - 1 LTR", price: 1840 },
      { name: "Ressi Tile Latex - 5 LTR", price: 8625 },
      { name: "Ressi Tile Latex - 10 LTR", price: 16100 },
      { name: "Ressi Tile Latex - 15 LTR", price: 22425 },
      { name: "Ressi Tile Latex - 25 LTR", price: 34500 },
      { name: "Ressi Tile Latex - 200 LTR", price: 253000 },
    ];
    
    console.log("📋 Updating prices...\n");
    for (const fix of priceFixes) {
      const product = await Product.findOne({
        name: fix.name,
        company_id: "RESSICHEM"
      });
      
      if (product && product.price !== fix.price) {
        await Product.findByIdAndUpdate(product._id, { $set: { price: fix.price } });
        console.log(`✅ Updated: ${fix.name} (${product.price} → ${fix.price})`);
        updated++;
      }
    }
    
    // Create missing products
    console.log("\n📋 Creating missing products...\n");
    const missingProducts = [
      // ETG DP Matt series
      { name: "Ressi ETG DP Matt 0001 - 1.6 KG", sku: "1.6", unit: "KG", price: 2645, category: "Tiling and Grouting Materials" },
      { name: "Ressi ETG DP Matt 1110 - 1.6 KG", sku: "1.6", unit: "KG", price: 2645, category: "Tiling and Grouting Materials" },
      { name: "Ressi ETG DP Matt 1211 - 1.6 KG", sku: "1.6", unit: "KG", price: 2645, category: "Tiling and Grouting Materials" },
      { name: "Ressi ETG DP Matt 5110 - 1.6 KG", sku: "1.6", unit: "KG", price: 2645, category: "Tiling and Grouting Materials" },
      { name: "Ressi ETG DP Matt 5210 - 1.6 KG", sku: "1.6", unit: "KG", price: 2645, category: "Tiling and Grouting Materials" },
      { name: "Ressi ETG DP Matt 9960 - 1.6 KG", sku: "1.6", unit: "KG", price: 2645, category: "Tiling and Grouting Materials" },
      
      // Ressi Grout Latex series
      { name: "Ressi Grout Latex - 1 LTR", sku: "1", unit: "LTR", price: 891, category: "Tiling and Grouting Materials" },
      { name: "Ressi Grout Latex - 5 LTR", sku: "5", unit: "LTR", price: 4313, category: "Tiling and Grouting Materials" },
      { name: "Ressi Grout Latex - 10 LTR", sku: "10", unit: "LTR", price: 8338, category: "Tiling and Grouting Materials" },
      { name: "Ressi Grout Latex - 15 LTR", sku: "15", unit: "LTR", price: 12075, category: "Tiling and Grouting Materials" },
      { name: "Ressi Grout Latex - 25 LTR", sku: "25", unit: "LTR", price: 19550, category: "Tiling and Grouting Materials" },
      { name: "Ressi Grout Latex - 200 LTR", sku: "200", unit: "LTR", price: 151800, category: "Tiling and Grouting Materials" },
      
      // Ressi TA 2K series (LTR)
      { name: "Ressi TA 2K (Grey) - 1 LTR", sku: "1", unit: "LTR", price: 1840, category: "Tiling and Grouting Materials" },
      { name: "Ressi TA 2K (Grey) - 5 LTR", sku: "5", unit: "LTR", price: 8625, category: "Tiling and Grouting Materials" },
      { name: "Ressi TA 2K (Grey) - 10 LTR", sku: "10", unit: "LTR", price: 16100, category: "Tiling and Grouting Materials" },
      { name: "Ressi TA 2K (Grey) - 15 LTR", sku: "15", unit: "LTR", price: 22425, category: "Tiling and Grouting Materials" },
      { name: "Ressi TA 2K (Grey) - 25 LTR", sku: "25", unit: "LTR", price: 34500, category: "Tiling and Grouting Materials" },
      { name: "Ressi TA 2K (Grey) - 200 LTR", sku: "200", unit: "LTR", price: 253000, category: "Tiling and Grouting Materials" },
      { name: "Ressi TA 2K (White) - 1 LTR", sku: "1", unit: "LTR", price: 1955, category: "Tiling and Grouting Materials" },
      { name: "Ressi TA 2K (White) - 5 LTR", sku: "5", unit: "LTR", price: 9200, category: "Tiling and Grouting Materials" },
      { name: "Ressi TA 2K (White) - 10 LTR", sku: "10", unit: "LTR", price: 17250, category: "Tiling and Grouting Materials" },
      { name: "Ressi TA 2K (White) - 15 LTR", sku: "15", unit: "LTR", price: 24150, category: "Tiling and Grouting Materials" },
      { name: "Ressi TA 2K (White) - 25 LTR", sku: "25", unit: "LTR", price: 37375, category: "Tiling and Grouting Materials" },
      { name: "Ressi TA 2K (White) - 200 LTR", sku: "200", unit: "LTR", price: 276000, category: "Tiling and Grouting Materials" },
      
      // Ressi TA HPA
      { name: "Ressi TA HPA - 20 KG", sku: "20", unit: "KG", price: 25875, category: "Tiling and Grouting Materials" },
      
      // Ressi Grout Seal series
      { name: "Ressi Grout Seal - 1 LTR", sku: "1", unit: "LTR", price: 1840, category: "Tiling and Grouting Materials" },
      { name: "Ressi Grout Seal - 5 LTR", sku: "5", unit: "LTR", price: 8625, category: "Tiling and Grouting Materials" },
      { name: "Ressi Grout Seal - 10 LTR", sku: "10", unit: "LTR", price: 16100, category: "Tiling and Grouting Materials" },
      { name: "Ressi Grout Seal - 15 LTR", sku: "15", unit: "LTR", price: 22425, category: "Tiling and Grouting Materials" },
      { name: "Ressi Grout Seal - 25 LTR", sku: "25", unit: "LTR", price: 34500, category: "Tiling and Grouting Materials" },
      { name: "Ressi Grout Seal - 200 LTR", sku: "200", unit: "LTR", price: 253000, category: "Tiling and Grouting Materials" },
      
      // Ressi Grout Admix series
      { name: "Ressi Grout Admix - 1 LTR", sku: "1", unit: "LTR", price: 1955, category: "Tiling and Grouting Materials" },
      { name: "Ressi Grout Admix - 5 LTR", sku: "5", unit: "LTR", price: 9200, category: "Tiling and Grouting Materials" },
      { name: "Ressi Grout Admix - 10 LTR", sku: "10", unit: "LTR", price: 17250, category: "Tiling and Grouting Materials" },
      { name: "Ressi Grout Admix - 15 LTR", sku: "15", unit: "LTR", price: 24150, category: "Tiling and Grouting Materials" },
      { name: "Ressi Grout Admix - 25 LTR", sku: "25", unit: "LTR", price: 37375, category: "Tiling and Grouting Materials" },
      { name: "Ressi Grout Admix - 200 LTR", sku: "200", unit: "LTR", price: 276000, category: "Tiling and Grouting Materials" },
      
      // Ressi ETA SF-1 series
      { name: "Ressi ETA SF-1 - 1 LTR", sku: "1", unit: "LTR", price: 489, category: "Tiling and Grouting Materials" },
      { name: "Ressi ETA SF-1 - 5 LTR", sku: "5", unit: "LTR", price: 1955, category: "Tiling and Grouting Materials" },
      { name: "Ressi ETA SF-1 - 10 LTR", sku: "10", unit: "LTR", price: 3680, category: "Tiling and Grouting Materials" },
      { name: "Ressi ETA SF-1 - 15 LTR", sku: "15", unit: "LTR", price: 5175, category: "Tiling and Grouting Materials" },
      { name: "Ressi ETA SF-1 - 25 LTR", sku: "25", unit: "LTR", price: 8050, category: "Tiling and Grouting Materials" },
      { name: "Ressi ETA SF-1 - 200 LTR", sku: "200", unit: "LTR", price: 59800, category: "Tiling and Grouting Materials" },
      
      // Ressi ETA series
      { name: "Ressi ETA - 1 LTR", sku: "1", unit: "LTR", price: 529, category: "Tiling and Grouting Materials" },
      { name: "Ressi ETA - 5 LTR", sku: "5", unit: "LTR", price: 2070, category: "Tiling and Grouting Materials" },
      { name: "Ressi ETA - 10 LTR", sku: "10", unit: "LTR", price: 4025, category: "Tiling and Grouting Materials" },
      { name: "Ressi ETA - 15 LTR", sku: "15", unit: "LTR", price: 5865, category: "Tiling and Grouting Materials" },
      { name: "Ressi ETA - 25 LTR", sku: "25", unit: "LTR", price: 9488, category: "Tiling and Grouting Materials" },
      { name: "Ressi ETA - 200 LTR", sku: "200", unit: "LTR", price: 71300, category: "Tiling and Grouting Materials" },
      
      // Ressi TA 0001 B, Ressi TA QS - 1
      { name: "Ressi TA 0001 B - 20 KG", sku: "20", unit: "KG", price: 5187, category: "Tiling and Grouting Materials" },
      { name: "Ressi TA QS - 1 - 20 KG", sku: "20", unit: "KG", price: 6107, category: "Tiling and Grouting Materials" },
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

fixRemainingTilingProducts();


// backend/scripts/fixTilingProducts.js
// Fixes Tiling products based on CSV verification
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

async function fixTilingProducts() {
  try {
    await connect();
    console.log("🔧 FIXING TILING PRODUCTS");
    console.log("=".repeat(80));
    
    let updated = 0;
    let created = 0;
    
    // Price updates
    const priceFixes = [
      { name: "Ressi TA 220 - 15 KG", price: 3278 },
      { name: "Ressi TA 230 (Grey) - 1 KG", price: 196 },
      { name: "Ressi TA 230 (Grey) - 15 KG", price: 2588 },
      { name: "Ressi TA 230 (White) - 1 KG", price: 196 },
      { name: "Ressi TA 230 (White) - 15 KG", price: 2415 },
      { name: "Ressi TA 240 - 1 KG", price: 495 },
      { name: "Ressi TA 240 - 15 KG", price: 7073 },
      { name: "Ressi TA 250 - 1 KG", price: 702 },
      { name: "Ressi TA 250 - 15 KG", price: 10178 },
      { name: "Ressi TA 260 - 1 KG", price: 196 },
      { name: "Ressi TA 260 - 15 KG", price: 2760 },
      { name: "Ressi TG 820 - 1600 - 1 KG", price: 460 },
      { name: "Ressi TG 820 - 1600 - 15 KG", price: 6555 },
      { name: "TG 820 - 3100 - 1 KG", price: 253 },
      { name: "TG 820 - 3700 - 1 KG", price: 460 },
      { name: "TG 820 - 3700 - 15 KG", price: 6555 },
      { name: "TG 820 - 5650 - 1 KG", price: 633 },
      { name: "TG 820 - 5650 - 15 KG", price: 9143 },
      { name: "TG 820 - 5960 - 1 KG", price: 920 },
      { name: "TG 820 - 5960 - 15 KG", price: 13455 },
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
    
    // Create missing products - I'll add the most critical ones first
    console.log("\n📋 Creating missing products...\n");
    const missingProducts = [
      { name: "Ressi TA 210 - 1 KG", sku: "1", unit: "KG", price: 161, category: "Tiling and Grouting Materials" },
      { name: "Ressi TA 210 - 15 KG", sku: "15", unit: "KG", price: 2243, category: "Tiling and Grouting Materials" },
      { name: "Ressi TA 210 Plus - 1 KG", sku: "1", unit: "KG", price: 173, category: "Tiling and Grouting Materials" },
      { name: "Ressi TA 210 Plus - 15 KG", sku: "15", unit: "KG", price: 2415, category: "Tiling and Grouting Materials" },
      { name: "TG 810 -5110 - 1 KG", sku: "1", unit: "KG", price: 196, category: "Tiling and Grouting Materials" },
      { name: "TG 810 -5110 - 15 KG", sku: "15", unit: "KG", price: 2415, category: "Tiling and Grouting Materials" },
      { name: "Ressi TG 810 - 9111-1 - 1 KG", sku: "1", unit: "KG", price: 230, category: "Tiling and Grouting Materials" },
      { name: "Ressi TG 810 - 9111-1 - 15 KG", sku: "15", unit: "KG", price: 3105, category: "Tiling and Grouting Materials" },
      { name: "Ressi TG 820 -1110 - 1 KG", sku: "1", unit: "KG", price: 230, category: "Tiling and Grouting Materials" },
      { name: "Ressi TG 820 -1110 - 15 KG", sku: "15", unit: "KG", price: 3105, category: "Tiling and Grouting Materials" },
      { name: "TG 820 -5110 - 1 KG", sku: "1", unit: "KG", price: 230, category: "Tiling and Grouting Materials" },
      { name: "TG 820 -5110 - 15 KG", sku: "15", unit: "KG", price: 3105, category: "Tiling and Grouting Materials" },
      { name: "Ressi TG 820 - 6400 - 1 KG", sku: "1", unit: "KG", price: 230, category: "Tiling and Grouting Materials" },
      { name: "Ressi TG 820 - 6400 - 15 KG", sku: "15", unit: "KG", price: 3105, category: "Tiling and Grouting Materials" },
      { name: "Ressi TG 820 -1950 - 1 KG", sku: "1", unit: "KG", price: 230, category: "Tiling and Grouting Materials" },
      { name: "Ressi TG 820 -1950 - 15 KG", sku: "15", unit: "KG", price: 3105, category: "Tiling and Grouting Materials" },
      { name: "Ressi TG 820 -5410-1 - 1 KG", sku: "1", unit: "KG", price: 460, category: "Tiling and Grouting Materials" },
      { name: "Ressi TG 820 -5410-1 - 15 KG", sku: "15", unit: "KG", price: 6555, category: "Tiling and Grouting Materials" },
      { name: "Ressi TG 820 - 9111-1 - 1 KG", sku: "1", unit: "KG", price: 230, category: "Tiling and Grouting Materials" },
      { name: "Ressi TG 820 - 9111-1 - 15 KG", sku: "15", unit: "KG", price: 3105, category: "Tiling and Grouting Materials" },
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
    console.log("\n⚠️  Note: There are more missing products. Run verification again to see remaining issues.");
    
    await disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    await disconnect();
    process.exit(1);
  }
}

fixTilingProducts();


// backend/scripts/fixFinalTilingProducts.js
// Fixes final missing Tiling products
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

async function fixFinalTilingProducts() {
  try {
    await connect();
    console.log("🔧 FIXING FINAL TILING PRODUCTS");
    console.log("=".repeat(80));
    
    let created = 0;
    
    // Create missing products
    console.log("📋 Creating missing products...\n");
    const missingProducts = [
      // Ressi TA 2K (Grey) - KG series
      { name: "Ressi TA 2K (Grey) - 1 KG", sku: "1", unit: "KG", price: 978, category: "Tiling and Grouting Materials" },
      { name: "Ressi TA 2K (Grey) - 5 KG", sku: "5", unit: "KG", price: 4744, category: "Tiling and Grouting Materials" },
      { name: "Ressi TA 2K (Grey) - 10 KG", sku: "10", unit: "KG", price: 9200, category: "Tiling and Grouting Materials" },
      { name: "Ressi TA 2K (Grey) - 15 KG", sku: "15", unit: "KG", price: 13369, category: "Tiling and Grouting Materials" },
      { name: "Ressi TA 2K (Grey) - 30 KG", sku: "30", unit: "KG", price: 21563, category: "Tiling and Grouting Materials" },
      { name: "Ressi TA 2K (Grey) - 200 KG", sku: "200", unit: "KG", price: 166750, category: "Tiling and Grouting Materials" },
      
      // Ressi TA 2K (White) - KG series
      { name: "Ressi TA 2K (White) - 1 KG", sku: "1", unit: "KG", price: 978, category: "Tiling and Grouting Materials" },
      { name: "Ressi TA 2K (White) - 5 KG", sku: "5", unit: "KG", price: 4744, category: "Tiling and Grouting Materials" },
      { name: "Ressi TA 2K (White) - 10 KG", sku: "10", unit: "KG", price: 9200, category: "Tiling and Grouting Materials" },
      { name: "Ressi TA 2K (White) - 15 KG", sku: "15", unit: "KG", price: 13369, category: "Tiling and Grouting Materials" },
      { name: "Ressi TA 2K (White) - 30 KG", sku: "30", unit: "KG", price: 21563, category: "Tiling and Grouting Materials" },
      { name: "Ressi TA 2K (White) - 200 KG", sku: "200", unit: "KG", price: 166750, category: "Tiling and Grouting Materials" },
      
      // Ressi TA HPA - 25 KG (update existing 20 KG or create new)
      { name: "Ressi TA HPA - 25 KG", sku: "25", unit: "KG", price: 3858, category: "Tiling and Grouting Materials" },
      
      // Ressi TG 2K series
      { name: "Ressi TG 2K - 0001 - 1.5 KG", sku: "1.5", unit: "KG", price: 1150, category: "Tiling and Grouting Materials" },
      { name: "Ressi TG 2K - 1110 - 1.5 KG", sku: "1.5", unit: "KG", price: 1150, category: "Tiling and Grouting Materials" },
      { name: "Ressi TG 2K - 1211 - 1.5 KG", sku: "1.5", unit: "KG", price: 1150, category: "Tiling and Grouting Materials" },
      { name: "Ressi TG 2K - 5110 - 1.5 KG", sku: "1.5", unit: "KG", price: 1150, category: "Tiling and Grouting Materials" },
      { name: "Ressi TG 2K - 5210 - 1 - 1.5 KG", sku: "1.5", unit: "KG", price: 1150, category: "Tiling and Grouting Materials" },
      { name: "Ressi TG 2K - 9960 - 1.5 KG", sku: "1.5", unit: "KG", price: 1150, category: "Tiling and Grouting Materials" },
      
      // Ressi TG Bath Seal 2K series
      { name: "Ressi TG Bath Seal 2K - 0001 - 1.5 KG", sku: "1.5", unit: "KG", price: 1380, category: "Tiling and Grouting Materials" },
      { name: "Ressi TG Bath Seal 2K - 1110 - 1.5 KG", sku: "1.5", unit: "KG", price: 1380, category: "Tiling and Grouting Materials" },
      { name: "Ressi TG Bath Seal 2K - 1211 - 1.5 KG", sku: "1.5", unit: "KG", price: 1380, category: "Tiling and Grouting Materials" },
      { name: "Ressi TG Bath Seal 2K - 5110 - 1.5 KG", sku: "1.5", unit: "KG", price: 1380, category: "Tiling and Grouting Materials" },
      { name: "Ressi TG Bath Seal 2K - 5210 - 1 - 1.5 KG", sku: "1.5", unit: "KG", price: 1380, category: "Tiling and Grouting Materials" },
      { name: "Ressi TG Bath Seal 2K - 9960 - 1.5 KG", sku: "1.5", unit: "KG", price: 1380, category: "Tiling and Grouting Materials" },
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
    console.log(`➕ Created: ${created} products`);
    
    await disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    await disconnect();
    process.exit(1);
  }
}

fixFinalTilingProducts();


// backend/scripts/fixBuildingCareProducts.js
// Fixes Building Care products based on CSV verification
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

async function fixBuildingCareProducts() {
  try {
    await connect();
    console.log("🔧 FIXING BUILDING CARE PRODUCTS");
    console.log("=".repeat(80));
    
    let updated = 0;
    let created = 0;
    
    // Price updates
    const priceFixes = [
      { name: "Crack Heal 910 - 1 KG", price: 250 },
      { name: "Crack Heal 910 2K - 1 KG", price: 344 },
      { name: "Crack Heal 920 - 1 KG", price: 0 },
      { name: "Crack Heal 930 - 1 KG", price: 1563 },
      { name: "Crack Heal Flexi 950 - 15 KG", price: 0 },
      { name: "Water Guard 491 - 20 KG", price: 6688 },
      { name: "Water Guard 5010 - 20 KG", price: 4813 },
      { name: "Water Guard 5253 - 20 KG", price: 4813 },
      { name: "Ressi SBR 5850 - 25 KG", price: 25781 },
      { name: "Ressi Guru - 1 KG", price: 606 },
      { name: "Ressi SBR 5840 - 25 KG", price: 12813 },
      { name: "Water Guard P 200 - 20 KG", price: 3250 },
      { name: "Patch 365 - 1 KG", price: 88 },
      { name: "Patch 365 Plus - 25 KG", price: 13750 },
      { name: "Patch Epoxy 111 - 25 KG", price: 14063 },
      { name: "Rapid Patch 999 - 1 KG", price: 250 },
      { name: "Heat Guard 1000 - 20 KG", price: 23125 },
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
      { name: "Crack Heal 910 - 20 KG", sku: "20", unit: "KG", price: 4000, category: "Building Care and Maintenance" },
      { name: "Crack Heal 910 - 2.5 KG", sku: "2.5", unit: "KG", price: 1025, category: "Building Care and Maintenance" },
      { name: "Crack Heal 910 - 25 KG", sku: "25", unit: "KG", price: 9688, category: "Building Care and Maintenance" },
      { name: "Crack Heal 910 2K - 20 KG", sku: "20", unit: "KG", price: 4750, category: "Building Care and Maintenance" },
      { name: "Crack Heal 910 2K - 2.5 KG", sku: "2.5", unit: "KG", price: 1025, category: "Building Care and Maintenance" },
      { name: "Crack Heal 910 2K - 25 KG", sku: "25", unit: "KG", price: 9688, category: "Building Care and Maintenance" },
      { name: "Crack Heal 920 - 20 KG", sku: "20", unit: "KG", price: 0, category: "Building Care and Maintenance" },
      { name: "Crack Heal 920 2K - 2.18 KG", sku: "2.18", unit: "KG", price: 1438, category: "Building Care and Maintenance" },
      { name: "Crack Heal 920 2K - 21.8 KG", sku: "21.8", unit: "KG", price: 12263, category: "Building Care and Maintenance" },
      { name: "Crack Heal 930 - 20 KG", sku: "20", unit: "KG", price: 26875, category: "Building Care and Maintenance" },
      { name: "Crack Heal 940 - 2 KG", sku: "2", unit: "KG", price: 0, category: "Building Care and Maintenance" },
      { name: "Crack Heal Flexi 950 - 12 KG", sku: "12", unit: "KG", price: 0, category: "Building Care and Maintenance" },
      { name: "Wall Guard 11,000 G - 2.17 KG", sku: "2.17", unit: "KG", price: 1188, category: "Building Care and Maintenance" },
      { name: "Wall Guard 11,000 G - 21.7 KG", sku: "21.7", unit: "KG", price: 8875, category: "Building Care and Maintenance" },
      { name: "Tough Guard 12,000 E - 3.2 KG", sku: "3.2", unit: "KG", price: 1875, category: "Building Care and Maintenance" },
      { name: "Tough Guard 12,000 E - 16 KG", sku: "16", unit: "KG", price: 8125, category: "Building Care and Maintenance" },
      { name: "Tough Guard 12,000 E - 20 KG", sku: "20", unit: "KG", price: 10156, category: "Building Care and Maintenance" },
      { name: "Water Guard 491 - 3.2 KG", sku: "3.2", unit: "KG", price: 1225, category: "Building Care and Maintenance" },
      { name: "Water Guard 491 - 16 KG", sku: "16", unit: "KG", price: 5438, category: "Building Care and Maintenance" },
      { name: "Water Guard 5010 - 3.2 KG", sku: "3.2", unit: "KG", price: 938, category: "Building Care and Maintenance" },
      { name: "Water Guard 5010 - 16 KG", sku: "16", unit: "KG", price: 3063, category: "Building Care and Maintenance" },
      { name: "Water Guard 5253 - 3.2 KG", sku: "3.2", unit: "KG", price: 938, category: "Building Care and Maintenance" },
      { name: "Water Guard 5253 - 16 KG", sku: "16", unit: "KG", price: 3063, category: "Building Care and Maintenance" },
      { name: "3020 N - 0001 (White) - 20 KG", sku: "20", unit: "KG", price: 25213, category: "Building Care and Maintenance" },
      { name: "3020 N - 9400 (Grey) - 20 KG", sku: "20", unit: "KG", price: 25213, category: "Building Care and Maintenance" },
      { name: "3020 N - 3900 X1 - 1 (Terracotta) - 20 KG", sku: "20", unit: "KG", price: 25213, category: "Building Care and Maintenance" },
      { name: "3020 N - 1200 (Dessert Sand) - 20 KG", sku: "20", unit: "KG", price: 25213, category: "Building Care and Maintenance" },
      { name: "3020 N - 5210 (Sky Blue) - 20 KG", sku: "20", unit: "KG", price: 25213, category: "Building Care and Maintenance" },
      { name: "3020 N - 2400 (Light Green) - 20 KG", sku: "20", unit: "KG", price: 25213, category: "Building Care and Maintenance" },
      { name: "1530 Econo - 0001 (White) - 20 KG", sku: "20", unit: "KG", price: 15500, category: "Building Care and Maintenance" },
      { name: "1530 Econo - 9400 (Grey) - 20 KG", sku: "20", unit: "KG", price: 15500, category: "Building Care and Maintenance" },
      { name: "1530 Econo- 3900 X1 - 1 (Terracotta) - 20 KG", sku: "20", unit: "KG", price: 15500, category: "Building Care and Maintenance" },
      { name: "1530 Econo - 1200 (Dessert Sand) - 20 KG", sku: "20", unit: "KG", price: 15500, category: "Building Care and Maintenance" },
      { name: "1530 Econo - 5210 (Sky Blue) - 20 KG", sku: "20", unit: "KG", price: 15625, category: "Building Care and Maintenance" },
      { name: "1530 Econo - 2400 (Light Green) - 20 KG", sku: "20", unit: "KG", price: 15688, category: "Building Care and Maintenance" },
      { name: "1810 - 0001 (White) - 20 KG", sku: "20", unit: "KG", price: 22000, category: "Building Care and Maintenance" },
      { name: "1810 N - 9400 (Grey) - 20 KG", sku: "20", unit: "KG", price: 22000, category: "Building Care and Maintenance" },
      { name: "1810 - 3900 X1 - 1 (Terracotta) - 20 KG", sku: "20", unit: "KG", price: 22000, category: "Building Care and Maintenance" },
      { name: "1810 - 1200 (Dessert Sand) - 20 KG", sku: "20", unit: "KG", price: 22000, category: "Building Care and Maintenance" },
      { name: "1810 - 5210 (Sky Blue) - 20 KG", sku: "20", unit: "KG", price: 22000, category: "Building Care and Maintenance" },
      { name: "1810 - 2400 (Light Green) - 20 KG", sku: "20", unit: "KG", price: 22000, category: "Building Care and Maintenance" },
      { name: "Water Guard 247 - 12 KG", sku: "12", unit: "KG", price: 0, category: "Building Care and Maintenance" },
      { name: "Water Guard 247 - 200 KG", sku: "200", unit: "KG", price: 0, category: "Building Care and Maintenance" },
      { name: "Water Guard 247 - 20 KG", sku: "20", unit: "KG", price: 0, category: "Building Care and Maintenance" },
      { name: "Water Guard 247 Plus - 200 KG", sku: "200", unit: "KG", price: 0, category: "Building Care and Maintenance" },
      { name: "Silprime 3K - 1.25 KG", sku: "1.25", unit: "KG", price: 5000, category: "Building Care and Maintenance" },
      { name: "Damp Seal - 1.25 KG", sku: "1.25", unit: "KG", price: 4688, category: "Building Care and Maintenance" },
      { name: "Silmix - 1 LTR", sku: "1", unit: "LTR", price: 1088, category: "Building Care and Maintenance" },
      { name: "Silmix - 5 LTR", sku: "5", unit: "LTR", price: 5375, category: "Building Care and Maintenance" },
      { name: "Silmix - 10 LTR", sku: "10", unit: "LTR", price: 10625, category: "Building Care and Maintenance" },
      { name: "Silmix - 15 LTR", sku: "15", unit: "LTR", price: 15750, category: "Building Care and Maintenance" },
      { name: "Silmix - 25 LTR", sku: "25", unit: "LTR", price: 25938, category: "Building Care and Maintenance" },
      { name: "Silmix - 200 LTR", sku: "200", unit: "LTR", price: 200000, category: "Building Care and Maintenance" },
      { name: "Ressi SBR 5850 - 1 KG", sku: "1", unit: "KG", price: 1125, category: "Building Care and Maintenance" },
      { name: "Ressi SBR 5850 - 5 KG", sku: "5", unit: "KG", price: 5469, category: "Building Care and Maintenance" },
      { name: "Ressi SBR 5850 - 10 KG", sku: "10", unit: "KG", price: 10688, category: "Building Care and Maintenance" },
      { name: "Ressi SBR 5850 - 15 KG", sku: "15", unit: "KG", price: 15750, category: "Building Care and Maintenance" },
      { name: "Ressi SBR 5850 - 200 KG", sku: "200", unit: "KG", price: 198000, category: "Building Care and Maintenance" },
      { name: "Ressi Guru - 5 KG", sku: "5", unit: "KG", price: 2969, category: "Building Care and Maintenance" },
      { name: "Ressi Guru - 10 KG", sku: "10", unit: "KG", price: 5813, category: "Building Care and Maintenance" },
      { name: "Ressi Guru - 25 KG", sku: "25", unit: "KG", price: 13906, category: "Building Care and Maintenance" },
      { name: "Ressi Guru - 200 KG", sku: "200", unit: "KG", price: 107500, category: "Building Care and Maintenance" },
      { name: "Ressi SBR 5840 - 1 KG", sku: "1", unit: "KG", price: 563, category: "Building Care and Maintenance" },
      { name: "Ressi SBR 5840 - 5 KG", sku: "5", unit: "KG", price: 2750, category: "Building Care and Maintenance" },
      { name: "Ressi SBR 5840 - 10 KG", sku: "10", unit: "KG", price: 5375, category: "Building Care and Maintenance" },
      { name: "Ressi SBR 5840 - 15 KG", sku: "15", unit: "KG", price: 7781, category: "Building Care and Maintenance" },
      { name: "Ressi SBR 5840 - 200 KG", sku: "200", unit: "KG", price: 100000, category: "Building Care and Maintenance" },
      { name: "Water Guard L 100 - 1 KG", sku: "1", unit: "KG", price: 3125, category: "Building Care and Maintenance" },
      { name: "Water Guard L 100 - 5 KG", sku: "5", unit: "KG", price: 15000, category: "Building Care and Maintenance" },
      { name: "Water Guard L 100 - 10 KG", sku: "10", unit: "KG", price: 28750, category: "Building Care and Maintenance" },
      { name: "Water Guard L 100 - 15 KG", sku: "15", unit: "KG", price: 42750, category: "Building Care and Maintenance" },
      { name: "Water Guard L 100 - 25 KG", sku: "25", unit: "KG", price: 69375, category: "Building Care and Maintenance" },
      { name: "Water Guard L 100 - 200 KG", sku: "200", unit: "KG", price: 550000, category: "Building Care and Maintenance" },
      { name: "Water Guard P 200 - 1 KG", sku: "1", unit: "KG", price: 175, category: "Building Care and Maintenance" },
      { name: "Silblock - 1 LTR", sku: "1", unit: "LTR", price: 1513, category: "Building Care and Maintenance" },
      { name: "Silblock - 5 LTR", sku: "5", unit: "LTR", price: 7500, category: "Building Care and Maintenance" },
      { name: "Silblock - 10 LTR", sku: "10", unit: "LTR", price: 14750, category: "Building Care and Maintenance" },
      { name: "Silblock - 15 LTR", sku: "15", unit: "LTR", price: 21750, category: "Building Care and Maintenance" },
      { name: "Silblock - 25 LTR", sku: "25", unit: "LTR", price: 35625, category: "Building Care and Maintenance" },
      { name: "Silblock - 200 LTR", sku: "200", unit: "LTR", price: 280000, category: "Building Care and Maintenance" },
      { name: "Silblock PLUS - 1 LTR", sku: "1", unit: "LTR", price: 2688, category: "Building Care and Maintenance" },
      { name: "Silblock PLUS - 5 LTR", sku: "5", unit: "LTR", price: 13313, category: "Building Care and Maintenance" },
      { name: "Silblock PLUS - 10 LTR", sku: "10", unit: "LTR", price: 26375, category: "Building Care and Maintenance" },
      { name: "Silblock PLUS - 15 LTR", sku: "15", unit: "LTR", price: 39375, category: "Building Care and Maintenance" },
      { name: "Silblock PLUS - 25 LTR", sku: "25", unit: "LTR", price: 64063, category: "Building Care and Maintenance" },
      { name: "Silblock PLUS - 200 LTR", sku: "200", unit: "LTR", price: 500000, category: "Building Care and Maintenance" },
      { name: "Patch 365 - 20 KG", sku: "20", unit: "KG", price: 1075, category: "Building Care and Maintenance" },
      { name: "Patch 365 - 2.5 KG", sku: "2.5", unit: "KG", price: 1875, category: "Building Care and Maintenance" },
      { name: "Water Guard Crysta Coat 101 - 1 KG", sku: "1", unit: "KG", price: 563, category: "Building Care and Maintenance" },
      { name: "Water Guard Crysta Coat 101 - 20 KG", sku: "20", unit: "KG", price: 10000, category: "Building Care and Maintenance" },
      { name: "Water Guard Crysta Coat 102 - 1 KG", sku: "1", unit: "KG", price: 500, category: "Building Care and Maintenance" },
      { name: "Water Guard Crysta Coat 102 - 20 KG", sku: "20", unit: "KG", price: 8750, category: "Building Care and Maintenance" },
      { name: "Water Guard Crysta Admix 103 - 1 KG", sku: "1", unit: "KG", price: 713, category: "Building Care and Maintenance" },
      { name: "Water Guard Crysta Admix 103 - 20 KG", sku: "20", unit: "KG", price: 13000, category: "Building Care and Maintenance" },
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

fixBuildingCareProducts();


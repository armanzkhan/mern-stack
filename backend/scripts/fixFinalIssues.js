// backend/scripts/fixFinalIssues.js
// Creates missing Machine Grade products and fixes remaining issues
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

async function fixFinalIssues() {
  try {
    await connect();
    console.log("🔧 FIXING FINAL ISSUES");
    console.log("=".repeat(80));
    
    let created = 0;
    
    // Create missing Machine Grade products
    console.log("📋 Creating missing Machine Grade products...");
    
    const machineGradeProducts = [
      { baseName: "Ressi PlastoRend 100", sku: 50, unit: "KG", price: 1553 },
      { baseName: "Ressi PlastoRend 110", sku: 50, unit: "KG", price: 1553 },
    ];
    
    for (const productInfo of machineGradeProducts) {
      const machineGradeName = `${productInfo.baseName} (Machine Grade) - ${productInfo.sku} ${productInfo.unit}`;
      
      const existing = await Product.findOne({
        name: machineGradeName,
        company_id: "RESSICHEM"
      });
      
      if (!existing) {
        // Get category from Market Grade product
        const marketGrade = await Product.findOne({
          name: `${productInfo.baseName} (Market Grade) - ${productInfo.sku} ${productInfo.unit}`,
          company_id: "RESSICHEM"
        });
        
        const category = marketGrade?.category || {
          mainCategory: "Dry Mix Mortars / Premix Plasters",
          subCategory: productInfo.baseName.replace("Ressi ", "")
        };
        
        const newProduct = new Product({
          name: machineGradeName,
          sku: String(productInfo.sku),
          unit: productInfo.unit,
          price: productInfo.price,
          category: category,
          company_id: "RESSICHEM",
          isActive: true,
          stock: 0
        });
        
        await newProduct.save();
        console.log(`✅ Created: ${machineGradeName}`);
        created++;
      } else {
        // Update price if needed
        if (existing.price !== productInfo.price) {
          await Product.findByIdAndUpdate(existing._id, { $set: { price: productInfo.price } });
          console.log(`✅ Fixed price: ${machineGradeName} (${existing.price} → ${productInfo.price})`);
        }
      }
    }
    
    // Remove base PlastoRend products with price 1380 (duplicates)
    console.log("\n📋 Removing duplicate base PlastoRend products...");
    const baseProducts = await Product.find({
      name: { $in: ["Ressi PlastoRend 100 - 50 KG", "Ressi PlastoRend 110 - 50 KG"] },
      company_id: "RESSICHEM",
      price: 1380
    });
    
    for (const product of baseProducts) {
      // Check if Market or Machine Grade versions exist
      const hasMarket = await Product.findOne({
        name: product.name.replace(" - 50 KG", " (Market Grade) - 50 KG"),
        company_id: "RESSICHEM"
      });
      
      const hasMachine = await Product.findOne({
        name: product.name.replace(" - 50 KG", " (Machine Grade) - 50 KG"),
        company_id: "RESSICHEM"
      });
      
      if (hasMarket && hasMachine) {
        // Both exist, so we can deactivate the base product
        await Product.findByIdAndUpdate(product._id, { $set: { isActive: false } });
        console.log(`✅ Deactivated duplicate: ${product.name}`);
      }
    }
    
    // Fix Zepoxy products - check if import script has price 0 or actual prices
    // For now, we'll keep them at 0 as per the import script
    console.log("\n📋 Zepoxy products are set to 0 as per import script");
    console.log("   (If you need actual prices, update the import script)");
    
    console.log("\n" + "=".repeat(80));
    console.log("📊 FIX SUMMARY");
    console.log("=".repeat(80));
    console.log(`➕ Created: ${created} products`);
    console.log(`✅ Deactivated: ${baseProducts.length} duplicate products`);
    
    await disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error fixing issues:", error);
    await disconnect();
    process.exit(1);
  }
}

fixFinalIssues();


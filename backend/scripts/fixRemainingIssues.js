// backend/scripts/fixRemainingIssues.js
// Fixes remaining issues: PlastoRend Market/Machine Grade, Heat Guard 1000, Reactive Stain categories
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

async function fixRemainingIssues() {
  try {
    await connect();
    console.log("🔧 FIXING REMAINING ISSUES");
    console.log("=".repeat(80));
    
    let fixed = 0;
    
    // 1. Fix PlastoRend 100/110 - create Market and Machine Grade products if needed
    console.log("📋 Fixing PlastoRend Market/Machine Grade...");
    
    const plastoRendProducts = [
      { baseName: "Ressi PlastoRend 100", sku: 50, unit: "KG" },
      { baseName: "Ressi PlastoRend 110", sku: 50, unit: "KG" },
    ];
    
    for (const productInfo of plastoRendProducts) {
      const existingProducts = await Product.find({
        name: { $regex: new RegExp(`^${productInfo.baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i') },
        company_id: "RESSICHEM",
        sku: String(productInfo.sku),
        unit: productInfo.unit
      });
      
      if (existingProducts.length === 1) {
        // Only one product exists - we need to create the other grade
        const existing = existingProducts[0];
        const currentPrice = existing.price;
        
        // Determine which grade this is and create the other
        if (currentPrice === 943 || currentPrice < 1248) {
          // This is Market Grade, create Machine Grade
          const machineGradeName = `${productInfo.baseName} (Machine Grade) - ${productInfo.sku} ${productInfo.unit}`;
          await Product.findByIdAndUpdate(existing._id, {
            $set: {
              name: `${productInfo.baseName} (Market Grade) - ${productInfo.sku} ${productInfo.unit}`,
              price: 943
            }
          });
          
          // Create Machine Grade
          const newProduct = new Product({
            name: machineGradeName,
            sku: String(productInfo.sku),
            unit: productInfo.unit,
            price: 1553,
            category: existing.category,
            company_id: "RESSICHEM",
            isActive: true,
            stock: existing.stock || 0
          });
          await newProduct.save();
          console.log(`✅ Created: ${machineGradeName}`);
          fixed++;
        } else if (currentPrice === 1553 || currentPrice > 1248) {
          // This is Machine Grade, create Market Grade
          const marketGradeName = `${productInfo.baseName} (Market Grade) - ${productInfo.sku} ${productInfo.unit}`;
          await Product.findByIdAndUpdate(existing._id, {
            $set: {
              name: `${productInfo.baseName} (Machine Grade) - ${productInfo.sku} ${productInfo.unit}`,
              price: 1553
            }
          });
          
          // Create Market Grade
          const newProduct = new Product({
            name: marketGradeName,
            sku: String(productInfo.sku),
            unit: productInfo.unit,
            price: 943,
            category: existing.category,
            company_id: "RESSICHEM",
            isActive: true,
            stock: existing.stock || 0
          });
          await newProduct.save();
          console.log(`✅ Created: ${marketGradeName}`);
          fixed++;
        } else {
          // Price doesn't match either - update to Market Grade and create Machine Grade
          await Product.findByIdAndUpdate(existing._id, {
            $set: {
              name: `${productInfo.baseName} (Market Grade) - ${productInfo.sku} ${productInfo.unit}`,
              price: 943
            }
          });
          
          const newProduct = new Product({
            name: `${productInfo.baseName} (Machine Grade) - ${productInfo.sku} ${productInfo.unit}`,
            sku: String(productInfo.sku),
            unit: productInfo.unit,
            price: 1553,
            category: existing.category,
            company_id: "RESSICHEM",
            isActive: true,
            stock: existing.stock || 0
          });
          await newProduct.save();
          console.log(`✅ Fixed and created: ${productInfo.baseName} Market & Machine Grade`);
          fixed += 2;
        }
      } else if (existingProducts.length === 2) {
        // Both exist - just fix prices
        const sorted = existingProducts.sort((a, b) => a.price - b.price);
        if (sorted[0].price !== 943) {
          await Product.findByIdAndUpdate(sorted[0]._id, {
            $set: {
              name: `${productInfo.baseName} (Market Grade) - ${productInfo.sku} ${productInfo.unit}`,
              price: 943
            }
          });
          console.log(`✅ Fixed: ${productInfo.baseName} Market Grade`);
          fixed++;
        }
        if (sorted[1].price !== 1553) {
          await Product.findByIdAndUpdate(sorted[1]._id, {
            $set: {
              name: `${productInfo.baseName} (Machine Grade) - ${productInfo.sku} ${productInfo.unit}`,
              price: 1553
            }
          });
          console.log(`✅ Fixed: ${productInfo.baseName} Machine Grade`);
          fixed++;
        }
      }
    }
    
    // 2. Fix Heat Guard 1000 - remove duplicates, keep only the correct one
    // The import script has 8 entries with same name but different prices
    // Database has only 1 with price 1156 - we'll keep that and remove duplicates from import script
    console.log("\n📋 Heat Guard 1000 - checking database...");
    const heatGuardProducts = await Product.find({
      name: "Heat Guard 1000 - 20 KG",
      company_id: "RESSICHEM"
    });
    
    if (heatGuardProducts.length > 1) {
      console.log(`⚠️  Found ${heatGuardProducts.length} Heat Guard 1000 products - keeping first, removing duplicates`);
      // Keep the first one, remove others
      for (let i = 1; i < heatGuardProducts.length; i++) {
        await Product.findByIdAndUpdate(heatGuardProducts[i]._id, { $set: { isActive: false } });
        console.log(`   Deactivated duplicate: ${heatGuardProducts[i].name}`);
        fixed++;
      }
    }
    
    // 3. Fix Reactive Stain color variants categories (already done, but verify)
    console.log("\n📋 Verifying Reactive Stain categories...");
    const reactiveStainVariants = await Product.find({
      name: { $regex: /^Reactive Stain - / },
      company_id: "RESSICHEM"
    });
    
    let categoryFixed = 0;
    for (const product of reactiveStainVariants) {
      if (product.category?.mainCategory !== "Decorative Concrete") {
        await Product.findByIdAndUpdate(product._id, { 
          $set: { "category.mainCategory": "Decorative Concrete" } 
        });
        categoryFixed++;
      }
    }
    
    if (categoryFixed > 0) {
      console.log(`✅ Fixed ${categoryFixed} Reactive Stain category mismatches`);
      fixed += categoryFixed;
    } else {
      console.log(`✅ All Reactive Stain categories are correct`);
    }
    
    console.log("\n" + "=".repeat(80));
    console.log("📊 FIX SUMMARY");
    console.log("=".repeat(80));
    console.log(`✅ Fixed: ${fixed} products/issues`);
    
    await disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error fixing issues:", error);
    await disconnect();
    process.exit(1);
  }
}

fixRemainingIssues();


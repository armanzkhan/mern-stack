// backend/scripts/restrictDatabaseToUserList.js
// Restricts database to ONLY products from user's specific list
// This is a comprehensive script that will deactivate all products NOT in the user's list

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

// NOTE: This is a placeholder - the actual user product list needs to be parsed from the user's message
// The user's list contains hundreds of products that need to be extracted and structured
// Format: { name: "Product Name", unit: "KG|LTR", sku: number, price: number, category: "Category Name" }

// For now, this script provides the framework
// The actual product list will be added after parsing the user's message

const USER_PRODUCT_LIST = [
  // This array will contain ALL products from the user's list
  // Each entry: { name, unit, sku, price, category }
  // Example:
  // { name: "Ressi PlastoRend 100", unit: "KG", sku: 1, price: 299, category: "Dry Mix Mortars / Premix Plasters" },
  // { name: "Ressi PlastoRend 100", unit: "KG", sku: 12, price: 2990, category: "Dry Mix Mortars / Premix Plasters" },
  // ... (hundreds more products)
];

// Create a Set for quick lookup: "Product Name - SKU UNIT"
const userProductKeys = new Set();
USER_PRODUCT_LIST.forEach(p => {
  const key = `${p.name} - ${p.sku} ${p.unit}`;
  userProductKeys.add(key);
});

async function restrictDatabase() {
  try {
    await connect();
    console.log("🔧 RESTRICTING DATABASE TO USER'S PRODUCT LIST");
    console.log("=".repeat(80));
    
    if (USER_PRODUCT_LIST.length === 0) {
      console.log("⚠️  WARNING: User product list is empty!");
      console.log("   Please populate USER_PRODUCT_LIST with products from the user's message");
      console.log("   Format: { name, unit, sku, price, category }");
      await disconnect();
      process.exit(1);
    }
    
    console.log(`📋 User wants ${USER_PRODUCT_LIST.length} products in the system\n`);
    
    // Get all active products
    const allProducts = await Product.find({ 
      company_id: "RESSICHEM", 
      isActive: true 
    });
    
    console.log(`📦 Current active products: ${allProducts.length}\n`);
    
    let deactivated = 0;
    let kept = 0;
    let created = 0;
    let updated = 0;
    
    // Step 1: Deactivate products NOT in user's list
    console.log("📋 Step 1: Deactivating products NOT in user's list...");
    for (const dbProduct of allProducts) {
      if (!userProductKeys.has(dbProduct.name)) {
        await Product.findByIdAndUpdate(dbProduct._id, { $set: { isActive: false } });
        deactivated++;
      } else {
        kept++;
      }
    }
    
    // Step 2: Create/update products from user's list
    console.log("\n📋 Step 2: Creating/updating products from user's list...");
    for (const userProduct of USER_PRODUCT_LIST) {
      const productName = `${userProduct.name} - ${userProduct.sku} ${userProduct.unit}`;
      const existing = await Product.findOne({
        name: productName,
        company_id: "RESSICHEM"
      });
      
      if (!existing) {
        // Create new product
        const newProduct = new Product({
          name: productName,
          sku: String(userProduct.sku),
          unit: userProduct.unit,
          price: userProduct.price,
          category: { mainCategory: userProduct.category },
          company_id: "RESSICHEM",
          isActive: true,
          stock: 0
        });
        await newProduct.save();
        created++;
      } else {
        // Update existing product
        let needsUpdate = false;
        const updates = {};
        
        if (existing.price !== userProduct.price) {
          updates.price = userProduct.price;
          needsUpdate = true;
        }
        if (existing.unit !== userProduct.unit) {
          updates.unit = userProduct.unit;
          needsUpdate = true;
        }
        if (String(existing.sku) !== String(userProduct.sku)) {
          updates.sku = String(userProduct.sku);
          needsUpdate = true;
        }
        if (existing.category?.mainCategory !== userProduct.category) {
          updates["category.mainCategory"] = userProduct.category;
          needsUpdate = true;
        }
        if (!existing.isActive) {
          updates.isActive = true;
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          await Product.findByIdAndUpdate(existing._id, { $set: updates });
          updated++;
        }
      }
    }
    
    console.log("\n" + "=".repeat(80));
    console.log("📊 RESTRICTION SUMMARY");
    console.log("=".repeat(80));
    console.log(`✅ Kept: ${kept} products`);
    console.log(`❌ Deactivated: ${deactivated} products (not in user's list)`);
    console.log(`➕ Created: ${created} products (from user's list)`);
    console.log(`🔄 Updated: ${updated} products (fixed data)`);
    console.log(`\n📦 Final active products: ${kept + created}`);
    console.log(`📋 User's list size: ${USER_PRODUCT_LIST.length}`);
    
    await disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error restricting database:", error);
    await disconnect();
    process.exit(1);
  }
}

restrictDatabase();


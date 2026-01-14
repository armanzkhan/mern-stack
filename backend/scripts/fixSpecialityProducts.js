// backend/scripts/fixSpecialityProducts.js
// Ensures that the Speciality Products category in the database
// exactly matches the provided list of products.

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

// Expected products from user's list - EXACT match required
const expectedProducts = [
  // Ressi Anchor Fix
  { name: "Ressi Anchor Fix", sku: 3.8, unit: "KG", price: 7245 },
  { name: "Ressi Anchor Fix", sku: 38, unit: "KG", price: 70680 },
  
  // Ressi NSG 710
  { name: "Ressi NSG 710", sku: 20, unit: "KG", price: 2100 },
  
  // Ressi Kerb Grout 102
  { name: "Ressi Kerb Grout 102", sku: 20, unit: "KG", price: 960 },
  
  // Ressi KerbFix 101
  { name: "Ressi KerbFix 101", sku: 20, unit: "KG", price: 900 },
  
  // Zepoxy LEEG 10
  { name: "Zepoxy LEEG 10", sku: 25, unit: "KG", price: 66000 },
  
  // Ressi EPO Anchor Pro 3:1
  { name: "Ressi EPO Anchor Pro 3:1", sku: 0.565, unit: "KG", price: 2340 },
];

async function fixSpecialityProducts() {
  try {
    await connect();
    console.log("🔧 Fixing Speciality Products...\n");

    // Step 1: Remove all existing products from the category
    console.log("Step 1: Removing all existing products from Speciality Products category...");
    const deleteResult = await Product.deleteMany({
      "category.mainCategory": "Speciality Products",
      company_id: "RESSICHEM"
    });
    console.log(`✅ Deleted ${deleteResult.deletedCount} existing products\n`);

    // Step 2: Create products with exact specifications
    console.log(`Step 2: Creating ${expectedProducts.length} products with exact specifications...`);
    const productsToInsert = expectedProducts.map(prod => ({
      name: `${prod.name} - ${prod.sku} ${prod.unit}`,
      fullName: `${prod.name} - ${prod.sku} ${prod.unit}`,
      description: prod.name,
      sku: prod.sku,
      unit: prod.unit,
      price: prod.price,
      category: { mainCategory: "Speciality Products" },
      company_id: "RESSICHEM",
      isActive: true,
      stockStatus: "in_stock"
    }));
    
    const createResult = await Product.insertMany(productsToInsert, { ordered: false });
    console.log(`✅ Created ${createResult.length} products\n`);

    // Step 3: Verify results
    console.log("Step 3: Verifying results...");
    const dbProducts = await Product.find({
      "category.mainCategory": "Speciality Products",
      company_id: "RESSICHEM"
    });

    console.log(`\n📊 Total products in database: ${dbProducts.length}`);
    console.log(`📊 Expected products: ${expectedProducts.length}`);

    if (dbProducts.length === expectedProducts.length) {
      console.log("\n✅ Correct products: " + expectedProducts.length);
      console.log("\n================================================================================");
      console.log("✅ SUCCESS! 100% match achieved!");
      console.log("================================================================================\n");
    } else {
      console.log("\n❌ Product count mismatch!");
      console.log("================================================================================");
      console.log("⚠️  Please review the output above.");
      console.log("================================================================================\n");
    }

  } catch (error) {
    console.error("❌ Error during fixing process:", error);
    process.exit(1);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  fixSpecialityProducts()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { fixSpecialityProducts };


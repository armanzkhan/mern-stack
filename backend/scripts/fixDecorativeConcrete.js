// backend/scripts/fixDecorativeConcrete.js
// Ensures that the Decorative Concrete category in the database
// exactly matches the provided list of products.

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

// Expected products from user's list - EXACT match required
const expectedProducts = [
  // Ressi Overlay
  { name: "Ressi Overlay", sku: 50, unit: "KG", price: 3220 },
  
  // Ressi Pigmented Hardener (with color codes)
  { name: "Ressi Pigmented Hardener", colorCode: "Pigmented H - 0001 (White)", sku: 20, unit: "KG", price: 4600 },
  { name: "Ressi Pigmented Hardener", colorCode: "Pigmented H- 3700 (Terracotta)", sku: 20, unit: "KG", price: 4600 },
  { name: "Ressi Pigmented Hardener", colorCode: "Pigmented H - 1600 (Yellow)", sku: 20, unit: "KG", price: 4600 },
  { name: "Ressi Pigmented Hardener", colorCode: "Pigmented H - 9000 (Grey)", sku: 20, unit: "KG", price: 4600 },
  { name: "Ressi Pigmented Hardener", colorCode: "Pigmented H - 5210 - 1 (Sky Blue)", sku: 20, unit: "KG", price: 4600 },
  { name: "Ressi Pigmented Hardener", colorCode: "Pigmented H - 9321 (Brown)", sku: 20, unit: "KG", price: 4600 },
  
  // Ressi Powder Release (with color codes)
  { name: "Ressi Powder Release", colorCode: "P Release - 0001 (White)", sku: 10, unit: "KG", price: 7906 },
  { name: "Ressi Powder Release", colorCode: "P Release - 3700 (Terracotta)", sku: 10, unit: "KG", price: 7906 },
  { name: "Ressi Powder Release", colorCode: "P Release - 1600 (Yellow)", sku: 10, unit: "KG", price: 7906 },
  { name: "Ressi Powder Release", colorCode: "P Release - 9000 (Grey)", sku: 10, unit: "KG", price: 7906 },
  { name: "Ressi Powder Release", colorCode: "P Release - 5210 - 1 (Sky Blue)", sku: 10, unit: "KG", price: 7906 },
  { name: "Ressi Powder Release", colorCode: "P Release - 9321 (Brown)", sku: 10, unit: "KG", price: 7906 },
  
  // Ressi Acid Itch
  { name: "Ressi Acid Itch", sku: 1, unit: "LTR", price: 592 },
  { name: "Ressi Acid Itch", sku: 5, unit: "LTR", price: 2243 },
  { name: "Ressi Acid Itch", sku: 10, unit: "LTR", price: 4370 },
  { name: "Ressi Acid Itch", sku: 15, unit: "LTR", price: 6383 },
  { name: "Ressi Acid Itch", sku: 25, unit: "LTR", price: 12420 },
  
  // Ressi Reactive Stain (with color codes)
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Honey White", sku: 1, unit: "LTR", price: 1898 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Honey White", sku: 5, unit: "LTR", price: 5750 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Honey White", sku: 10, unit: "LTR", price: 10925 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Honey White", sku: 15, unit: "LTR", price: 15525 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Honey White", sku: 25, unit: "LTR", price: 24438 },
  
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Nectarine", sku: 1, unit: "LTR", price: 1898 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Nectarine", sku: 5, unit: "LTR", price: 5750 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Nectarine", sku: 10, unit: "LTR", price: 10925 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Nectarine", sku: 15, unit: "LTR", price: 15525 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Nectarine", sku: 25, unit: "LTR", price: 24438 },
  
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Persimmon", sku: 1, unit: "LTR", price: 1898 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Persimmon", sku: 5, unit: "LTR", price: 5750 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Persimmon", sku: 10, unit: "LTR", price: 10925 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Persimmon", sku: 15, unit: "LTR", price: 15525 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Persimmon", sku: 25, unit: "LTR", price: 24438 },
  
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Rust Brown", sku: 1, unit: "LTR", price: 1898 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Rust Brown", sku: 5, unit: "LTR", price: 5750 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Rust Brown", sku: 10, unit: "LTR", price: 10925 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Rust Brown", sku: 15, unit: "LTR", price: 15525 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Rust Brown", sku: 25, unit: "LTR", price: 24438 },
  
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Storm Green", sku: 1, unit: "LTR", price: 1898 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Storm Green", sku: 5, unit: "LTR", price: 5750 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Storm Green", sku: 10, unit: "LTR", price: 10925 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Storm Green", sku: 15, unit: "LTR", price: 15525 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Storm Green", sku: 25, unit: "LTR", price: 24438 },
  
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Kahlua", sku: 1, unit: "LTR", price: 1898 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Kahlua", sku: 5, unit: "LTR", price: 5750 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Kahlua", sku: 10, unit: "LTR", price: 10925 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Kahlua", sku: 15, unit: "LTR", price: 15525 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Kahlua", sku: 25, unit: "LTR", price: 24438 },
  
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Citrus Green", sku: 1, unit: "LTR", price: 1898 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Citrus Green", sku: 5, unit: "LTR", price: 5750 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Citrus Green", sku: 10, unit: "LTR", price: 10925 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Citrus Green", sku: 15, unit: "LTR", price: 15525 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Citrus Green", sku: 25, unit: "LTR", price: 24438 },
  
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Cool Blue", sku: 1, unit: "LTR", price: 1898 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Cool Blue", sku: 5, unit: "LTR", price: 5750 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Cool Blue", sku: 10, unit: "LTR", price: 10925 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Cool Blue", sku: 15, unit: "LTR", price: 15525 },
  { name: "Ressi Reactive Stain", colorCode: "Reactive Stain - Cool Blue", sku: 25, unit: "LTR", price: 24438 },
  
  // Ressi Neutraliser
  { name: "Ressi Neutraliser", sku: 1, unit: "LTR", price: 920 },
  { name: "Ressi Neutraliser", sku: 5, unit: "LTR", price: 4543 },
  { name: "Ressi Neutraliser", sku: 10, unit: "LTR", price: 8855 },
  { name: "Ressi Neutraliser", sku: 15, unit: "LTR", price: 13110 },
  { name: "Ressi Neutraliser", sku: 25, unit: "LTR", price: 26220 },
  
  // Ressi Polymer
  { name: "Ressi Polymer", sku: 1, unit: "LTR", price: 3335 },
  { name: "Ressi Polymer", sku: 5, unit: "LTR", price: 16100 },
  { name: "Ressi Polymer", sku: 10, unit: "LTR", price: 31050 },
  { name: "Ressi Polymer", sku: 15, unit: "LTR", price: 44850 },
  { name: "Ressi Polymer", sku: 30, unit: "LTR", price: 86250 },
  
  // Microtopping System
  { name: "Microtopping System", colorCode: "MT Base Coat", sku: 20, unit: "KG", price: 1610 },
  { name: "Microtopping System", colorCode: "MT Top Coat", sku: 20, unit: "KG", price: 2300 },
  { name: "Microtopping System", colorCode: "MT - Polymer Liquid", sku: 1, unit: "KG", price: 3335 },
  { name: "Microtopping System", colorCode: "MT - Polymer Liquid", sku: 5, unit: "KG", price: 16100 },
  { name: "Microtopping System", colorCode: "MT - Polymer Liquid", sku: 10, unit: "KG", price: 31050 },
  { name: "Microtopping System", colorCode: "MT - Polymer Liquid", sku: 15, unit: "KG", price: 44850 },
  { name: "Microtopping System", colorCode: "MT - Polymer Liquid", sku: 25, unit: "KG", price: 86250 },
  
  // Terrazzo Retarder
  { name: "Terrazzo Retarder", sku: 1, unit: "LTR", price: 1254 },
  { name: "Terrazzo Retarder", sku: 5, unit: "LTR", price: 6153 },
  { name: "Terrazzo Retarder", sku: 10, unit: "LTR", price: 12075 },
  { name: "Terrazzo Retarder", sku: 15, unit: "LTR", price: 17768 },
  { name: "Terrazzo Retarder", sku: 25, unit: "LTR", price: 29038 },
];

async function fixDecorativeConcrete() {
  try {
    await connect();
    console.log("🔧 Fixing Decorative Concrete products...\n");

    // Step 1: Remove all existing products from the category
    console.log("Step 1: Removing all existing products from Decorative Concrete category...");
    const deleteResult = await Product.deleteMany({
      "category.mainCategory": "Decorative Concrete",
      company_id: "RESSICHEM"
    });
    console.log(`✅ Deleted ${deleteResult.deletedCount} existing products\n`);

    // Step 2: Create products with exact specifications
    console.log(`Step 2: Creating ${expectedProducts.length} products with exact specifications...`);
    const productsToInsert = expectedProducts.map(prod => {
      let productName = prod.name;
      if (prod.colorCode) {
        productName = `${prod.name} - ${prod.colorCode}`;
      }
      return {
        name: `${productName} - ${prod.sku} ${prod.unit}`,
        fullName: `${productName} - ${prod.sku} ${prod.unit}`,
        description: prod.colorCode ? `${prod.name} (${prod.colorCode})` : prod.name,
        sku: prod.sku,
        unit: prod.unit,
        price: prod.price,
        category: { mainCategory: "Decorative Concrete" },
        company_id: "RESSICHEM",
        isActive: true,
        stockStatus: "in_stock"
      };
    });
    
    const createResult = await Product.insertMany(productsToInsert, { ordered: false });
    console.log(`✅ Created ${createResult.length} products\n`);

    // Step 3: Verify results
    console.log("Step 3: Verifying results...");
    const dbProducts = await Product.find({
      "category.mainCategory": "Decorative Concrete",
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
  fixDecorativeConcrete()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { fixDecorativeConcrete };


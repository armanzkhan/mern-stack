// backend/scripts/removeExtraDecorativeConcrete.js
// Remove extra products that are not in the user's list
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

async function removeExtraProducts() {
  try {
    console.log("🧹 Removing Extra Decorative Concrete Products...\n");
    
    await connect();
    console.log("✅ Connected to database\n");
    
    // Get all products in the category
    const allProducts = await Product.find({
      "category.mainCategory": "Decorative Concrete",
      company_id: "RESSICHEM",
      isActive: true
    });
    
    // Expected product names
    const expectedNames = new Set([
      "Ressi Overlay - 50 KG",
      "Ressi Pigmented Hardener - 0001 - 20 KG",
      "Ressi Pigmented Hardener - 3700 - 20 KG",
      "Ressi Pigmented Hardener - 1600 - 20 KG",
      "Ressi Pigmented Hardener - 9000 - 20 KG",
      "Ressi Pigmented Hardener - 5210 - 1 - 20 KG",
      "Ressi Pigmented Hardener - 9321 - 20 KG",
      "Ressi Powder Release - 0001 - 10 KG",
      "Ressi Powder Release - 3700 - 10 KG",
      "Ressi Powder Release - 1600 - 10 KG",
      "Ressi Powder Release - 9000 - 10 KG",
      "Ressi Powder Release - 5210 - 1 - 10 KG",
      "Ressi Powder Release - 9321 - 10 KG",
      "Ressi Acid Itch - 1 LTR",
      "Ressi Acid Itch - 5 LTR",
      "Ressi Acid Itch - 10 LTR",
      "Ressi Acid Itch - 15 LTR",
      "Ressi Acid Itch - 25 LTR",
      "Ressi Reactive Stain - Honey White - 1 LTR",
      "Ressi Reactive Stain - Honey White - 5 LTR",
      "Ressi Reactive Stain - Honey White - 10 LTR",
      "Ressi Reactive Stain - Honey White - 15 LTR",
      "Ressi Reactive Stain - Honey White - 25 LTR",
      "Ressi Reactive Stain - Nectarine - 1 LTR",
      "Ressi Reactive Stain - Nectarine - 5 LTR",
      "Ressi Reactive Stain - Nectarine - 10 LTR",
      "Ressi Reactive Stain - Nectarine - 15 LTR",
      "Ressi Reactive Stain - Nectarine - 25 LTR",
      "Ressi Reactive Stain - Persimmon - 1 LTR",
      "Ressi Reactive Stain - Persimmon - 5 LTR",
      "Ressi Reactive Stain - Persimmon - 10 LTR",
      "Ressi Reactive Stain - Persimmon - 15 LTR",
      "Ressi Reactive Stain - Persimmon - 25 LTR",
      "Ressi Reactive Stain - Rust Brown - 1 LTR",
      "Ressi Reactive Stain - Rust Brown - 5 LTR",
      "Ressi Reactive Stain - Rust Brown - 10 LTR",
      "Ressi Reactive Stain - Rust Brown - 15 LTR",
      "Ressi Reactive Stain - Rust Brown - 25 LTR",
      "Ressi Reactive Stain - Storm Green - 1 LTR",
      "Ressi Reactive Stain - Storm Green - 5 LTR",
      "Ressi Reactive Stain - Storm Green - 10 LTR",
      "Ressi Reactive Stain - Storm Green - 15 LTR",
      "Ressi Reactive Stain - Storm Green - 25 LTR",
      "Ressi Reactive Stain - Kahlua - 1 LTR",
      "Ressi Reactive Stain - Kahlua - 5 LTR",
      "Ressi Reactive Stain - Kahlua - 10 LTR",
      "Ressi Reactive Stain - Kahlua - 15 LTR",
      "Ressi Reactive Stain - Kahlua - 25 LTR",
      "Ressi Reactive Stain - Citrus Green - 1 LTR",
      "Ressi Reactive Stain - Citrus Green - 5 LTR",
      "Ressi Reactive Stain - Citrus Green - 10 LTR",
      "Ressi Reactive Stain - Citrus Green - 15 LTR",
      "Ressi Reactive Stain - Citrus Green - 25 LTR",
      "Ressi Reactive Stain - Cool Blue - 1 LTR",
      "Ressi Reactive Stain - Cool Blue - 5 LTR",
      "Ressi Reactive Stain - Cool Blue - 10 LTR",
      "Ressi Reactive Stain - Cool Blue - 15 LTR",
      "Ressi Reactive Stain - Cool Blue - 25 LTR",
      "Ressi Neutraliser - 1 LTR",
      "Ressi Neutraliser - 5 LTR",
      "Ressi Neutraliser - 10 LTR",
      "Ressi Neutraliser - 15 LTR",
      "Ressi Neutraliser - 25 LTR",
      "Ressi Polymer - 1 LTR",
      "Ressi Polymer - 5 LTR",
      "Ressi Polymer - 10 LTR",
      "Ressi Polymer - 15 LTR",
      "Ressi Polymer - 30 LTR",
      "MT Base Coat - 20 KG",
      "MT Top Coat - 20 KG",
      "MT - Polymer Liquid - 1 KG",
      "MT - Polymer Liquid - 5 KG",
      "MT - Polymer Liquid - 10 KG",
      "MT - Polymer Liquid - 15 KG",
      "MT - Polymer Liquid - 25 KG",
      "Terrazzo Retarder - 1 LTR",
      "Terrazzo Retarder - 5 LTR",
      "Terrazzo Retarder - 10 LTR",
      "Terrazzo Retarder - 15 LTR",
      "Terrazzo Retarder - 25 LTR",
    ]);
    
    // Find products to remove
    const productsToRemove = allProducts.filter(p => !expectedNames.has(p.name));
    
    if (productsToRemove.length > 0) {
      const ids = productsToRemove.map(p => p._id);
      const result = await Product.deleteMany({ _id: { $in: ids } });
      console.log(`✅ Removed ${result.deletedCount} extra products`);
      productsToRemove.forEach(p => {
        console.log(`   - ${p.name}`);
      });
    } else {
      console.log("✅ No extra products found");
    }
    
    console.log(`\n📊 Remaining Decorative Concrete products: ${allProducts.length - productsToRemove.length}\n`);
    console.log("=".repeat(80));
    console.log("CLEANUP COMPLETE");
    console.log("=".repeat(80));
    
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  removeExtraProducts()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { removeExtraProducts };


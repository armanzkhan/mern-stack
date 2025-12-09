// backend/scripts/updateProductStock.js
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

async function updateProductStock() {
  try {
    await connect();
    console.log("📦 Updating product stock levels...\n");

    // Get all products
    const products = await Product.find({
      company_id: "RESSICHEM",
      isActive: true
    }).select('name stock');

    console.log(`📊 Found ${products.length} products to update`);

    // Count products with stock = 0
    const zeroStockCount = products.filter(p => p.stock === 0 || !p.stock).length;
    console.log(`   Products with stock = 0: ${zeroStockCount}`);

    // Update all products to have a default stock value
    // You can set this to any default value - I'll use 100 as a default
    // If you want to set specific stock values, you can modify this script
    const defaultStock = 100;

    console.log(`\n🔄 Updating products to have stock = ${defaultStock}...`);

    const updateResult = await Product.updateMany(
      {
        company_id: "RESSICHEM",
        isActive: true,
        $or: [
          { stock: { $exists: false } },
          { stock: 0 },
          { stock: null }
        ]
      },
      {
        $set: { stock: defaultStock }
      }
    );

    console.log(`✅ Updated ${updateResult.modifiedCount} products`);

    // Verify update
    const updatedProducts = await Product.find({
      company_id: "RESSICHEM",
      isActive: true
    }).select('name stock');

    const inStockCount = updatedProducts.filter(p => p.stock > 0).length;
    const outOfStockCount = updatedProducts.filter(p => p.stock === 0).length;

    console.log(`\n📊 Stock Status Summary:`);
    console.log(`   In Stock (stock > 0): ${inStockCount}`);
    console.log(`   Out of Stock (stock = 0): ${outOfStockCount}`);

    console.log(`\n✅ Product stock updated successfully!`);
    console.log(`   All products now have stock = ${defaultStock}`);
    console.log(`   Products will show as "In Stock" on frontend`);

  } catch (error) {
    console.error("❌ Error updating product stock:", error);
    process.exit(1);
  } finally {
    await disconnect();
  }
}

// Run update
if (require.main === module) {
  updateProductStock()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { updateProductStock };


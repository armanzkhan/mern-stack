require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

(async () => {
  try {
    await connect();
    console.log("🔍 Final Verification: Dry Mix Mortars / Premix Plasters\n");
    
    const dbProducts = await Product.find({
      "category.mainCategory": "Dry Mix Mortars / Premix Plasters",
      company_id: "RESSICHEM"
    }).sort({ name: 1, sku: 1 });
    
    console.log(`📊 Total products in database: ${dbProducts.length}\n`);
    
    // Group by product name
    const productGroups = {};
    dbProducts.forEach(p => {
      const baseName = p.name.split(' - ')[0];
      if (!productGroups[baseName]) {
        productGroups[baseName] = [];
      }
      productGroups[baseName].push({
        name: p.name,
        sku: p.sku,
        unit: p.unit,
        price: p.price
      });
    });
    
    console.log("=".repeat(80));
    console.log("PRODUCT SUMMARY BY NAME");
    console.log("=".repeat(80));
    
    Object.keys(productGroups).sort().forEach(productName => {
      const variants = productGroups[productName];
      console.log(`\n${productName}: ${variants.length} variant(s)`);
      variants.forEach(v => {
        const priceStr = v.price === 0 ? "0 (no price)" : v.price.toLocaleString();
        console.log(`  - ${v.name} | SKU: ${v.sku} ${v.unit} | Price: ${priceStr}`);
      });
    });
    
    // Check for products with price 0
    const noPriceProducts = dbProducts.filter(p => p.price === 0);
    if (noPriceProducts.length > 0) {
      console.log("\n" + "=".repeat(80));
      console.log("PRODUCTS WITH NO PRICE (Price = 0)");
      console.log("=".repeat(80));
      noPriceProducts.forEach(p => {
        console.log(`  - ${p.name} | SKU: ${p.sku} ${p.unit}`);
      });
    }
    
    console.log("\n" + "=".repeat(80));
    console.log("✅ VERIFICATION COMPLETE");
    console.log("=".repeat(80));
    console.log(`Total products: ${dbProducts.length}`);
    console.log(`Products with price 0: ${noPriceProducts.length}`);
    console.log(`Unique product names: ${Object.keys(productGroups).length}`);
    console.log("=".repeat(80));
    
    await disconnect();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
})();


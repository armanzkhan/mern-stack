// Quick script to check Epoxy products in database
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

async function checkEpoxyProducts() {
  try {
    await connect();
    console.log("🔍 Checking Epoxy Floorings & Coatings products in database...\n");

    const products = await Product.find({
      "category.mainCategory": "Epoxy Floorings & Coatings",
      company_id: "RESSICHEM",
      isActive: true
    }).sort({ name: 1 });

    console.log(`📊 Found ${products.length} products in database\n`);
    
    // Group by product name
    const grouped = {};
    products.forEach(p => {
      const baseName = p.name.split(' - ')[0];
      if (!grouped[baseName]) {
        grouped[baseName] = [];
      }
      grouped[baseName].push({
        name: p.name,
        sku: p.sku,
        price: p.price,
        unit: p.unit
      });
    });

    console.log("Products by name:\n");
    Object.keys(grouped).sort().forEach(name => {
      console.log(`\n${name}:`);
      grouped[name].forEach(p => {
        console.log(`  - SKU: ${p.sku}, Price: ${p.price}, Unit: ${p.unit}`);
      });
    });

    console.log(`\n\n✅ Total: ${products.length} products`);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await disconnect();
  }
}

checkEpoxyProducts();


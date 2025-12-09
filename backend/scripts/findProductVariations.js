// backend/scripts/findProductVariations.js
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

async function findProduct() {
  try {
    await connect();
    
    // Search for variations
    const products = await Product.find({
      company_id: "RESSICHEM",
      sku: "50",
      unit: "KG",
      $or: [
        { name: { $regex: /PlastoRend 100.*0001/i } },
        { name: { $regex: /100.*0001/i } }
      ]
    });
    
    console.log(`Found ${products.length} products:`);
    products.forEach(p => {
      console.log(`  - ${p.name} | SKU: ${p.sku} | Unit: ${p.unit} | Price: ${p.price}`);
    });
    
    await disconnect();
  } catch (error) {
    console.error('Error:', error);
    await disconnect();
    process.exit(1);
  }
}

findProduct();


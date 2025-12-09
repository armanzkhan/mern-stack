// backend/scripts/checkProductDirectly.js
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

async function checkProduct() {
  try {
    await connect();
    
    const product = await Product.findOne({
      name: "Ressi PlastoRend 100 - 0001",
      company_id: "RESSICHEM",
      sku: "50",
      unit: "KG"
    });
    
    if (product) {
      console.log(`Found product: ${product.name}`);
      console.log(`SKU: ${product.sku}, Unit: ${product.unit}`);
      console.log(`Price: ${product.price}`);
      console.log(`Expected: 5175`);
      console.log(`Match: ${product.price === 5175 ? '✅ YES' : '❌ NO'}`);
    } else {
      console.log('Product not found');
    }
    
    await disconnect();
  } catch (error) {
    console.error('Error:', error);
    await disconnect();
    process.exit(1);
  }
}

checkProduct();


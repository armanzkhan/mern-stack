// backend/scripts/fixProductNameSpacing.js
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

async function fixProductNameSpacing() {
  try {
    await connect();
    console.log('🔧 Fixing Product Name Spacing...\n');
    
    // Find the product with spacing issue
    const product = await Product.findOne({
      company_id: 'RESSICHEM',
      name: { $regex: /RPR.*120.*C.*0001.*B.*Brilliant/i }
    });
    
    if (product) {
      console.log(`Found product: ${product.name}`);
      console.log(`Current SKU: ${product.sku} ${product.unit} | Price: PKR ${product.price}`);
      
      // Update to match exact format from user's list: "RPR 120 C- 0001 B (Brilliant White) - 50 KG"
      const correctName = "RPR 120 C- 0001 B (Brilliant White) - 50 KG";
      
      product.name = correctName;
      await product.save();
      
      console.log(`✅ Updated product name to: ${product.name}`);
      console.log('\n✅ Product name spacing fixed!');
    } else {
      console.log('❌ Product not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  fixProductNameSpacing();
}

module.exports = fixProductNameSpacing;


// backend/scripts/checkRessiTA210.js
// Check what SKUs Ressi TA 210 has in the database
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

async function checkRessiTA210() {
  try {
    await connect();
    console.log('🔍 Checking Ressi TA 210 products in database...\n');
    
    const products = await Product.find({
      name: { $regex: /Ressi TA 210/i },
      company_id: "RESSICHEM"
    }).select('name sku unit price category').sort('sku');
    
    console.log(`Found ${products.length} products:\n`);
    products.forEach(p => {
      console.log(`  - ${p.name}`);
      console.log(`    SKU: ${p.sku} ${p.unit}`);
      console.log(`    Price: ${p.price} PKR`);
      console.log(`    Category: ${p.category?.mainCategory || 'N/A'}`);
      console.log('');
    });
    
    await disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    await disconnect();
    process.exit(1);
  }
}

checkRessiTA210();


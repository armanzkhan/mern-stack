require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

const correctPrices = {
  "1": 1513,
  "5": 7500,
  "10": 14750,
  "15": 21750,
  "25": 35625,
  "200": 280000
};

(async () => {
  await connect();
  console.log("🔧 Fixing Silblock prices...\n");
  
  const silblock = await Product.find({ 
    name: { $regex: 'Silblock', $options: 'i' },
    'category.mainCategory': 'Building Care and Maintenance',
    company_id: 'RESSICHEM'
  });
  
  let updated = 0;
  console.log(`Found ${silblock.length} Silblock products:\n`);
  
  for (const product of silblock) {
    // Extract numeric SKU from "1 LTR" format
    const skuStr = String(product.sku).trim();
    console.log(`  Product: ${product.name} - SKU: "${skuStr}" (type: ${typeof product.sku}) - Price: ${product.price}`);
    
    const skuMatch = skuStr.match(/^(\d+(?:\.\d+)?)/);
    const sku = skuMatch ? skuMatch[1] : skuStr.replace(/\s*LTR\s*/i, '').trim();
    console.log(`    Extracted SKU: "${sku}"`);
    
    const expectedPrice = correctPrices[sku];
    console.log(`    Expected price: ${expectedPrice || 'NOT FOUND'}`);
    
    if (expectedPrice) {
      if (Math.abs(product.price - expectedPrice) > 0.01) {
        await Product.findByIdAndUpdate(product._id, { price: expectedPrice });
        console.log(`    ✅ Updated: ${product.price} → ${expectedPrice}`);
        updated++;
      } else {
        console.log(`    ✓ Already correct`);
      }
    }
    console.log('');
  }
  
  console.log(`\n📊 Updated ${updated} products\n`);
  await disconnect();
})();


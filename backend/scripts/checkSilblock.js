require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

(async () => {
  await connect();
  const silblock = await Product.find({ 
    name: { $regex: 'Silblock', $options: 'i' }, 
    'category.mainCategory': 'Building Care and Maintenance' 
  }).sort({ sku: 1 });
  
  console.log('Silblock products in database:');
  silblock.forEach(p => console.log(`  ${p.name} - SKU: ${p.sku} ${p.unit} - Price: ${p.price}`));
  console.log(`\nTotal: ${silblock.length} products`);
  
  await disconnect();
})();


require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

(async () => {
  await connect();
  const product = await Product.findOne({ 
    name: { $regex: 'Ressi EPO Anchor Pro', $options: 'i' }, 
    'category.mainCategory': 'Specialty Products' 
  });
  
  if (product) {
    console.log('✅ Product found:');
    console.log(`   Name: ${product.name}`);
    console.log(`   SKU: ${product.sku} ${product.unit}`);
    console.log(`   Price: PKR ${product.price}`);
    console.log(`   Category: ${product.category.mainCategory}`);
  } else {
    console.log('❌ Product not found');
  }
  
  await disconnect();
})();


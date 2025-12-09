// backend/scripts/checkProductNames.js
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

async function checkProductNames() {
  try {
    await connect();
    console.log('🔍 Checking Product Names...\n');
    
    // Check products matching "100 - 0001"
    console.log('📝 Products matching "100 - 0001":');
    const products100 = await Product.find({ 
      company_id: 'RESSICHEM', 
      name: { $regex: /100.*0001/i } 
    }).limit(10).select('name sku price unit category');
    
    products100.forEach(p => {
      const category = typeof p.category === 'object' ? p.category.mainCategory : p.category;
      console.log(`- ${p.name}`);
      console.log(`  SKU: ${p.sku} | Unit: ${p.unit} | Price: PKR ${p.price}`);
      console.log(`  Category: ${category || 'N/A'}`);
      console.log('');
    });
    
    // Check products matching "110 - 0001"
    console.log('📝 Products matching "110 - 0001":');
    const products110 = await Product.find({ 
      company_id: 'RESSICHEM', 
      name: { $regex: /110.*0001/i } 
    }).limit(5).select('name sku price unit category');
    
    products110.forEach(p => {
      const category = typeof p.category === 'object' ? p.category.mainCategory : p.category;
      console.log(`- ${p.name}`);
      console.log(`  SKU: ${p.sku} | Unit: ${p.unit} | Price: PKR ${p.price}`);
      console.log(`  Category: ${category || 'N/A'}`);
      console.log('');
    });
    
    // Check products matching "RPR 120 C"
    console.log('📝 Products matching "RPR 120 C":');
    const products120 = await Product.find({ 
      company_id: 'RESSICHEM', 
      name: { $regex: /RPR.*120.*C/i } 
    }).limit(5).select('name sku price unit category');
    
    products120.forEach(p => {
      const category = typeof p.category === 'object' ? p.category.mainCategory : p.category;
      console.log(`- ${p.name}`);
      console.log(`  SKU: ${p.sku} | Unit: ${p.unit} | Price: PKR ${p.price}`);
      console.log(`  Category: ${category || 'N/A'}`);
      console.log('');
    });
    
    // Check products matching "810 - 0001"
    console.log('📝 Products matching "810 - 0001":');
    const products810 = await Product.find({ 
      company_id: 'RESSICHEM', 
      name: { $regex: /810.*0001/i } 
    }).limit(5).select('name sku price unit category');
    
    products810.forEach(p => {
      const category = typeof p.category === 'object' ? p.category.mainCategory : p.category;
      console.log(`- ${p.name}`);
      console.log(`  SKU: ${p.sku} | Unit: ${p.unit} | Price: PKR ${p.price}`);
      console.log(`  Category: ${category || 'N/A'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  checkProductNames();
}

module.exports = checkProductNames;


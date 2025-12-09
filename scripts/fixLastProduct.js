// backend/scripts/fixLastProduct.js
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

async function fixLastProduct() {
  try {
    await connect();
    console.log('🔍 Checking for RPR 120 C products...\n');
    
    // Check existing RPR 120 C products
    const products = await Product.find({ 
      company_id: 'RESSICHEM', 
      name: { $regex: /RPR.*120.*C.*0001.*B/i } 
    }).select('name sku price unit category');
    
    console.log('Found products:');
    products.forEach(p => {
      console.log(`- ${p.name} | SKU: ${p.sku} ${p.unit} | Price: PKR ${p.price}`);
    });
    
    // Check if the exact product exists
    const exactName = "RPR 120 C - 0001 B (Brilliant White) - 50 KG";
    const existing = await Product.findOne({
      company_id: 'RESSICHEM',
      name: exactName
    });
    
    if (existing) {
      console.log(`\n✅ Product exists: ${existing.name}`);
      console.log(`   SKU: ${existing.sku} ${existing.unit} | Price: PKR ${existing.price}`);
    } else {
      console.log(`\n❌ Product not found: ${exactName}`);
      console.log('Creating product...');
      
      const product = await Product.create({
        name: exactName,
        description: "RPR 120 C - 0001 B (Brilliant White)",
        price: 3335,
        unit: "KG",
        sku: "50",
        category: {
          mainCategory: "Dry Mix Mortars / Premix Plasters",
          subCategory: "PlastoRend 120 C"
        },
        company_id: 'RESSICHEM',
        stock: 0,
        minStock: 0,
        isActive: true
      });
      
      console.log(`✅ Created: ${product.name} - PKR ${product.price}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  fixLastProduct();
}

module.exports = fixLastProduct;


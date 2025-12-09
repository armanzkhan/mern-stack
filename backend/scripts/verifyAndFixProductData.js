// backend/scripts/verifyAndFixProductData.js
// Script to verify and fix product data to match the price list exactly
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

/**
 * Product data from your price list - needs to be verified and updated
 * This is a template - you need to fill in the correct data for all products
 */
const correctProductData = {
  "Ressi TA 210": [
    // According to your price list, Ressi TA 210 should only have SKU 20
    // { name: "Ressi TA 210", unit: "KG", sku: 20, price: TBD, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Tile Adhesives" } }
  ],
  // Add more products here as you verify them
};

async function verifyAndFixProductData() {
  try {
    await connect();
    console.log('🔍 Verifying and Fixing Product Data...\n');
    
    // Find all products with "Ressi TA 210" in name
    const ta210Products = await Product.find({
      name: { $regex: /Ressi TA 210/i },
      company_id: "RESSICHEM"
    });
    
    console.log(`Found ${ta210Products.length} products with "Ressi TA 210":`);
    ta210Products.forEach(p => {
      console.log(`  - ${p.name} | SKU: ${p.sku} | Unit: ${p.unit} | Price: ${p.price}`);
    });
    
    console.log('\n⚠️  According to your price list:');
    console.log('  - "Ressi TA 210" should only have SKU 20');
    console.log('  - Current database has SKU 1 and SKU 15 (INCORRECT)');
    console.log('\n📝 Action needed:');
    console.log('  1. Provide the correct price for "Ressi TA 210" with SKU 20');
    console.log('  2. Update the import script with correct data');
    console.log('  3. Delete incorrect SKU variants from database');
    console.log('  4. Re-import with correct data');
    
    // Example: How to delete incorrect variants
    console.log('\n💡 To fix "Ressi TA 210":');
    console.log('  - Delete: "Ressi TA 210 - 1 KG" (SKU: 1)');
    console.log('  - Delete: "Ressi TA 210 - 15 KG" (SKU: 15)');
    console.log('  - Add: "Ressi TA 210 - 20 KG" (SKU: 20) with correct price');
    
    await disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    await disconnect();
    process.exit(1);
  }
}

// Run the verification
verifyAndFixProductData();


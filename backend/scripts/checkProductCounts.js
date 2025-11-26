// backend/scripts/checkProductCounts.js
// Check product counts and find any discrepancies
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

const { 
  dryMixProducts, 
  buildingCareProducts, 
  concreteAdmixturesProducts, 
  tilingProducts,
  decorativeConcreteProducts,
  specialtyProducts,
  epoxyFlooringsProducts,
  epoxyAdhesivesProducts
} = require('./fullCSVProductList');

const allCSVProducts = [
  ...dryMixProducts,
  ...buildingCareProducts,
  ...concreteAdmixturesProducts,
  ...tilingProducts,
  ...decorativeConcreteProducts,
  ...specialtyProducts,
  ...epoxyFlooringsProducts,
  ...epoxyAdhesivesProducts,
];

async function checkProductCounts() {
  try {
    await connect();
    console.log("🔍 CHECKING PRODUCT COUNTS");
    console.log("=".repeat(80));
    
    const csvProductNames = new Set(allCSVProducts.map(p => p.dbName));
    console.log(`📋 CSV contains ${csvProductNames.size} unique products\n`);
    
    const allActiveProducts = await Product.find({
      company_id: "RESSICHEM",
      isActive: true
    });
    
    console.log(`📦 Database contains ${allActiveProducts.length} active products\n`);
    
    // Check for duplicates in database
    const dbProductNames = allActiveProducts.map(p => p.name);
    const uniqueDbNames = new Set(dbProductNames);
    console.log(`📦 Database contains ${uniqueDbNames.size} unique product names\n`);
    
    if (dbProductNames.length !== uniqueDbNames.size) {
      console.log("⚠️  Found duplicates in database:");
      const duplicates = dbProductNames.filter((name, index) => dbProductNames.indexOf(name) !== index);
      const uniqueDuplicates = [...new Set(duplicates)];
      uniqueDuplicates.forEach(name => {
        const count = dbProductNames.filter(n => n === name).length;
        console.log(`   - ${name}: ${count} occurrences`);
      });
    }
    
    // Check which products are in CSV but not matching exactly
    const matchedProducts = [];
    const unmatchedProducts = [];
    
    for (const product of allActiveProducts) {
      if (csvProductNames.has(product.name)) {
        matchedProducts.push(product.name);
      } else {
        unmatchedProducts.push(product);
      }
    }
    
    console.log(`\n✅ Matched: ${matchedProducts.length} products`);
    console.log(`❌ Unmatched: ${unmatchedProducts.length} products\n`);
    
    if (unmatchedProducts.length > 0) {
      console.log("Unmatched products:");
      unmatchedProducts.forEach(p => {
        console.log(`   - ${p.name} (Price: ${p.price}, Category: ${p.category?.mainCategory || 'N/A'})`);
      });
    }
    
    // Check for products in CSV but not in database
    const missingFromDb = [];
    for (const csvProduct of allCSVProducts) {
      const found = allActiveProducts.find(p => p.name === csvProduct.dbName);
      if (!found) {
        missingFromDb.push(csvProduct.dbName);
      }
    }
    
    if (missingFromDb.length > 0) {
      console.log(`\n⚠️  Products in CSV but not in database (${missingFromDb.length}):`);
      missingFromDb.slice(0, 10).forEach(name => {
        console.log(`   - ${name}`);
      });
      if (missingFromDb.length > 10) {
        console.log(`   ... and ${missingFromDb.length - 10} more`);
      }
    }
    
    await disconnect();
  } catch (error) {
    console.error("❌ Error:", error);
    await disconnect();
    process.exit(1);
  }
}

checkProductCounts();


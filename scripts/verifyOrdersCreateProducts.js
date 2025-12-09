// Verification script to check if products on orders/create page match the import list
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

// Read the import script to get expected products
const fs = require('fs');
const path = require('path');

async function verifyProducts() {
  try {
    await connect();
    console.log('✅ Connected to database\n');

    // Get all products from database
    const dbProducts = await Product.find({ company_id: 'RESSICHEM' }).lean();
    console.log(`📊 Products in database: ${dbProducts.length}`);

    // Read import script
    const importScriptPath = path.join(__dirname, 'importProductsFromExcel.js');
    const importScriptContent = fs.readFileSync(importScriptPath, 'utf8');

    // Extract product data from import script
    const productDataMatch = importScriptContent.match(/const productData = \[([\s\S]*?)\];/);
    if (!productDataMatch) {
      console.error('❌ Could not find productData in import script');
      await disconnect();
      return;
    }

    // Count products in import script (simple count of product objects)
    const productEntries = importScriptContent.match(/\{[\s\S]*?name:\s*["'][^"']+["'][\s\S]*?\}/g) || [];
    const importProductCount = productEntries.length;
    console.log(`📋 Products in import script: ${importProductCount}\n`);

    // Check for unique product names in import script
    const importProductNames = new Set();
    productEntries.forEach(entry => {
      const nameMatch = entry.match(/name:\s*["']([^"']+)["']/);
      if (nameMatch) {
        importProductNames.add(nameMatch[1]);
      }
    });
    console.log(`🔍 Unique product names in import script: ${importProductNames.size}`);

    // Check for unique product names in database
    const dbProductNames = new Set(dbProducts.map(p => p.name));
    console.log(`🔍 Unique product names in database: ${dbProductNames.size}\n`);

    // Compare product names
    const missingInDb = [];
    const extraInDb = [];
    
    importProductNames.forEach(name => {
      if (!dbProductNames.has(name)) {
        missingInDb.push(name);
      }
    });

    dbProductNames.forEach(name => {
      if (!importProductNames.has(name)) {
        extraInDb.push(name);
      }
    });

    console.log(`\n📊 Comparison Results:`);
    console.log(`   Missing in database: ${missingInDb.length}`);
    if (missingInDb.length > 0) {
      console.log(`   Missing products (first 10):`);
      missingInDb.slice(0, 10).forEach(name => console.log(`     - ${name}`));
    }

    console.log(`   Extra in database: ${extraInDb.length}`);
    if (extraInDb.length > 0) {
      console.log(`   Extra products (first 10):`);
      extraInDb.slice(0, 10).forEach(name => console.log(`     - ${name}`));
    }

    // Check product count by category
    console.log(`\n📂 Products by Category:`);
    const categoryCounts = {};
    dbProducts.forEach(product => {
      let categoryName = 'Unknown';
      if (typeof product.category === 'string') {
        categoryName = product.category;
      } else if (product.category && product.category.mainCategory) {
        categoryName = product.category.mainCategory;
      } else if (product.category && product.category.name) {
        categoryName = product.category.name;
      }
      categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
    });

    Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count} products`);
    });

    // Check if all products have required fields
    console.log(`\n🔍 Field Completeness Check:`);
    const productsWithoutPrice = dbProducts.filter(p => !p.price || p.price === 0);
    const productsWithoutSku = dbProducts.filter(p => !p.sku || p.sku === '');
    const productsWithoutStock = dbProducts.filter(p => p.stock === undefined || p.stock === null);

    console.log(`   Products without price (or price = 0): ${productsWithoutPrice.length}`);
    console.log(`   Products without SKU: ${productsWithoutSku.length}`);
    console.log(`   Products without stock: ${productsWithoutStock.length}`);

    // Summary
    console.log(`\n✅ Summary:`);
    console.log(`   Database products: ${dbProducts.length}`);
    console.log(`   Import script entries: ${importProductCount}`);
    console.log(`   Unique names in import: ${importProductNames.size}`);
    console.log(`   Unique names in database: ${dbProductNames.size}`);
    console.log(`   Match status: ${missingInDb.length === 0 && extraInDb.length === 0 ? '✅ All products match' : '⚠️ Mismatch detected'}`);

    // Frontend API limit check
    console.log(`\n🌐 Frontend API Check:`);
    console.log(`   Current API limit request: 1000 (from orders/create page)`);
    console.log(`   Products in database: ${dbProducts.length}`);
    if (dbProducts.length > 1000) {
      console.log(`   ⚠️ WARNING: Database has ${dbProducts.length} products but frontend only requests 1000`);
      console.log(`   💡 Recommendation: Increase limit to ${dbProducts.length + 100} in orders/create/page.tsx`);
    } else {
      console.log(`   ✅ Current limit is sufficient`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await disconnect();
  }
}

verifyProducts();


// backend/scripts/checkAllSKUAndCategories.js
// Check all products for SKU format and category issues
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

async function checkAllProducts() {
  try {
    await connect();
    console.log('🔍 Checking All Products for SKU and Category Issues...\n');
    
    // Get all products
    const allProducts = await Product.find({ company_id: "RESSICHEM", isActive: true })
      .select('name sku unit price category')
      .sort('name');
    
    console.log(`Total products: ${allProducts.length}\n`);
    
    // Check for decimal SKUs
    const decimalSKUs = allProducts.filter(p => {
      const sku = String(p.sku);
      return sku.includes('.') && !sku.endsWith('.0');
    });
    
    console.log(`📊 Products with decimal SKUs: ${decimalSKUs.length}`);
    if (decimalSKUs.length > 0) {
      console.log('Sample decimal SKU products:');
      decimalSKUs.slice(0, 10).forEach(p => {
        console.log(`   - ${p.name} | SKU: ${p.sku} ${p.unit} | Category: ${p.category?.mainCategory || 'N/A'}`);
      });
      if (decimalSKUs.length > 10) {
        console.log(`   ... and ${decimalSKUs.length - 10} more`);
      }
      console.log('');
    }
    
    // Check category distribution
    const categoryCounts = {};
    allProducts.forEach(p => {
      const category = p.category?.mainCategory || 'No Category';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    console.log(`📊 Category Distribution:`);
    Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).forEach(([category, count]) => {
      console.log(`   - ${category}: ${count} products`);
    });
    console.log('');
    
    // Check for products with missing or incorrect categories
    const noCategory = allProducts.filter(p => !p.category || !p.category.mainCategory);
    if (noCategory.length > 0) {
      console.log(`⚠️  Products without category: ${noCategory.length}`);
      noCategory.slice(0, 10).forEach(p => {
        console.log(`   - ${p.name} | SKU: ${p.sku} ${p.unit}`);
      });
      if (noCategory.length > 10) {
        console.log(`   ... and ${noCategory.length - 10} more`);
      }
      console.log('');
    }
    
    // Check for specific SKU format issues
    const skuFormatIssues = [];
    allProducts.forEach(p => {
      const sku = String(p.sku);
      // Check for common issues
      if (sku === 'undefined' || sku === 'null' || sku === '') {
        skuFormatIssues.push({ name: p.name, sku, issue: 'Empty or invalid SKU' });
      }
    });
    
    if (skuFormatIssues.length > 0) {
      console.log(`⚠️  SKU Format Issues: ${skuFormatIssues.length}`);
      skuFormatIssues.slice(0, 10).forEach(p => {
        console.log(`   - ${p.name}: ${p.issue} (SKU: "${p.sku}")`);
      });
      if (skuFormatIssues.length > 10) {
        console.log(`   ... and ${skuFormatIssues.length - 10} more`);
      }
      console.log('');
    }
    
    // Sample products from each category
    console.log(`📋 Sample Products from Each Category:`);
    const categories = Object.keys(categoryCounts);
    categories.forEach(category => {
      const sampleProducts = allProducts.filter(p => p.category?.mainCategory === category).slice(0, 3);
      console.log(`\n   ${category}:`);
      sampleProducts.forEach(p => {
        console.log(`     - ${p.name} | SKU: ${p.sku} ${p.unit} | Price: ${p.price}`);
      });
    });
    
    await disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    await disconnect();
    process.exit(1);
  }
}

// Run check
checkAllProducts();

